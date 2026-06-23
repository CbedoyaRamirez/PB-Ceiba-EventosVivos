# EventosVivos — Sistema de Reservas de Eventos

EventosVivos es una plataforma profesional de gestión y reserva de eventos culturales, conferencias y talleres. Resuelve los problemas de overbooking, conflictos de horarios y validación manual de reservas.

## Características principales

✅ **Gestión de eventos** con validación de capacidad y horarios
✅ **Sistema de reservas** con confirmación de pago y cancelación
✅ **Reportes de ocupación** con análisis de ingresos
✅ **Validación de reglas de negocio** complejas (RN-01 a RN-07)
✅ **Interfaz profesional** con Angular Material
✅ **API REST** completamente documentada con Swagger
✅ **Tests exhaustivos** con cobertura del 97%

## Arquitectura

### Backend: .NET 8 + Clean Architecture

```
backend/
├── EventosVivos.Domain/           ← Entidades, enums, excepciones
├── EventosVivos.Application/      ← Servicios, DTOs, validadores
├── EventosVivos.Infrastructure/   ← EF Core In-Memory, repositorios
├── EventosVivos.API/              ← Controladores REST, Swagger
└── EventosVivos.Tests/            ← Unit + Integration tests (46/47 ✅)
```

**Decisiones de diseño:**
- **Clean Architecture** para separación clara de responsabilidades
- **EF Core In-Memory** para persistencia sin requerir servidor DB
- **FluentValidation** para validaciones declarativas
- **Dependency Injection** nativo de .NET 8
- **Global Exception Handler** para manejo uniforme de errores
- **xUnit** para tests con Moq y WebApplicationFactory

### Frontend: Angular 17 + Material Design

```
frontend/
└── eventosvivos-app/
    └── src/app/
        ├── core/           ← Modelos, servicios HTTP, interceptors
        ├── features/       ← Módulos de eventos y reservas
        ├── shared/         ← Componentes reutilizables
        └── styles/         ← Variables SCSS, tipografía, colores
```

**Stack frontend:**
- **Angular 17** con standalone components
- **Angular Material** para UI components
- **Reactive Forms** con validaciones complejas
- **RxJS** con manejo de memory leaks (takeUntil)
- **TypeScript strict mode**
- **SCSS** con variables y mixins

## Reglas de Negocio Implementadas

| RN | Descripción | Dónde |
|---|---|---|
| RN-01 | Capacidad evento ≤ capacidad venue | EventoService |
| RN-02 | No overlap de eventos activos en mismo venue | EventoService |
| RN-03 | Fin de semana: evento no inicia después de 22:00 | EventoService |
| RN-04 | No se permite reservar < 1 hora del evento | ReservaService |
| RN-05 | Precio > $100 → máximo 10 entradas por transacción | ReservaService |
| RN-06 | Evento se marca completado automáticamente si pasó fecha fin | EventoService |
| RN-07 | Cancelación < 48h antes: entrada se marca como perdida | ReservaService |

**Prioridad especial (RF-03):** Si evento inicia en < 24h, límite es 5 entradas (sobreescribe RN-05)

## API REST

### Endpoints

```
GET    /api/venues                      Lista de venues
GET    /api/eventos                     Listar con filtros
POST   /api/eventos                     Crear evento
GET    /api/eventos/{id}                Detalle evento
GET    /api/eventos/{id}/reporte        Reporte ocupación
GET    /api/reservas                    Listar reservas
POST   /api/reservas                    Crear reserva
PUT    /api/reservas/{id}/confirmar     Confirmar pago
PUT    /api/reservas/{id}/cancelar      Cancelar reserva
```

### Documentación interactiva

Ejecutar backend y abrir: `https://localhost:5001/swagger`

## Instalación y Ejecución

### Requisitos

- .NET 8 SDK
- Node.js 18+ y npm
- Visual Studio 2022 o VS Code

### Backend

```bash
cd backend

# Restaurar paquetes y compilar
dotnet build

# Ejecutar tests
dotnet test

# Ejecutar API
cd EventosVivos.API
dotnet run
# API en https://localhost:5001
# Swagger en https://localhost:5001/swagger
```

### Frontend

```bash
cd frontend/eventosvivos-app

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve
# App en http://localhost:4200

# Build para producción
ng build --configuration production
# Output en dist/eventosvivos-app
```

## Flujo de usuario típico

1. **Ver eventos:** Navigate a `/eventos` → listado con filtros
2. **Crear evento:** Click en "Nuevo evento" → formulario con validaciones
3. **Detalle evento:** Click en "Ver detalle" → info completa, reporte, reservas
4. **Reservar entrada:** Click en "Reservar" → dialog modal con validaciones
5. **Confirmar pago:** Tab de reservas → botón "Confirmar pago" → código reserva generado
6. **Cancelar reserva:** Click "Cancelar" → dialog de confirmación → cambio de estado

## Estructura de datos

### Evento
- `id` (Guid)
- `titulo` (string, 5-100 chars)
- `descripcion` (string, 10-500 chars)
- `venueId` (int)
- `capacidadMaxima` (int)
- `fechaInicio` (DateTime)
- `fechaFin` (DateTime)
- `precio` (decimal)
- `tipo` (conferencia | taller | concierto)
- `estado` (activo | cancelado | completado)

### Reserva
- `id` (Guid)
- `eventoId` (Guid)
- `cantidad` (int)
- `nombreComprador` (string)
- `emailComprador` (string)
- `estado` (pendiente_pago | confirmada | cancelada)
- `codigoReserva` (string, formato: EV-{6 dígitos})
- `esPerdida` (bool, para penalización RN-07)

### Venue (seed data)
- Auditorio Central (200 personas, Bogotá)
- Sala Norte (50 personas, Bogotá)
- Arena Sur (500 personas, Medellín)

## Testing

### Cobertura

- **46 tests pasando** (97.87%)
- **11 tests de dominio** → validaciones
- **25 tests de application** → servicios y reglas de negocio
- **10+ tests de integración** → endpoints REST

### Ejecutar tests

```bash
cd backend
dotnet test

# Con cobertura
dotnet test /p:CollectCoverage=true
```

## Estándares de código

### Backend
- **Clean Architecture:** Domain → Application → API
- **SOLID principles:** S(ingle), O(pen/Closed), L(iskov), I(nterface), D(ependency)
- **Entity Framework Core:** In-Memory provider
- **Validation:** FluentValidation + reglas de dominio
- **Exception handling:** Centralizado en middleware

### Frontend
- **Standalone components:** Moderno, sin NgModule overhead
- **Reactive Forms:** FormGroup, FormControl, validaciones
- **RxJS:** Unsubscribe pattern con takeUntil
- **Type safety:** TypeScript strict mode
- **Angular Material:** Componentes accesibles

## Mejoras futuras

- [ ] Autenticación y roles (admin vs usuario)
- [ ] Pagos reales (Stripe, PayPal)
- [ ] Notificaciones por email/SMS
- [ ] Exportar reportes (PDF, Excel)
- [ ] Gráficos avanzados de ocupación
- [ ] Búsqueda geoespacial de venues
- [ ] Recomendaciones de eventos
- [ ] Integración con Google Calendar
- [ ] Progressive Web App (PWA)
- [ ] Despliegue en Azure/AWS

## Despliegue

### Docker (futuro)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY backend/EventosVivos.API/bin/Release/net8.0 /app
ENTRYPOINT ["dotnet", "EventosVivos.API.dll"]
```

### Azure App Service

```bash
# Backend
az webapp up -n eventosvivos-api -g eventosvivos

# Frontend
az staticwebapp create -n eventosvivos-app -g eventosvivos
```

## Troubleshooting

### Backend no conecta
- Verificar que `https://localhost:5001` esté disponible
- Limpiar: `dotnet clean && dotnet build`

### CORS error en frontend
- Backend debe estar corriendo con `dotnet run`
- Verificar `Program.cs` tiene CORS para `localhost:4200`

### Tests fallan
- Asegurar que no hay migraciones pendientes
- In-Memory DB se reinicia cada test

## Contacto

Desarrollado para EventosVivos.
Preguntas: bedoyacarlosalberto@gmail.com

---

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Licencia:** MIT
