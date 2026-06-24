# Patrones de Resiliencia: Retry y Circuit Breaker

## Descripción General

Este documento describe la implementación de dos patrones críticos de resiliencia en el backend de EventosVivos:

1. **Retry Pattern (Patrón de Reintento)**: Reintentos automáticos con backoff exponencial y jitter
2. **Circuit Breaker Pattern (Patrón del Disyuntor)**: Prevención de fallos en cascada bloqueando llamadas a servicios degradados

---

## Arquitectura

### Componentes Nuevos

#### 1. `IPaymentGatewayService` (Application/Interfaces)
Interfaz que define el contrato para confirmar pagos de reservas:
```csharp
public interface IPaymentGatewayService
{
    Task<string> ConfirmarPagoAsync(Guid reservaId, CancellationToken ct = default);
}
```

#### 2. `HttpPaymentGatewayService` (Infrastructure/Services)
Implementación concreta que:
- Realiza una llamada HTTP POST a `/payments/confirm`
- Deserializa el JSON response para extraer el `codigoConfirmacion`
- Lanza `InvalidOperationException` si la respuesta no es exitosa o si falta el código

#### 3. `FakePaymentGatewayService` (Tests/Fakes)
Stub para tests de integración que devuelve `"EV-FAKE00"` sin hacer llamadas reales.

---

## Políticas de Resiliencia

### Configuración en `Program.cs`

```csharp
builder.Services.AddHttpClient<IPaymentGatewayService, HttpPaymentGatewayService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["PaymentGateway:BaseUrl"] 
        ?? "https://api.pagos.ejemplo.com");
    client.Timeout = TimeSpan.FromSeconds(10);
})
.AddStandardResilienceHandler();
```

#### Retry Policy
- **Max Reintentos**: 3
- **Delay Inicial**: 2 segundos
- **Backoff**: Exponencial (2s → 4s → 8s)
- **Jitter**: Habilitado (añade aleatoriedad para evitar "thundering herd")
- **Se aplica a**:
  - `HttpRequestException` (errores de conexión)
  - Respuestas 5xx (errores del servidor)
  - Timeout (408)

#### Circuit Breaker Policy
- **Umbral de Fallos**: 50% de fallos en la ventana de muestreo
- **Ventana de Muestreo**: 30 segundos
- **Throughput Mínimo**: 5 requests (no abre CB si no hay suficientes intentos)
- **Break Duration**: 30 segundos (permanece "abierto" antes de probar)
- **Estados**:
  - **Closed**: Pasar requests normalmente
  - **Open**: Fallar rápido sin hacer llamadas (BrokenCircuitException)
  - **Half-Open**: Probar 1 request para ver si se recuperó el servicio

---

## Flujo de Confirmación de Pago

```
POST /api/reservas/{id}/confirmar
    ↓
ReservaService.ConfirmarPagoAsync()
    ↓
IPaymentGatewayService.ConfirmarPagoAsync(reservaId)
    ↓
[Retry Policy]
    ├─ Intento 1: Fallo 503 → reintento (2s)
    ├─ Intento 2: Fallo 503 → reintento (4s)
    └─ Intento 3: Éxito 200 → devuelve codigoConfirmacion
    ↓
reserva.ConfirmarPago(codigoConfirmacion)
    ↓
Update DB
    ↓
200 OK
```

### Escenario: Circuit Breaker Activado

Si tras 3 reintentos consecutivos falla >50% de requests en 30s:
- El CB se "abre"
- Las siguientes llamadas fallan **inmediatamente** con `BrokenCircuitException` (sin esperar 10 segundos de timeout)
- Tras 30 segundos, CB entra en "Half-Open" y prueba 1 request
- Si ese request tiene éxito, CB se cierra; si falla, se reabre

---

## Tests

### Unit Tests (`HttpPaymentGatewayServiceTests.cs`)
- `ConfirmarPago_SuccessfulResponse_RetornsCodigoConfirmacion`: Verifica respuesta exitosa
- `ConfirmarPago_ServerError_LanzaExcepcion`: Verifica manejo de errores 5xx
- `ConfirmarPago_MissingCodigoConfirmacion_LanzaExcepcion`: Verifica validación de response

### Integration Tests (`ReservasApiTests.cs`)
- `ConfirmarPago_ReservaValida_Retorna200`: Verifica endpoint con fake payment service
- Todos los tests usan `FakePaymentGatewayService` (no tocan la red)

### Application Tests (`ReservaServiceTests.cs`)
- Mocks de `IPaymentGatewayService` injected en `ReservaService`
- Verifica que excepciones del gateway se propaguen correctamente
- Nuevo test: `ConfirmarPago_GatewayLanzaExcepcion_Propagada`

---

## Configuración para Producción

### Archivo `appsettings.json`
```json
{
  "PaymentGateway": {
    "BaseUrl": "https://api.paymentprovider.com"
  }
}
```

### URL Base
Por defecto: `https://api.pagos.ejemplo.com` (fallback si no está configurado)

### Timeouts
- Client timeout: 10 segundos (configurable en `HttpClient`)
- Retry backoff máximo: 8 segundos (exponencial)
- Total máximo (sin CB): ~14 segundos (3 reintentos + delays)

---

## Ventajas de Esta Implementación

### Resilience
- ✅ Tolera fallos transitorios (503, timeout)
- ✅ Previene cascadas de fallos con Circuit Breaker
- ✅ Exponencial backoff + jitter evita "thundering herd"

### Observabilidad
- ✅ OpenTelemetry tracing de todas las llamadas HTTP
- ✅ Logs de excepciones en `GlobalExceptionHandler`
- ✅ Métricas de reintentos y circuito abierto (via Polly internals)

### Testabilidad
- ✅ Interfaz segregada (`IPaymentGatewayService`)
- ✅ Fake stub para tests de integración
- ✅ Mocks en tests unitarios de servicio

### Mantenibilidad
- ✅ Políticas centralizadas en DI container
- ✅ Sin "magic numbers" — configuración clara
- ✅ Usar `Microsoft.Extensions.Http.Resilience` (Polly v8, soporte official)

---

## Notas de Implementación

### Por Qué No Polly Directo
`Microsoft.Extensions.Http.Resilience` es la recomendación oficial de Microsoft:
- Integración perfecta con DI
- Naming consistente con ecosystem .NET 8/10
- Soporte a largo plazo garantizado
- Menos verbosidad que Polly puro

### Por Qué `AddStandardResilienceHandler()`
Usa presets sensatos:
- Retry + Circuit Breaker + Timeout
- Configuración optimizada para APIs HTTP típicas
- Puede customizarse si es necesario

### Alternativa: Custom Pipeline
Si necesitas políticas diferentes:
```csharp
.AddResilienceHandler("payment-gateway", pipeline =>
{
    pipeline.AddRetry(...);
    pipeline.AddCircuitBreaker(...);
    pipeline.AddTimeout(...);
});
```

---

## Ejecución de Tests

```bash
# Todos los tests (69 en total)
dotnet test EventosVivos.Tests/

# Solo unit tests de payment service
dotnet test EventosVivos.Tests/ -k HttpPaymentGatewayServiceTests

# Con cobertura
dotnet test EventosVivos.Tests/ /p:CollectCoverage=true
```

---

## Referencias

- [Microsoft.Extensions.Http.Resilience](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.http.resilience)
- [Polly Patterns](https://www.pollydocs.org/strategies/)
- [Circuit Breaker Pattern](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern)
