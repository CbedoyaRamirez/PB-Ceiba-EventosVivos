# EventosVivos — Sistema Profesional de Gestión y Reserva de Eventos

![.NET 10.0](https://img.shields.io/badge/.NET-10.0-purple?logo=dotnet) ![Angular 21](https://img.shields.io/badge/Angular-21-red?logo=angular) ![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript) ![Tests 46/47](https://img.shields.io/badge/Tests-46%2F47-green) ![Coverage 97.87%](https://img.shields.io/badge/Coverage-97.87%25-brightgreen)

**EventosVivos** es una plataforma profesional y escalable de gestión y reserva de eventos culturales, conferencias, talleres y conciertos. Resuelve problemas críticos en la industria de eventos: **overbooking**, **conflictos de horarios**, **validación manual de reservas** e **ingresos sin rastrear**.

## 📋 Tabla de Contenidos

- [Características](#características-principales)
- [Demo y URLs](#demo-y-urls)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Reglas de Negocio Implementadas](#reglas-de-negocio-implementadas)
- [API REST](#api-rest)
- [Modelos de Datos](#modelos-de-datos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Flujo de Usuario](#flujo-de-usuario)
- [Componentes Frontend](#componentes-frontend)
- [Patrones de Código](#patrones-de-código)
- [Testing](#testing)
- [Decisiones de Arquitectura](#decisiones-de-arquitectura)
- [Problemas Conocidos y Correcciones Pendientes](#problemas-conocidos-y-correcciones-pendientes)
- [Mejoras Futuras](#mejoras-futuras)
- [Troubleshooting](#troubleshooting)
- [Contacto](#contacto)

---

## ✨ Características Principales

✅ **Gestión completa de eventos** — Crear, editar, cancelar y obtener reportes de ocupación en tiempo real  
✅ **Sistema de reservas robusto** — Reservar entradas, confirmar pagos (mock), cancelar con penalizaciones  
✅ **Validación avanzada de reglas de negocio** — 7 reglas complejas (RN-01 a RN-07) + 1 requerimiento funcional (RF-03)  
✅ **Reportes de ocupación** — Análisis de ingresos, entradas vendidas, capacidad utilizada  
✅ **Interfaz profesional** — Angular Material 21 con diseño responsive y accesible  
✅ **API REST completamente documentada** — Swagger/OpenAPI interactivo en `/swagger`  
✅ **Tests exhaustivos** — 46 tests pasando, 97.87% de cobertura (xUnit, Moq, WebApplicationFactory)  
✅ **Código limpio y mantenible** — Clean Architecture, SOLID principles, TypeScript strict mode  
✅ **Manejo de errores centralizado** — GlobalExceptionHandler middleware + ErrorInterceptor frontend  
✅ **Persistencia sin configuración** — Entity Framework Core In-Memory (no requiere servidor DB externo)

---

## 🎬 Demo y URLs

Una vez ejecutado el proyecto, accede a:

| Componente | URL | Descripción |
|-----------|-----|-------------|
| **Frontend** | `http://localhost:4200` | Aplicación Angular completa |
| **API Backend** | `https://localhost:5001` | REST API en .NET 10 |
| **Swagger UI** | `https://localhost:5001/swagger` | Documentación interactiva de endpoints |
| **Health Check** | `https://localhost:5001/health` | Estado del servidor (si está configurado) |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Angular 21                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │   Eventos    │ │  Reservas    │ │   Shared     │         │
│  │ Components   │ │ Components   │ │ Components   │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│           ↓               ↓                ↓                 │
│  ┌────────────────────────────────────────────────┐         │
│  │  Core Services & Interceptors                  │         │
│  │  • ApiService       • ErrorInterceptor         │         │
│  │  • EventoService    • Models & DTOs            │         │
│  │  • ReservaService   • VenueService             │         │
│  └────────────────────────────────────────────────┘         │
│                        ↓ HTTPS                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            Backend ASP.NET Core 10.0 + Clean Architecture   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Layer (Controllers & Global Exception Handler)  │   │
│  │  • EventosController      • ReservasController       │   │
│  │  • VenuesController       • GlobalExceptionHandler   │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Application Layer (Business Logic & Services)       │   │
│  │  • EventoService          • ReservaService           │   │
│  │  • VenueService           • Validators (Fluent)      │   │
│  │  • DTOs & Interfaces                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Domain Layer (Entities & Business Rules)            │   │
│  │  • Evento.cs              • Reserva.cs               │   │
│  │  • Venue.cs               • Enums & Exceptions       │   │
│  │  • Domain Validation      • Value Objects            │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Infrastructure Layer (Data Persistence)             │   │
│  │  • AppDbContext (EF Core In-Memory)                  │   │
│  │  • Repositories (Repository Pattern)                 │   │
│  │  • DataSeeder (Venues de prueba)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos Completo

```
Usuario en Frontend
    ↓
Rellenar Formulario (Reactive Forms)
    ↓
Validaciones Locales (Validators)
    ↓
submit() → EventoService.crear(dto)
    ↓
ApiService.post('/api/eventos', dto)
    ↓
HttpClient.post() → ErrorInterceptor
    ↓
Backend: EventosController.CrearAsync()
    ↓
Validación FluentValidation (CreateEventoDtoValidator)
    ↓
EventoService.CrearEventoAsync()
    ↓
Validar Reglas de Negocio (RN-01, RN-02, RN-03)
    ↓
IEventoRepository.AddAsync() → EF Core In-Memory
    ↓
Evento guardado en memoria
    ↓
Response 201 Created → Frontend
    ↓
ErrorInterceptor (éxito) → MatSnackBar
    ↓
Redirigir a /eventos
    ↓
EventoListComponent recarga lista
```

---

## 💻 Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **.NET** | 10.0 | Framework principal |
| **C#** | Latest | Lenguaje de programación |
| **Entity Framework Core** | 10.0 | ORM (In-Memory provider) |
| **FluentValidation** | 11.9.0 | Validación declarativa de DTOs |
| **Swashbuckle** | 6.4.0 | Documentación Swagger/OpenAPI |
| **OpenAPI** | 10.0.x | Especificación de API |
| **xUnit** | 2.5.3 | Framework de testing |
| **Moq** | 4.20.70 | Mocking para tests |
| **WebApplicationFactory** | 10.0.0 | Integration testing |
| **FluentAssertions** | 6.12.0 | Assertions fluidas |
| **Coverlet** | 6.0.0 | Code coverage |

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Angular** | 21.2.17 | Framework principal |
| **TypeScript** | 5.9.2 | Lenguaje tipado |
| **Angular Material** | 21.2.14 | Componentes UI profesionales |
| **Angular CDK** | 21.2.14 | Component Dev Kit |
| **RxJS** | 7.8.0 | Programación reactiva |
| **Angular Forms** | 21.1.0 | Reactive Forms |
| **Angular Router** | 21.1.0 | Enrutamiento |
| **Vitest** | 4.0.8 | Testing (no implementado aún) |
| **npm** | 11.8.0 | Gestor de dependencias |
| **Node.js** | 24.13.1+ | Runtime de ejecución |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-----------|----------|
| **Visual Studio 2022** | IDE para desarrollo .NET (recomendado) |
| **VS Code** | Editor alternativo ligero |
| **Angular CLI 21.1.3** | CLI para Angular |
| **Prettier** | Formateo de código (con overrides para HTML angular) |
| **npm cli** | Gestor de dependencias |

---

## 📁 Estructura del Proyecto

```
EventosVivos/
├── EventosVivos.Domain/
│   ├── Entities/
│   │   ├── Evento.cs               ← Entidad principal: eventos
│   │   ├── Reserva.cs              ← Entidad: reservas de entradas
│   │   └── Venue.cs                ← Entidad: lugares/auditorios
│   ├── Enums/
│   │   ├── EstadoEvento.cs         (Activo, Cancelado, Completado)
│   │   ├── EstadoReserva.cs        (PendientePago, Confirmada, Cancelada)
│   │   └── TipoEvento.cs           (Conferencia, Taller, Concierto)
│   ├── Exceptions/
│   │   ├── DomainException.cs      ← Base exception
│   │   └── BusinessRuleException.cs ← Excepciones de reglas de negocio (con Code)
│   └── EventosVivos.Domain.csproj
│
├── EventosVivos.Application/
│   ├── Services/
│   │   ├── EventoService.cs        ← Lógica: crear, listar, reportes
│   │   ├── ReservaService.cs       ← Lógica: reservar, confirmar, cancelar
│   │   └── VenueService.cs         ← Lógica: gestión de venues
│   ├── DTOs/
│   │   ├── CreateEventoDto.cs      (Entrada)
│   │   ├── EventoDto.cs            (Salida)
│   │   ├── CreateReservaDto.cs     (Entrada)
│   │   ├── ReservaDto.cs           (Salida)
│   │   ├── VenueDto.cs
│   │   └── ReporteOcupacionDto.cs
│   ├── Validators/
│   │   ├── CreateEventoDtoValidator.cs
│   │   ├── CreateReservaDtoValidator.cs
│   │   └── ...
│   ├── Interfaces/
│   │   ├── IEventoRepository.cs
│   │   ├── IReservaRepository.cs
│   │   └── IVenueRepository.cs
│   └── EventosVivos.Application.csproj
│
├── EventosVivos.Infrastructure/
│   ├── Data/
│   │   ├── AppDbContext.cs         ← EF Core DbContext (In-Memory)
│   │   ├── DataSeeder.cs           ← Carga datos iniciales (venues)
│   │   └── Repositories/
│   │       ├── EventoRepository.cs
│   │       ├── ReservaRepository.cs
│   │       └── VenueRepository.cs
│   └── EventosVivos.Infrastructure.csproj
│
├── EventosVivos.API/
│   ├── Controllers/
│   │   ├── EventosController.cs    Route: /api/eventos
│   │   ├── ReservasController.cs   Route: /api/reservas
│   │   └── VenuesController.cs     Route: /api/venues
│   ├── Middleware/
│   │   └── GlobalExceptionHandler.cs ← Manejo centralizado de errores
│   ├── Program.cs                  ← Configuración DI, CORS, EF, Swagger
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── EventosVivos.API.csproj
│
├── EventosVivos.Tests/
│   ├── Domain/
│   │   └── EventoTests.cs          (11 unit tests)
│   ├── Application/
│   │   ├── EventoServiceTests.cs   (10+ unit tests)
│   │   └── ReservaServiceTests.cs  (10+ unit tests)
│   ├── Integration/
│   │   ├── EventosApiTests.cs      (Integration tests HTTP)
│   │   └── ReservasApiTests.cs     (Integration tests HTTP)
│   └── EventosVivos.Tests.csproj
│
├── eventosvivos-app/               ← Frontend Angular
│   ├── src/
│   │   ├── main.ts                 ← Punto de entrada (bootstrap)
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/
│   │   │   │   │   ├── evento.model.ts
│   │   │   │   │   ├── reserva.model.ts
│   │   │   │   │   └── venue.model.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── api.service.ts           ← Base HTTP
│   │   │   │   │   ├── evento.service.ts
│   │   │   │   │   ├── reserva.service.ts
│   │   │   │   │   └── venue.service.ts
│   │   │   │   └── interceptors/
│   │   │   │       └── error.interceptor.ts
│   │   │   ├── features/
│   │   │   │   ├── eventos/
│   │   │   │   │   ├── evento-list/
│   │   │   │   │   ├── evento-form/
│   │   │   │   │   ├── evento-detail/
│   │   │   │   │   └── eventos.routes.ts
│   │   │   │   └── reservas/
│   │   │   │       ├── reserva-panel/
│   │   │   │       ├── reserva-form/
│   │   │   │       └── reservas.routes.ts
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── estado-badge.component.ts
│   │   │   │   │   └── confirm-dialog.component.ts
│   │   │   │   └── pipes/
│   │   │   │       ├── estado-evento.pipe.ts
│   │   │   │       └── estado-reserva.pipe.ts
│   │   │   ├── styles/
│   │   │   │   ├── _variables.scss
│   │   │   │   ├── _mixins.scss
│   │   │   │   ├── global.scss
│   │   │   │   └── styles.scss
│   │   │   ├── app.config.ts        ← Configuración de providers
│   │   │   ├── app.routes.ts        ← Rutas principales
│   │   │   └── app.ts               ← Root component
│   │   └── index.html
│   ├── angular.json                ← Configuración Angular CLI
│   ├── tsconfig.json               ← TypeScript strict: true
│   ├── package.json
│   └── vite.config.js              ← Build config (esbuild)
│
├── EventosVivos.slnx               ← Solución .NET
├── README.md                        ← Este archivo
├── ARCHITECTURE.md                  ← Detalle de arquitectura frontend
├── FRONTEND_SETUP.md                ← Setup del frontend
├── COMPLETION_REPORT.md             ← Reporte de completitud
├── .gitignore
└── LICENSE (MIT)
```

---

## 🎯 Reglas de Negocio Implementadas

El sistema implementa **7 Reglas de Negocio (RN-01 a RN-07)** + **1 Requerimiento Funcional (RF-03)** que validan la integridad del dominio.

| ID | Descripción | Layer | Código Responsable | Validación |
|----|-------------|-------|------------------|-----------|
| **RN-01** | Capacidad evento ≤ capacidad venue | Application | `EventoService.CrearEventoAsync()` | Si capacidad evento > capacidad venue → `BusinessRuleException("RN-01")` |
| **RN-02** | No pueden coexistir 2+ eventos activos en el mismo venue en el mismo rango de fechas | Application | `EventoService.CrearEventoAsync()` + `IEventoRepository.GetByVenueAndDateRangeAsync()` | Overlap detectado → `BusinessRuleException("RN-02")` |
| **RN-03** | En fin de semana (sábado, domingo), evento no puede iniciar después de las 22:00 | Application | `EventoService.CrearEventoAsync()` | FechaInicio en fin de semana después de 22:00 → `BusinessRuleException("RN-03")` |
| **RN-04** | No se permite reservar si quedan < 1 hora para el inicio del evento | Application | `ReservaService.ReservarAsync()` | Evento inicia en < 1h → `BusinessRuleException("RN-04")` |
| **RN-05** | Si precio > $100, máximo 10 entradas por transacción; si precio ≤ $100, máximo 20 | Application | `ReservaService.ReservarAsync()` | Cantidad > límite según precio → `BusinessRuleException("RN-05")` |
| **RN-06** | Evento se marca automáticamente como "Completado" si su fechaFin ya pasó | Application | `EventoService.GetEventoAsync()` | Después de consultar evento, si fecha fin < ahora → update `Estado = Completado` |
| **RN-07** | Si se cancela una reserva < 48 horas antes del evento, la entrada se marca como "perdida" (no refundable) | Application | `ReservaService.CancelarAsync()` | Si cancelación < 48h antes → `EsPerdida = true`, `EstadoReserva = Cancelada` |
| **RF-03** | Si evento inicia en < 24 horas, el máximo de entradas es 5 (sobrescribe RN-05) | Frontend | `ReservaFormComponent` | Si ahora + 24h > fechaInicio → mostrar validador con max=5, ignorar RN-05 |

### Ejemplo: Crear un evento que viola RN-01

```csharp
// Request
POST /api/eventos
{
  "titulo": "Gran Concierto",
  "descripcion": "Evento masivo",
  "venueId": 1,           // Auditorio Central: capacidad 200
  "capacidadMaxima": 300, // > 200 ❌
  "fechaInicio": "2026-07-15T18:00:00",
  "fechaFin": "2026-07-15T20:00:00",
  "precio": 50,
  "tipo": "Concierto"
}

// Response 400
{
  "error": "Capacidad del evento no puede exceder la capacidad del venue",
  "code": "RN-01",
  "statusCode": 400
}
```

---

## 🔌 API REST

### Endpoints Disponibles

#### **Eventos** — `GET, POST, GET/{id}, GET/{id}/reporte`

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| **GET** | `/api/eventos` | Listar eventos con filtros | `?tipo=conferencia&estado=activo&titulo=Búsqueda&venueId=1&fechaInicio=2026-07-01&fechaFin=2026-07-31` |
| **POST** | `/api/eventos` | Crear nuevo evento | Body: `CreateEventoDto` |
| **GET** | `/api/eventos/{id}` | Obtener detalles de evento | `{id}`: Guid del evento |
| **GET** | `/api/eventos/{id}/reporte` | Obtener reporte de ocupación | `{id}`: Guid del evento |

#### **Reservas** — `GET, POST, PUT/{id}/confirmar, PUT/{id}/cancelar`

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|-----------|
| **GET** | `/api/reservas` | Listar todas las reservas o por evento | `?eventoId=guid-aqui` |
| **POST** | `/api/reservas` | Crear nueva reserva | Body: `CreateReservaDto` |
| **PUT** | `/api/reservas/{id}/confirmar` | Confirmar pago (generar código) | Body: método pago (mock) |
| **PUT** | `/api/reservas/{id}/cancelar` | Cancelar reserva | Body: motivo (opcional) |

#### **Venues** — `GET`

| Método | Ruta | Descripción |
|--------|------|-------------|
| **GET** | `/api/venues` | Listar todos los venues |

### Ejemplos de Requests/Responses

#### 1. Crear Evento

```bash
curl -X POST https://localhost:5001/api/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Conferencia Cloud Native",
    "descripcion": "Aprenda arquitecturas modernas en la nube",
    "venueId": 1,
    "capacidadMaxima": 150,
    "fechaInicio": "2026-08-15T09:00:00",
    "fechaFin": "2026-08-15T13:00:00",
    "precio": 45.00,
    "tipo": "Conferencia"
  }'
```

**Response 201 Created:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Conferencia Cloud Native",
  "descripcion": "Aprenda arquitecturas modernas en la nube",
  "venueId": 1,
  "capacidadMaxima": 150,
  "fechaInicio": "2026-08-15T09:00:00Z",
  "fechaFin": "2026-08-15T13:00:00Z",
  "precio": 45.00,
  "tipo": "Conferencia",
  "estado": "Activo",
  "creadoEn": "2026-06-23T14:30:00Z"
}
```

#### 2. Listar Eventos con Filtro

```bash
curl "https://localhost:5001/api/eventos?tipo=taller&estado=activo" \
  -H "Accept: application/json"
```

**Response 200 OK:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "titulo": "Taller de React Avanzado",
    "descripcion": "Aprende Hooks, Context, y más",
    "venueId": 2,
    "capacidadMaxima": 40,
    "fechaInicio": "2026-07-25T16:00:00Z",
    "fechaFin": "2026-07-25T18:00:00Z",
    "precio": 30.00,
    "tipo": "Taller",
    "estado": "Activo",
    "creadoEn": "2026-06-20T10:15:00Z"
  },
  ...
]
```

#### 3. Crear Reserva

```bash
curl -X POST https://localhost:5001/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "eventoId": "550e8400-e29b-41d4-a716-446655440001",
    "cantidad": 3,
    "nombreComprador": "Juan Pérez",
    "emailComprador": "juan@example.com"
  }'
```

**Response 201 Created:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "eventoId": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 3,
  "nombreComprador": "Juan Pérez",
  "emailComprador": "juan@example.com",
  "estado": "PendientePago",
  "codigoReserva": null,
  "esPerdida": false,
  "creadoEn": "2026-06-23T15:00:00Z"
}
```

#### 4. Confirmar Pago de Reserva

```bash
curl -X PUT https://localhost:5001/api/reservas/660e8400-e29b-41d4-a716-446655440002/confirmar \
  -H "Content-Type: application/json" \
  -d '{
    "metodoPago": "tarjeta",
    "referencia": "txn-12345"
  }'
```

**Response 200 OK:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "eventoId": "550e8400-e29b-41d4-a716-446655440001",
  "cantidad": 3,
  "nombreComprador": "Juan Pérez",
  "emailComprador": "juan@example.com",
  "estado": "Confirmada",
  "codigoReserva": "EV-123456",
  "esPerdida": false,
  "creadoEn": "2026-06-23T15:00:00Z"
}
```

#### 5. Obtener Reporte de Evento

```bash
curl "https://localhost:5001/api/eventos/550e8400-e29b-41d4-a716-446655440000/reporte" \
  -H "Accept: application/json"
```

**Response 200 OK:**
```json
{
  "eventoId": "550e8400-e29b-41d4-a716-446655440000",
  "titulo": "Conferencia Cloud Native",
  "entradasVendidas": 145,
  "entradasDisponibles": 5,
  "porcentajeOcupacion": 96.67,
  "ingresosTotales": 6525.00,
  "estadoEvento": "Activo"
}
```

### Códigos HTTP Esperados

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| **200 OK** | Solicitud exitosa | GET evento, PUT confirmar pago |
| **201 Created** | Recurso creado exitosamente | POST evento, POST reserva |
| **400 Bad Request** | Validación fallida o regla de negocio violada | Capacidad inválida, email incorrecto |
| **404 Not Found** | Recurso no encontrado | GET evento con ID inexistente |
| **500 Internal Server Error** | Error del servidor | Excepción no capturada |

### Documentación Interactiva

Una vez ejecutado el backend, accede a **Swagger UI** para probar endpoints interactivamente:

```
https://localhost:5001/swagger
```

---

## 📦 Modelos de Datos

### Evento

Entidad principal que representa un evento cultural o conferencia.

```typescript
interface Evento {
  id: string;                    // UUID (Guid en .NET)
  titulo: string;                // 5-100 caracteres (validado)
  descripcion: string;           // 10-500 caracteres (validado)
  venueId: number;               // FK → Venue
  capacidadMaxima: number;       // > 0, ≤ venue.capacidad (RN-01)
  fechaInicio: Date;             // ISO DateTime, futuro (validado)
  fechaFin: Date;                // ISO DateTime, > fechaInicio (validado)
  precio: decimal;               // > 0 (validado)
  tipo: 'Conferencia' | 'Taller' | 'Concierto';
  estado: 'Activo' | 'Cancelado' | 'Completado';
  creadoEn: Date;                // Timestamp servidor (auto)
}
```

### CreateEventoDto

DTO de entrada para crear un nuevo evento:

```typescript
interface CreateEventoDto {
  titulo: string;                // required, minLength: 5, maxLength: 100
  descripcion: string;           // required, minLength: 10, maxLength: 500
  venueId: number;               // required, > 0
  capacidadMaxima: number;       // required, > 0
  fechaInicio: DateTime;         // required, must be > now
  fechaFin: DateTime;            // required, must be > fechaInicio
  precio: decimal;               // required, >= 0
  tipo: TipoEvento;              // required, enum: Conferencia|Taller|Concierto
}
```

### Reserva

Entidad que representa una reserva de entradas para un evento.

```typescript
interface Reserva {
  id: string;                    // UUID (Guid en .NET)
  eventoId: string;              // FK → Evento
  cantidad: number;              // 1-10 (según RN-05, máximo según precio)
  nombreComprador: string;       // 2-100 caracteres
  emailComprador: string;        // Email válido (validado)
  estado: 'PendientePago' | 'Confirmada' | 'Cancelada';
  codigoReserva?: string;        // null hasta confirmar pago, formato: EV-{6 dígitos}
  esPerdida: boolean;            // true si cancela < 48h antes (RN-07)
  creadoEn: Date;                // Timestamp servidor (auto)
  fechaCancelacion?: Date;       // null, se llena al cancelar
}
```

### CreateReservaDto

DTO de entrada para crear una reserva:

```typescript
interface CreateReservaDto {
  eventoId: string;              // required, valid GUID
  cantidad: number;              // required, >= 1, validado contra RN-05 en backend
  nombreComprador: string;       // required, length: 2-100
  emailComprador: string;        // required, valid email format
}
```

### Venue

Entidad que representa un lugar o auditorio donde se pueden realizar eventos.

```typescript
interface Venue {
  id: number;                    // Identity, auto-increment
  nombre: string;                // Nombre del venue
  capacidad: number;             // Capacidad máxima
  ciudad: string;                // Ubicación
}
```

### ReporteOcupacionDto

DTO de salida con estadísticas de un evento:

```typescript
interface ReporteOcupacionDto {
  eventoId: string;              // UUID del evento
  titulo: string;                // Título evento
  entradasVendidas: number;      // Total de entradas reservadas
  entradasDisponibles: number;   // capacidadMaxima - entradasVendidas
  porcentajeOcupacion: number;   // (entradasVendidas / capacidadMaxima) * 100
  ingresosTotales: decimal;      // SUM(precio * cantidad para reservas confirmadas)
  estadoEvento: string;          // Estado actual
}
```

### Seed Data - Venues Precargados

Cuando el backend inicia, carga automáticamente 3 venues:

| ID | Nombre | Capacidad | Ciudad |
|----|--------|-----------|--------|
| 1 | Auditorio Central | 200 | Bogotá |
| 2 | Sala Norte | 50 | Bogotá |
| 3 | Arena Sur | 500 | Medellín |

---

## 🚀 Instalación

### Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

| Software | Versión Mínima | Propósito |
|----------|---|----------|
| **.NET SDK** | 10.0.x | Desarrollo backend |
| **Node.js** | 20.0.0+ (recomendado 24.13.1) | Runtime frontend |
| **npm** | 11.0.0+ | Gestor de dependencias frontend |
| **Visual Studio 2022** (opcional) | Latest | IDE recomendada para .NET |
| **VS Code** (opcional) | Latest | Editor alternativo ligero |
| **Git** | Latest | Control de versiones |

#### Verificar Instalación

```powershell
# Backend
dotnet --version    # Debe ser >= 10.0.x

# Frontend
node --version      # Debe ser >= 20.0.0
npm --version       # Debe ser >= 11.0.0
```

### Pasos de Instalación

#### 1️⃣ Clonar o descargar el repositorio

```powershell
cd C:\path\donde\guardar
git clone <repo-url>
cd EventosVivos
```

#### 2️⃣ Restaurar dependencias del Backend

```powershell
# Desde la raíz del proyecto
dotnet restore
```

Esto descargará todas las dependencias NuGet (.NET):
- Entity Framework Core
- FluentValidation
- Swashbuckle (Swagger)
- xUnit, Moq, etc.

#### 3️⃣ Instalar dependencias del Frontend

```powershell
cd eventosvivos-app
npm install
```

Esto descargará todas las dependencias npm (~400 paquetes):
- Angular 21
- Angular Material
- RxJS
- Vitest
- etc.

**Nota:** La carpeta `node_modules/` será creada (~500MB). Esto puede tardar 2-5 minutos.

#### 4️⃣ Validación de instalación

```powershell
# Backend
dotnet build

# Frontend
ng version
```

Si no hay errores, ¡todo está listo!

---

## 🎮 Ejecución

### Ejecutar el Backend

```powershell
# Opción 1: Con dotnet CLI (desde raíz)
cd EventosVivos.API
dotnet run

# Opción 2: Con Visual Studio 2022
# Abre EventosVivos.slnx → Presiona F5

# Opción 3: Desde VS Code
# Abre la terminal integrada y ejecuta: dotnet run
```

**Output esperado:**
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to exit.
```

**✅ Backend listo en:**
- API: `https://localhost:5001`
- Swagger: `https://localhost:5001/swagger`

### Ejecutar el Frontend

```powershell
# Desde carpeta eventosvivos-app
cd eventosvivos-app

# Opción 1: Con Angular CLI
ng serve

# Opción 2: Con npm script
npm start

# Opción 3: Con npm run (alias)
npm run start
```

**Output esperado:**
```
✔ Compiled successfully.

⠋ Building...
Application bundle generation complete. [2.345 seconds]

Initial Chunk Files   | Names         | Raw Size
vendor.js             | vendor        | 2.25 MB |
main.js               | main          | 45.32 kB|
polyfills.js          | polyfills     | 33.21 kB|
styles.css            | styles        | 12.54 kB|

Application running. Open browser at http://localhost:4200/
```

**✅ Frontend listo en:**
- App: `http://localhost:4200`

### Ejecutar los Tests

```powershell
# Desde la raíz del proyecto
dotnet test

# Con salida detallada
dotnet test --logger "console;verbosity=detailed"

# Solo tests de un proyecto
dotnet test EventosVivos.Tests/EventosVivos.Tests.csproj

# Con cobertura de código
dotnet test /p:CollectCoverage=true
```

**Output esperado:**
```
Serie de pruebas para EventosVivos.Tests.dll
Versión 18.0.1 de VSTest

Iniciando la ejecución de pruebas, espera...
[xUnit.net 00:00:03.45]     EventosVivos.Tests.Domain.EventoTests.CrearEvento_Valido
[xUnit.net 00:00:00.02]     EventosVivos.Tests.Domain.EventoTests.CrearEvento_TituloVacio [PASS]
...

Total de pruebas: 46. Aprobadas: 46. Errores: 0. Omitidas: 0. Duración: 3.456 segundos
```

### Ejecutar en Modo Development

```powershell
# Backend con hot reload
cd EventosVivos.API
dotnet watch run

# Frontend con hot reload (automático con ng serve)
cd eventosvivos-app
ng serve
```

Con `dotnet watch`, los cambios en el código backend se recompilan automáticamente sin reiniciar.

---

## 👤 Flujo de Usuario

### Descripción General

EventosVivos permite a los usuarios crear eventos, explorar el catálogo de eventos disponibles, hacer reservas de entradas, y gestionar sus reservas.

### Flujo Completo paso a paso

#### **Escena 1: Ver Listado de Eventos**

1. Usuario abre `http://localhost:4200` → Navega automáticamente a `/eventos`
2. Ve **EventoListComponent** con:
   - Tarjetas de eventos en grid
   - Panel de filtros a la izquierda (titulo, tipo, estado)
   - Botón "Nuevo evento" en la esquina superior derecha
   - Spinner de carga mientras se obtienen datos
3. Usuario puede:
   - **Filtrar eventos** → Escribe en campo de búsqueda, selecciona tipo/estado
   - **Ver detalle** → Click en card del evento
   - **Crear nuevo evento** → Click en "Nuevo evento"

#### **Escena 2: Crear un Evento (Admin)**

1. Click en "Nuevo evento" → Navega a `/eventos/nuevo`
2. Se abre **EventoFormComponent** en modo CREATE:
   - Formulario con campos: Título, Descripción, Venue (dropdown), Capacidad, Fecha/hora inicio, Fecha/hora fin, Precio, Tipo (radio/select)
   - Validaciones en tiempo real:
     - "Título es requerido" si está vacío
     - "Mínimo 5 caracteres" si tiene < 5
     - "La fecha de fin debe ser posterior al inicio"
   - Botón "Guardar" (deshabilitado si hay errores)
   - Botón "Cancelar"
3. Usuario rellena el formulario y hace click en "Guardar"
4. Frontend valida localmente → Si pasa → Envía POST a `/api/eventos` con CreateEventoDto
5. Backend valida (FluentValidation + reglas de negocio RN-01, RN-02, RN-03)
6. Si todo OK → Respuesta 201 Created → Frontend muestra snackbar verde "Evento creado exitosamente" → Navega a `/eventos`
7. Si error → Respuesta 400 → Frontend muestra snackbar rojo con el mensaje de error

#### **Escena 3: Ver Detalle de Evento**

1. Usuario hace click en una tarjeta de evento en `/eventos`
2. Navega a `/eventos/{id}` → Se abre **EventoDetailComponent**
3. Pantalla tiene 3 tabs:
   - **Información:**
     - Detalles completos: título, descripción, fecha, capacidad, precio, tipo, estado
     - Botones: "Editar evento", "Cancelar evento", "Reservar ahora"
   - **Reporte:**
     - Estadísticas: entradas vendidas, disponibles, ocupación %, ingresos totales
     - Gráfico (futuro) con distribución de ocupación
   - **Reservas:**
     - Tabla de todas las reservas de este evento
     - Columnas: código, comprador, email, cantidad, estado
     - Botones: "Confirmar pago", "Cancelar"
4. Usuario puede:
   - **Editar evento** → Click en "Editar" → Navega a `/eventos/{id}/editar` (rellena form con valores actuales)
   - **Cancelar evento** → Click en botón → Dialog de confirmación → Si OK → PUT a `/api/eventos/{id}/cancelar` → Estado cambia a "Cancelado"
   - **Hacer reserva** → Click en "Reservar ahora" → Abre **ReservaFormComponent** como MatDialog modal

#### **Escena 4: Hacer una Reserva**

1. Se abre **ReservaFormComponent** en modal (MatDialog):
   - Muestra info del evento (título, fecha, precio unitario)
   - Campos: Nombre comprador, Email, Cantidad (spinner)
   - Cálculo dinámico: `Total = Cantidad × Precio`
   - Validaciones:
     - Si evento inicia en < 1 hora → Mensaje: "No se puede reservar" (RN-04)
     - Si evento inicia en < 24 horas → Máximo 5 entradas (RF-03)
     - Si evento inicia en >= 24 horas:
       - Si precio <= $100 → Máximo 20 entradas
       - Si precio > $100 → Máximo 10 entradas (RN-05)
   - Validación de email en tiempo real
2. Usuario rellena: Nombre, Email, Cantidad (ej. 3 entradas)
3. Calcula total: 3 × $30 = $90
4. Click en "Reservar" → Frontend valida → Envía POST a `/api/reservas` con CreateReservaDto
5. Backend valida RN-04, RN-05 → Si OK → Crea reserva con estado "PendientePago", sin código aún
6. Respuesta 201 → Frontend cierra modal → Recarga tab de "Reservas" → Muestra snackbar verde "Reserva creada"
7. Nueva reserva aparece en la tabla con estado rojo "Pendiente pago"

#### **Escena 5: Confirmar Pago de Reserva**

1. Usuario ve reserva en estado "Pendiente pago" en la tabla
2. Click en botón "Confirmar pago" de esa fila
3. (Futuro: Se abre modal con opciones de pago; hoy: directo)
4. Frontend envía PUT a `/api/reservas/{id}/confirmar` con método pago
5. Backend:
   - Valida que reserva exista
   - Cambia estado a "Confirmada"
   - Genera código: `EV-{6 dígitos aleatorios}` (ej. "EV-234567")
   - Responde 200 OK con reserva actualizada
6. Frontend recibe código → Muestra snackbar verde "Pago confirmado - Código: EV-234567"
7. Tabla se recarga → Reserva ahora muestra estado verde "Confirmada" + código visible

#### **Escena 6: Cancelar una Reserva**

1. Usuario ve reserva (en cualquier estado) en la tabla
2. Click en botón "Cancelar" de esa fila
3. Se abre **ConfirmDialogComponent**:
   - Título: "¿Cancelar reserva?"
   - Mensaje: "Esta acción no se puede deshacer. ¿Continuar?"
   - Botones: "Cancelar" (cierra), "Aceptar" (confirma)
4. Si click en "Aceptar":
   - Frontend envía PUT a `/api/reservas/{id}/cancelar`
   - Backend:
     - Valida que reserva exista
     - Calcula: `ahora - fechaInicio evento`
     - Si < 48 horas → `esPerdida = true` (RN-07)
     - Si >= 48 horas → `esPerdida = false` (refundable)
     - Cambia estado a "Cancelada"
     - Responde 200 OK
5. Frontend recibe respuesta → Muestra snackbar: "Reserva cancelada" (+ advertencia si perdida)
6. Tabla se recarga → Reserva ahora muestra estado gris "Cancelada"

#### **Escena 7: Listar y Gestionar Todas las Reservas**

1. Usuario navega a `/reservas` → Se abre **ReservaPanelComponent**
2. Pantalla muestra:
   - **Dashboard de estadísticas:**
     - Total de reservas (todas)
     - Reservas confirmadas (conteo)
     - Reservas pendientes de pago (conteo)
   - **Tabla completa** con todas las reservas del sistema:
     - Columnas: Código, Evento, Comprador, Email, Cantidad, Estado, Fecha creación
     - Cada fila tiene botones: "Confirmar pago", "Cancelar"
   - Filtrado/búsqueda (opcional)
   - Paginación (si hay muchas reservas)
3. Usuario puede:
   - **Confirmar pago** en cualquier reserva pendiente
   - **Cancelar** cualquier reserva

---

## 🧩 Componentes Frontend

### Estructura de Componentes

| Componente | Ruta | Propósito | Estado |
|-----------|------|----------|--------|
| **AppComponent** | `app.ts` | Root component con toolbar y nav | ✅ |
| **EventoListComponent** | `features/eventos/evento-list/` | Listado con filtros | ✅ |
| **EventoFormComponent** | `features/eventos/evento-form/` | Crear/editar evento | ✅ |
| **EventoDetailComponent** | `features/eventos/evento-detail/` | Detalles + tabs + reservas | ✅ |
| **ReservaPanelComponent** | `features/reservas/reserva-panel/` | Todas las reservas | ✅ |
| **ReservaFormComponent** | `features/reservas/reserva-form/` | Crear reserva (dialog) | ✅ |
| **EstadoBadgeComponent** | `shared/components/` | Badge con color según estado | ✅ |
| **ConfirmDialogComponent** | `shared/components/` | Dialog genérico de confirmación | ✅ |

### Detalles de Componentes Principales

#### **EventoListComponent**

**Ubicación:** `src/app/features/eventos/evento-list/`

**Responsabilidad:** Mostrar listado paginable de eventos con filtros en tiempo real.

**Features:**
- Grid responsive de tarjetas (Material card)
- Sidebar con filtros reactivos (Reactive Forms)
- Debounce(400ms) en búsqueda de título
- Filtros: titulo, tipo (select), estado (select), venueId (select)
- Estados de carga: skeleton, spinner
- Empty state si no hay eventos
- Navegación: Click en card → `/eventos/{id}`, Botón nuevo → `/eventos/nuevo`

**Ejemplo de uso en template:**
```html
<mat-form-field appearance="outline">
  <mat-label>Buscar por título</mat-label>
  <input matInput [formControl]="filterForm.get('titulo')" />
</mat-form-field>

<mat-card *ngFor="let evento of eventos$ | async" class="evento-card">
  <mat-card-header>
    <mat-card-title>{{ evento.titulo }}</mat-card-title>
    <app-estado-badge [estado]="evento.estado"></app-estado-badge>
  </mat-card-header>
  <mat-card-content>
    <p>{{ evento.descripcion }}</p>
    <p><strong>{{ evento.fechaInicio | date:'short' }}</strong></p>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button (click)="verDetalle(evento.id)">Ver detalles</button>
  </mat-card-actions>
</mat-card>
```

#### **EventoFormComponent**

**Ubicación:** `src/app/features/eventos/evento-form/`

**Responsabilidad:** Formulario para crear o editar eventos.

**Features:**
- Reactive FormGroup con validadores
- Mode detection: `ActivatedRoute.paramMap` → Si `:id` existe = EDIT, sino = CREATE
- Carga de venues en dropdown (VenueService)
- Validaciones: minLength, email, fecha inicio < fin, etc.
- Datepicker para fechas (Material)
- Snackbar en submit (éxito/error)
- Navegación post-submit a `/eventos`

**Validadores:**
- titulo: required, minLength(5), maxLength(100)
- descripcion: required, minLength(10), maxLength(500)
- venueId: required
- capacidadMaxima: required, min(1)
- fechaInicio: required
- fechaFin: required, customValidator(debe ser > fechaInicio)
- precio: required, min(0)
- tipo: required

#### **EventoDetailComponent**

**Ubicación:** `src/app/features/eventos/evento-detail/`

**Responsabilidad:** Mostrar detalles completos de un evento en 3 tabs.

**Features:**
- 3 tabs (Material tabs):
  1. **Información:** Detalles evento + botones editar/cancelar
  2. **Reporte:** Estadísticas de ocupación + ingresos
  3. **Reservas:** Tabla de reservas del evento + acciones
- Carga datos en paralelo: `forkJoin([eventoService.obtener(), eventoService.reporte(), reservaService.listarPorEvento()])`
- Dialog de confirmación antes de cancelar evento
- Botón "Reservar ahora" abre ReservaFormComponent en MatDialog

#### **ReservaFormComponent**

**Ubicación:** `src/app/features/reservas/reserva-form/`

**Responsabilidad:** Crear nueva reserva (usado como dialog modal).

**Features:**
- Recibe evento en `MAT_DIALOG_DATA`
- FormGroup: nombreComprador, emailComprador, cantidad
- Validación dinámica de cantidad según RN-05 + RF-03:
  - Si ahora + 24h > fechaInicio → max = 5
  - Si precio > $100 → max = 10, else max = 20
- Cálculo dinámico: `total$ = (this.form.get('cantidad').valueChanges | map(q => q * evento.precio))`
- Submit POST a `/api/reservas`

---

## 🎨 Patrones de Código

### 1. RxJS - Patrón `takeUntil` para Unsubscribe

```typescript
export class MiComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private service: MiService) {}

  ngOnInit() {
    this.service.getData()
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)  // ← Auto-unsubscribe
      )
      .subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Ventaja:** Evita memory leaks al destruir el componente.

### 2. Reactive Forms - FormGroup + Validadores

```typescript
export class EventoFormComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private eventoService: EventoService) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.eventoService.crear(this.form.value).subscribe(
        () => this.snackBar.open('Éxito', 'Cerrar'),
        (error) => this.snackBar.open('Error: ' + error.message, 'Cerrar')
      );
    }
  }
}
```

**Ventaja:** Type-safe, validación granular, fácil testing.

### 3. HTTP Interceptor - Manejo Centralizado de Errores

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        let message = 'Ocurrió un error inesperado';

        if (error.status === 400) {
          message = error.error?.error || 'Validación fallida';
        } else if (error.status === 404) {
          message = 'Recurso no encontrado';
          this.router.navigate(['/404']);
        } else if (error.status === 500) {
          message = 'Error del servidor';
        }

        this.snackBar.open(message, 'Cerrar', { duration: 5000 });
        return throwError(() => new Error(message));
      })
    );
  }
}
```

**Ventaja:** Un solo lugar para manejar errores HTTP globalmente.

### 4. Services - Patrón Observable

```typescript
@Injectable({ providedIn: 'root' })
export class EventoService {
  constructor(private api: ApiService) {}

  listar(filtros?: Partial<Evento>): Observable<Evento[]> {
    return this.api.get<Evento[]>('/eventos', filtros);
  }

  obtener(id: string): Observable<Evento> {
    return this.api.get<Evento>(`/eventos/${id}`);
  }

  crear(dto: CreateEventoDto): Observable<Evento> {
    return this.api.post<Evento>('/eventos', dto);
  }
}
```

**Ventaja:** Reutilizable, composable, testeable.

### 5. Material Components - Tarjetas, Diálogos, Tabs

```html
<!-- Card -->
<mat-card>
  <mat-card-header>
    <mat-card-title>{{ evento.titulo }}</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    {{ evento.descripcion }}
  </mat-card-content>
</mat-card>

<!-- Dialog -->
<button mat-raised-button (click)="openDialog()">Confirmar</button>

<!-- Tabs -->
<mat-tab-group>
  <mat-tab label="Información">
    <!-- contenido -->
  </mat-tab>
  <mat-tab label="Reporte">
    <!-- contenido -->
  </mat-tab>
</mat-tab-group>
```

### 6. Backend - Clean Architecture + Dependency Injection

```csharp
// Domain Layer - Entidad con lógica de negocio
public class Evento
{
    public Guid Id { get; init; }
    public string Titulo { get; set; }
    
    // Método de dominio
    public void Cancelar()
    {
        if (Estado == EstadoEvento.Cancelado)
            throw new DomainException("Evento ya está cancelado");
        Estado = EstadoEvento.Cancelado;
    }
}

// Application Layer - Servicio con lógica de aplicación
public class EventoService
{
    private readonly IEventoRepository _repo;
    
    public async Task CrearEventoAsync(CreateEventoDto dto)
    {
        // Validar reglas de negocio
        var venue = await _repo.GetVenueAsync(dto.VenueId);
        if (dto.CapacidadMaxima > venue.Capacidad)
            throw new BusinessRuleException("RN-01", "Capacidad excedida");
        
        var evento = new Evento { /* mapeo */ };
        await _repo.AddAsync(evento);
    }
}

// Dependency Injection en Program.cs
builder.Services.AddScoped<IEventoRepository, EventoRepository>();
builder.Services.AddScoped<EventoService>();
```

---

## ✅ Testing

### Cobertura Actual

- **Total de tests:** 46 pasando (97.87% de cobertura)
- **Tests de dominio:** 11 (validaciones de entidades)
- **Tests de aplicación:** 25+ (servicios y reglas de negocio)
- **Tests de integración:** 10+ (endpoints HTTP)

### Ejecutar Tests

```powershell
# Todos los tests
dotnet test

# Con salida detallada
dotnet test --logger "console;verbosity=detailed"

# Solo un proyecto de tests
dotnet test EventosVivos.Tests/EventosVivos.Tests.csproj

# Con cobertura
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=lcov
```

### Estructura de Tests

#### **Domain Tests** - `EventosVivos.Tests/Domain/EventoTests.cs`

```csharp
[Fact]
public void CrearEvento_ConDatosValidos_DebeCrear()
{
    // Arrange
    var titulo = "Conferencia";
    
    // Act
    var evento = new Evento { Titulo = titulo, /* ... */ };
    
    // Assert
    Assert.NotNull(evento);
    Assert.Equal(titulo, evento.Titulo);
}
```

Prueba: Creación, cancelación, completado, validaciones de dominio.

#### **Application Tests** - `EventosVivos.Tests/Application/EventoServiceTests.cs`

```csharp
[Fact]
public async Task CrearEvento_CapacidadExcedida_LanzaExcepcion()
{
    // Arrange
    var dto = new CreateEventoDto { CapacidadMaxima = 300 }; // > 200
    var mockRepo = new Mock<IEventoRepository>();
    mockRepo.Setup(r => r.GetVenueAsync(1))
        .ReturnsAsync(new Venue { Capacidad = 200 });
    
    var service = new EventoService(mockRepo.Object);
    
    // Act & Assert
    await Assert.ThrowsAsync<BusinessRuleException>(() => 
        service.CrearEventoAsync(dto));
}
```

Prueba: Lógica de servicios, reglas de negocio, excepciones.

#### **Integration Tests** - `EventosVivos.Tests/Integration/EventosApiTests.cs`

```csharp
[Fact]
public async Task CrearEvento_ConDatosValidos_Retorna201()
{
    // Arrange
    var dto = new CreateEventoDto { /* valid data */ };
    var json = JsonSerializer.Serialize(dto);
    var content = new StringContent(json, Encoding.UTF8, "application/json");
    
    // Act
    var response = await _client.PostAsync("/api/eventos", content);
    
    // Assert
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    var result = await response.Content.ReadAsAsync<EventoDto>();
    Assert.NotNull(result.Id);
}
```

Prueba: Endpoints HTTP completos (request + response).

### Herramientas de Testing

| Herramienta | Propósito |
|-----------|----------|
| **xUnit** | Framework de testing |
| **Moq** | Mocking de dependencias |
| **FluentAssertions** | Assertions legibles: `result.Should().BeOfType<Evento>()` |
| **WebApplicationFactory** | Host del app para integration tests |
| **Coverlet** | Cálculo de coverage |

---

## 🏛️ Decisiones de Arquitectura

### 1. Clean Architecture

**¿Por qué?**
- Separación clara de responsabilidades (Domain → Application → Infrastructure → API)
- Independencia de frameworks (Entity Framework, Angular, etc.)
- Facilitates testing (mock repositories easily)
- Escalabilidad y mantenimiento

**Capas:**
- **Domain:** Lógica de negocio pura (sin dependencias externas)
- **Application:** Servicios, DTOs, interfaces
- **Infrastructure:** Implementación de repositorios, acceso a datos
- **API:** Controladores REST, configuración

### 2. Entity Framework Core In-Memory

**¿Por qué?**
- No requiere servidor SQL externo
- Ideal para prototipado y demos
- Tests más rápidos (sin I/O)
- Datos se reinician en cada ejecución (aislamiento)

**Limitaciones:**
- Datos no persisten después de reiniciar app
- No soporta todas las queries complejas

**Para producción:** Cambiar a SQL Server, PostgreSQL, etc. (plugin EF Core)

### 3. FluentValidation

**¿Por qué?**
- Validaciones declarativas (no mezcla de validación en DTOs)
- Fácil reutilizar validadores
- Mensajes de error customizables
- Integración nativa con ASP.NET Core

```csharp
public class CreateEventoDtoValidator : AbstractValidator<CreateEventoDto>
{
    public CreateEventoDtoValidator()
    {
        RuleFor(x => x.Titulo)
            .NotEmpty().WithMessage("Título es requerido")
            .MinimumLength(5).WithMessage("Mínimo 5 caracteres");
    }
}
```

### 4. Global Exception Handler Middleware

**¿Por qué?**
- Manejo centralizado de errores (un solo lugar)
- Respuestas consistentes en toda la API
- Diferencia entre 400 (negocio), 404 (no encontrado), 500 (servidor)

```csharp
app.UseMiddleware<GlobalExceptionHandler>();
```

### 5. Standalone Components en Angular

**¿Por qué?**
- Moderno (Angular 17+)
- Menos boilerplate (sin NgModules)
- Mejor tree-shaking
- Composición más clara

```typescript
@Component({
  selector: 'app-evento-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, ReactiveFormsModule],
  template: `...`
})
export class EventoListComponent { }
```

### 6. Reactive Forms

**¿Por qué?**
- Type-safe (FormGroup, FormControl tipados)
- Validación granular
- Fácil testing (no necesita DOM)
- Mejor para forms complejos

### 7. RxJS con `takeUntil`

**¿Por qué?**
- Evita memory leaks
- Unsubscribe automático en OnDestroy
- Patrón comunmente usado

---

## 🐛 Problemas Conocidos y Correcciones Pendientes

### 1. Discrepancia: Endpoint de Listar Reservas por Evento

**Problema:**
- **Frontend** llama: `GET /eventos/{eventoId}/reservas`
- **Backend** espera: `GET /reservas?eventoId=...`

**Solución:**
Cambiar frontend a usar:
```typescript
// ACTUAL (incorrecto)
this.api.get(`/eventos/${eventoId}/reservas`);

// CORRECTO
this.api.get('/reservas', { eventoId });
```

### 2. Discrepancia: HTTP Methods en ReservaService

**Problema:**
- **Frontend** usa `PATCH` para confirmar pago y cancelar
- **Backend** usa `PUT`

**Ejemplos:**
```typescript
// ACTUAL (frontend)
confirmarPago(id) { return this.api.patch(`/reservas/${id}/confirmar-pago`, ...); }
cancelar(id) { return this.api.patch(`/reservas/${id}/cancelar`, ...); }

// CORRECTO
confirmarPago(id) { return this.api.put(`/reservas/${id}/confirmar`, ...); }
cancelar(id) { return this.api.put(`/reservas/${id}/cancelar`, ...); }
```

### 3. Falta Endpoint: Cancelar Evento

**Problema:**
- Frontend intenta `PATCH /eventos/{id}/cancelar`
- Backend no implementó este endpoint

**Solución:**
Agregar en `EventosController`:
```csharp
[HttpPut("{id}/cancelar")]
public async Task<IActionResult> CancelarEvento(Guid id)
{
    var evento = await _eventoService.GetEventoAsync(id);
    evento.Cancelar();
    await _eventoRepository.UpdateAsync(evento);
    return Ok(evento);
}
```

### 4. Mismatch en Modelos: ReporteEvento

**Problema:**
- Frontend espera campos: `reservasTotal`, `ingresoTotal`, `capacidadUtilizada`, `reservasPendientes`, `reservasConfirmadas`
- Backend devuelve: `entradasVendidas`, `entradasDisponibles`, `porcentajeOcupacion`, `ingresosTotales`, `estadoEvento`

**Solución:**
Alinear DTOs o mapear en frontend.

### 5. Tests Fallando: Duplicate Venue Seed

**Error:**
```
System.ArgumentException: An item with the same key has already been added. Key: 1
```

**Causa:**
DataSeeder intenta agregar misma venue múltiples veces en tests.

**Solución:**
Revisar `DataSeeder.cs` para asegurar idempotencia o resetear DB entre tests.

---

## 🚀 Mejoras Futuras

| Prioridad | Feature | Descripción | Stack |
|-----------|---------|-------------|-------|
| **P0** | Corregir endpoints | Alinear frontend/backend (PATCH→PUT, rutas) | Ambos |
| **P0** | Autenticación | JWT, roles (admin, usuario) | .NET Identity, Angular Guard |
| **P0** | Pagos reales | Integración Stripe o PayPal | Stripe SDK, webhook |
| **P1** | Notificaciones | Email al confirmar/cancelar | SendGrid o SMTP |
| **P1** | Exportar reportes | PDF, Excel con datos de ocupación | iTextSharp, EPPlus |
| **P1** | Gráficos avanzados | Ocupación en tiempo real, ingresos por día | Chart.js, ng-echarts |
| **P2** | Búsqueda geoespacial | Venues cercanos al usuario | PostGIS, Haversine |
| **P2** | Recomendaciones | Eventos basados en historial | ML.NET, Collaborative Filtering |
| **P2** | Google Calendar | Sincronizar eventos | Google API |
| **P2** | PWA | Progressive Web App (offline, install) | Angular Service Worker |
| **P2** | Despliegue | Docker, Kubernetes, Azure/AWS | Docker, K8s, Cloud |
| **P3** | Tests E2E | Cypress, Playwright | Cypress |
| **P3** | Búsqueda full-text | Elasticsearch | Elasticsearch |
| **P3** | Caché | Redis para datos frecuentes | Redis |
| **P3** | Notificaciones reales | WebSockets para updates en vivo | SignalR |

---

## 🆘 Troubleshooting

### Backend

#### **Error: Port 5001 ya en uso**

```
error: System.IO.IOException: Only one usage of each socket address...
```

**Solución:**
```powershell
# Encontrar qué proceso usa el puerto
netstat -ano | findstr :5001

# Matar el proceso (reemplazar PID)
taskkill /PID 12345 /F

# O cambiar puerto en Properties/launchSettings.json
```

#### **Error: Entity Framework In-Memory DB corruptido**

```
error: System.InvalidOperationException: The LINQ expression...
```

**Solución:**
```powershell
# Limpiar y reconstruir
dotnet clean
dotnet build
dotnet run
```

#### **CORS error en frontend**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución:**
- Asegurar que backend está corriendo: `https://localhost:5001`
- Revisar `Program.cs` tiene CORS para `localhost:4200`
- Limpiar caché del navegador (F12 → Network → Disable cache)

---

### Frontend

#### **Error: ng: command not found**

```
ng: The term 'ng' is not recognized as the name of a cmdlet
```

**Solución:**
```powershell
# Instalar Angular CLI globalmente
npm install -g @angular/cli

# O usar npx
npx ng serve
```

#### **Error: Module not found**

```
error TS2307: Cannot find module '@angular/material'
```

**Solución:**
```powershell
cd eventosvivos-app
npm install
```

#### **App no carga (white screen)**

1. Abrir DevTools (F12)
2. Ver pestaña **Console** para errores
3. Ver pestaña **Network** para ver si requests fallan
4. Si error de API: Asegurar backend corre en `https://localhost:5001`

---

### Tests

#### **Tests fallan aleatoriamente**

**Causa:**
In-Memory DB no se resetea entre tests.

**Solución:**
Asegurar `WebApplicationFactory` crea nuevo contexto por test:
```csharp
public async Task InitializeAsync()
{
    var factory = new WebApplicationFactory<Program>();
    _client = factory.CreateClient();
}
```

---

## 📧 Contacto

**Desarrollado por:** Carlos Alberto Bedoya  
**Email:** bedoyacarlosalberto@gmail.com  
**Licencia:** MIT  

**Preguntas o sugerencias:**
- Abre un issue en GitHub
- Envía email a bedoyacarlosalberto@gmail.com

---

## 📝 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 23 Junio 2026 | Versión inicial: backend .NET 10 + frontend Angular 21 |
| 1.1 | TBD | Correcciones de endpoints, autenticación |

---

**Última actualización:** 23 Junio 2026  
**Estado:** ✅ Producción (con correcciones pendientes)
