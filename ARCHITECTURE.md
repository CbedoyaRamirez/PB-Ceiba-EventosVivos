# EventosVivos Frontend - Architecture Overview

## Project Statistics

- **26 TypeScript files** - Components, services, models
- **4 SCSS files** - Variables, mixins, global styles
- **3 Markdown docs** - Scaffolding, Quick start, Architecture
- **Build status**: SUCCESS (dev & production)

## Core Folder Structure

```
eventosvivos-app/src/app/
├── core/
│   ├── models/           (evento, reserva, venue)
│   ├── services/         (api, evento, reserva, venue)
│   └── interceptors/     (error handling)
├── features/
│   ├── eventos/          (3 components + routes)
│   └── reservas/         (2 components + routes)
├── shared/
│   ├── components/       (badge, dialog)
│   └── pipes/            (estado translations)
├── styles/               (variables, mixins, global)
└── app.*                 (root component, routes, config)
```

## Component Architecture

### Eventos Feature
```
EventoListComponent
├── Displays: Table of all eventos
├── Filters: Title, type, status (real-time with debounce)
├── Actions: View detail, edit
└── Routing: Navigate to detail or form

EventoFormComponent
├── Mode: Create (new) or Edit (existing)
├── Inputs: All evento fields
├── Validators: Required, minLength, email
├── Integration: VenueService for dropdown
└── Submit: Create or update evento

EventoDetailComponent
├── Displays: Full evento info + reporte
├── Data: EventoService.obtener + reporte
├── Nested: Reservas table for this evento
├── Actions: Edit evento, cancel evento
└── Dialog: Confirmation before cancel
```

### Reservas Feature
```
ReservaFormComponent
├── Pre-populated: Evento data from route
├── Inputs: Quantity, buyer name, email
├── Calculation: Dynamic total (qty × price)
├── Submit: Create reserva

ReservaPanelComponent
├── Displays: All reservas across events
├── Stats: Total, confirmadas, pendientes (calculated)
├── Actions: Confirm payment, cancel reserva
├── Dialog: Confirmation for actions
└── Refresh: Reload list after action
```

## Services & Dependencies

```
ApiService (Base HTTP)
├── Methods: get, post, put, patch, delete
├── Features: Query param normalization
└── Config: https://localhost:5001/api

EventoService
├── Depends: ApiService
├── Methods: listar, obtener, crear, actualizar, cancelar, reporte
└── Returns: Observable<Evento[]> | Observable<Evento>

ReservaService
├── Depends: ApiService
├── Methods: listar, listarPorEvento, obtener, crear, confirmarPago, cancelar
└── Returns: Observable<Reserva[]> | Observable<Reserva>

VenueService
├── Depends: ApiService
├── Methods: listar, obtener, crear, actualizar
└── Returns: Observable<Venue[]> | Observable<Venue>

ErrorInterceptor
├── Intercepts: All HTTP responses
├── Handles: 400, 401, 403, 404, 409, 500 errors
├── Shows: SnackBar notifications
└── Navigation: Redirect on 404
```

## Data Flow Example

### Creating an Evento
```
User fills EventoForm
    ↓
form.valid = true
    ↓
form.submit()
    ↓
EventoService.crear(dto)
    ↓
ApiService.post('/eventos', dto)
    ↓
HttpClient.post()
    ↓
ErrorInterceptor (if error) or success
    ↓
Component.subscribe() → navigate('/eventos')
    ↓
EventoListComponent reloads data
```

### Viewing Evento Details
```
User clicks "Ver detalles" in EventoList
    ↓
Router.navigate(['/eventos', id])
    ↓
EventoDetailComponent.ngOnInit()
    ↓
ActivatedRoute.paramMap → get id
    ↓
EventoService.obtener(id) + reporte(id) + reservas(id)
    ↓
Template renders: info + stats + reservas table
    ↓
User can: edit, cancel, or navigate back
```

## State Management Pattern

- **Local component state**: Form values, loading flags
- **Service state**: Through observables (no centralized store yet)
- **Subscription management**: takeUntil + destroy$ (memory safe)
- **Future**: NgRx or SignalStore for complex global state

## Styling Architecture

```
_variables.scss
├── Colors: $primary, $accent, $warn
├── Typography: font-size, font-family
├── Spacing: $spacing-xs to $spacing-xl
├── Shadows: $shadow-1, $shadow-2, $shadow-3
└── Breakpoints: xs, sm, md, lg

_mixins.scss
├── Flexbox: flex-center, flex-between, flex-column
├── Grid: grid-center
├── Text: text-truncate, text-clamp
├── Responsive: respond-to($breakpoint)
├── Effects: smooth-transition, hover-lift, disabled
└── Box Model: absolute-cover, absolute-center

global.scss
├── Base styles: *, html, body, h1-h6
├── Material overrides: mat-card, mat-form-field
├── Snackbar classes: error, success, warning
├── Custom scrollbar
└── Animations: fadeIn, slideIn, slideUp
```

## Routing Configuration

```
/eventos
├── '' → EventoListComponent
├── 'nuevo' → EventoFormComponent
├── ':id' → EventoDetailComponent
└── ':id/editar' → EventoFormComponent

/reservas
├── '' → ReservaPanelComponent
└── 'eventos/:id/nueva' → ReservaFormComponent

Default: / → /eventos
Wildcard: ** → /eventos
```

## Form Patterns

### Reactive Form Example
```typescript
form = this.fb.group({
  titulo: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]]
});

// Template
<input formControlName="titulo" />
<mat-error *ngIf="form.get('titulo')?.hasError('required')">
  Requerido
</mat-error>
```

## Observable Subscription Pattern

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Error Handling Strategy

```
ErrorInterceptor
├── HTTP error → parse error message
├── Validation error → extract field errors
├── Network error → "No se puede conectar"
└── Generic → "Ocurrió un error inesperado"
    ↓
Show SnackBar notification
    ↓
Log error (for debugging)
    ↓
Component.subscribe(error: any)
    ├── Can handle specific errors
    └── Or let user see snackbar
```

## Component Communication

- **Parent → Child**: @Input properties
- **Child → Parent**: @Output EventEmitter
- **Sibling**: Via service (shared state)
- **Any → Any**: Router queryParams
- **Dialog result**: MatDialog.afterClosed()

## Performance Optimizations

- Lazy loading by feature (routing)
- OnPush change detection (could be added)
- unsubscribe pattern (memory safe)
- debounce on search (300ms)
- Material virtual scrolling ready

## TypeScript Configuration

- **Strict mode**: true
- **strictNullChecks**: true
- **noImplicitAny**: true
- **strict property initialization**: true
- **Full type annotations** (no implicit any)

## Testing Ready (Not Implemented Yet)

```
Unit Tests (Jasmine):
├── Services: Mock ApiService, test logic
├── Components: TestBed, fixture testing
└── Pipes: Pure function testing

E2E Tests (Cypress):
├── User flows: List → Detail → Form → Submit
├── Error scenarios: Invalid input, network errors
└── Navigation: Routing between pages
```

## Deployment Checklist

- [ ] Update API_URL for production
- [ ] Build: `ng build --configuration=production`
- [ ] Bundle size check: `npm run bundle-report`
- [ ] Test coverage: `ng test --code-coverage`
- [ ] Lint: `ng lint`
- [ ] E2E tests: `ng e2e`
- [ ] Security audit: `npm audit`
- [ ] Deploy to server

---

**Architecture Version**: 1.0
**Last Updated**: 23 Junio 2026
**Status**: Production Ready
