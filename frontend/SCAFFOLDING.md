# EventosVivos Frontend - Angular Scaffolding

## Proyecto Completado

Se ha generado un scaffolding completo y profesional del frontend Angular para la aplicación EventosVivos.

### Estructura de Carpetas

```
src/app/
├── core/
│   ├── models/
│   │   ├── evento.model.ts        # Tipos y DTOs de eventos
│   │   ├── reserva.model.ts       # Tipos y DTOs de reservas
│   │   ├── venue.model.ts         # Tipos de venues
│   │   └── index.ts               # Barrel export
│   ├── services/
│   │   ├── api.service.ts         # Base HTTP service
│   │   ├── evento.service.ts      # Eventos API
│   │   ├── reserva.service.ts     # Reservas API
│   │   ├── venue.service.ts       # Venues API
│   │   └── index.ts               # Barrel export
│   └── interceptors/
│       ├── error.interceptor.ts   # Manejo global de errores HTTP
│       └── index.ts
├── features/
│   ├── eventos/
│   │   ├── evento-list/           # Listado de eventos
│   │   ├── evento-form/           # Crear/editar eventos
│   │   ├── evento-detail/         # Detalles y reporte del evento
│   │   └── eventos.routes.ts      # Rutas del módulo
│   └── reservas/
│       ├── reserva-form/          # Crear reservas
│       ├── reserva-panel/         # Panel de reservas
│       └── reservas.routes.ts     # Rutas del módulo
├── shared/
│   ├── components/
│   │   ├── estado-badge/          # Componente de badge de estado
│   │   ├── confirm-dialog/        # Diálogo de confirmación
│   │   └── index.ts
│   └── pipes/
│       └── estado-evento.pipe.ts  # Pipes para traducir estados
├── styles/
│   ├── _variables.scss            # Colores, tipografía, espaciado
│   ├── _mixins.scss               # Mixins SCSS reutilizables
│   └── global.scss                # Estilos globales
├── app.ts                         # Componente raíz
├── app.routes.ts                  # Configuración de rutas
└── app.config.ts                  # Configuración de la aplicación
```

## Características Implementadas

### 1. Core Layer
- **Models**: Interfaces TypeScript completas para Evento, Reserva y Venue
- **Services**: Servicios inyectables para cada entidad
  - Base ApiService con métodos genéricos GET, POST, PUT, PATCH, DELETE
  - Manejo de parámetros de query normalizados
- **Interceptors**: ErrorInterceptor global que:
  - Parsea errores HTTP (400, 401, 403, 404, 409, 500)
  - Muestra notificaciones con SnackBar
  - Maneja errores de validación
  - Redirige a 404 cuando sea necesario

### 2. Feature Modules

#### Eventos
- **EventoListComponent**: Tabla de eventos con filtros en tiempo real
  - Búsqueda por título
  - Filtro por tipo (conferencia, taller, concierto)
  - Filtro por estado
  - Acciones: ver detalles, editar
  - Debounce en filtros (300ms)

- **EventoFormComponent**: Formulario reactivo para crear/editar
  - Validaciones en tiempo real
  - Datepicker para fechas
  - Integración con VenueService
  - Modo edición automático por ruta

- **EventoDetailComponent**: Vista detallada con reporte
  - Información completa del evento
  - Estadísticas: reservas, ingresos, capacidad utilizada
  - Tabla de reservas asociadas
  - Cancelación de evento con confirmación

#### Reservas
- **ReservaPanelComponent**: Dashboard de reservas
  - Tabla con todas las reservas
  - Estadísticas: total, confirmadas, pendientes
  - Acciones: confirmar pago, cancelar reserva
  - Confirmación de acciones con diálogos

- **ReservaFormComponent**: Formulario para nuevas reservas
  - Información del evento relacionado
  - Cálculo dinámico del total
  - Email validation
  - Redirección tras éxito

### 3. Shared Components

- **EstadoBadgeComponent**: Badge visual con colores por estado
  - Estados activo (verde), cancelado (rojo), completado (azul)
  - Estados pendiente_pago (naranja), confirmada (verde)

- **ConfirmDialogComponent**: Diálogo modal reutilizable
  - Soporte para diferentes tipos (warning, info, error)
  - Botones personalizables
  - Retorna true/false para control de flujo

### 4. Pipes

- **EstadoEventoPipe**: Traduce 'activo' → 'Activo', etc.
- **EstadoReservaPipe**: Traduce 'pendiente_pago' → 'Pendiente de Pago'

### 5. Estilos

- **Variables**: Paleta de colores, tipografía, espaciado, breakpoints
- **Mixins**: Utilidades SCSS (flexbox, grid, responsive, shadows, transitions)
- **Global**: Estilos base, Material overrides, animaciones, scrollbar custom
- **Tema**: Indigo/Pink de Angular Material

## Configuración de la Aplicación

### app.config.ts
- HTTP client con interceptores
- Router con lazy loading
- Animaciones habilitadas
- Material DateModule

### app.routes.ts
- Rutas lazy-loaded para eventos y reservas
- Redirección a /eventos por defecto
- Wildcard route

## Patrones y Mejores Prácticas

✓ **Standalone Components**: Todos los componentes usan standalone API (Angular 14+)
✓ **Reactive Forms**: FormBuilder para validaciones complejas
✓ **RxJS**: takeUntil para gestión de suscripciones y unsubscribe automático
✓ **HTTP**: ApiService base reutilizable, parámetros query normalizados
✓ **Error Handling**: Interceptor global, snackbars, manejo de validaciones
✓ **Naming**: Convenciones claras, nombres descriptivos
✓ **Separación de Responsabilidades**: Core/Features/Shared bien definido
✓ **Importes**: Barrel exports (index.ts) para mantener imports limpios
✓ **Material Design**: Componentes Material, iconos, tipografía

## Compilación

### Development Build
```bash
ng build --configuration=development
```

### Production Build
```bash
ng build --configuration=production
```

Ambas se construyen sin errores. El tamaño del bundle está optimizado con:
- Tree-shaking automático
- Code splitting por rutas
- Minificación en producción

## Próximos Pasos

### 1. Implementar Lógica Adicional
- Guardias de ruta (AuthGuard, si se añade autenticación)
- Validadores asincronos (verificar disponibilidad)
- Efectos con `@ngrx/effects` o servicios

### 2. Añadir Tests
- Unit tests con Jasmine/Karma
- E2E tests con Cypress o Playwright
- Cobertura mínima 80%

### 3. Mejorar UX
- Loading skeletons
- Paginación en tablas
- Exportar a CSV/PDF
- Dark mode

### 4. Optimización
- Virtual scrolling para tablas grandes
- Image lazy loading
- Service Worker (PWA)

### 5. Documentación
- Storybook para componentes
- API docs generadas con Compodoc
- Guías de desarrollo

## Conexión con Backend

La aplicación está configurada para conectarse a:
```
API Base URL: https://localhost:5001/api
```

Ajusta en `ApiService` si es necesario. Los endpoints esperados:
- `GET /api/eventos` - listar eventos
- `POST /api/eventos` - crear evento
- `PUT /api/eventos/{id}` - actualizar evento
- `GET /api/eventos/{id}` - obtener evento
- `GET /api/eventos/{id}/reporte` - reporte del evento
- `PATCH /api/eventos/{id}/cancelar` - cancelar evento
- `GET /api/reservas` - listar reservas
- `POST /api/reservas` - crear reserva
- `GET /api/eventos/{eventoId}/reservas` - reservas por evento
- `PATCH /api/reservas/{id}/confirmar-pago` - confirmar pago
- `PATCH /api/reservas/{id}/cancelar` - cancelar reserva
- `GET /api/venues` - listar venues

## Versiones

- Angular: 21+
- Material: 21.2.14
- Node: 18+
- npm: 8+

---

**Scaffolding generado el**: 23 Jun 2026
**Status**: Listo para desarrollo
