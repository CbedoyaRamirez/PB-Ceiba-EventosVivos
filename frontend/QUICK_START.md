# EventosVivos Frontend - Quick Start

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm start
# o
ng serve

# Acceder a http://localhost:4200
```

## Estructura de Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `src/app/app.ts` | Componente raíz con navbar |
| `src/app/app.routes.ts` | Configuración de rutas |
| `src/app/app.config.ts` | Configuración de providers |
| `src/app/core/services/api.service.ts` | Base para HTTP |
| `src/app/core/models/evento.model.ts` | Tipos de evento |

## Crear un Nuevo Componente

```bash
ng generate component features/nuevaFeature/nuevo-componente --standalone
```

## Estructura de Servicios

```typescript
// Usar en componentes:
constructor(private eventoService: EventoService) {}

// Métodos disponibles:
this.eventoService.listar(filtros)           // Observable<Evento[]>
this.eventoService.obtener(id)               // Observable<Evento>
this.eventoService.crear(dto)                // Observable<Evento>
this.eventoService.actualizar(id, dto)       // Observable<Evento>
this.eventoService.reporte(id)               // Observable<ReporteEvento>
```

## Formularios Reactivos

```typescript
this.form = this.fb.group({
  titulo: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]]
});

// En template:
<input formControlName="titulo" />
<mat-error *ngIf="form.get('titulo')?.hasError('required')">
  Requerido
</mat-error>
```

## Gestión de Suscripciones

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Componentes Material Comunes

```typescript
// Import
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

// En standalone component:
imports: [MatTableModule, MatButtonModule, MatDialogModule]
```

## Diálogos de Confirmación

```typescript
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components';

constructor(private dialog: MatDialog) {}

openConfirm() {
  this.dialog.open(ConfirmDialogComponent, {
    data: {
      titulo: 'Confirmar',
      mensaje: 'Deseas continuar?',
      textoBtnAceptar: 'Aceptar',
      tipo: 'warning'
    }
  }).afterClosed().subscribe(result => {
    if (result) {
      // Usuario aceptó
    }
  });
}
```

## Mostrar Notificaciones

```typescript
import { MatSnackBar } from '@angular/material/snack-bar';

constructor(private snackBar: MatSnackBar) {}

notificar() {
  this.snackBar.open('Evento creado exitosamente', 'Cerrar', {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top'
  });
}
```

## Rutas Dinámicas

```typescript
// Navegar en componente
constructor(private router: Router) {}

ir() {
  this.router.navigate(['/eventos', id, 'editar']);
}

// En template
<a [routerLink]="['/eventos', evento.id]">Ver</a>
<button [routerLink]="['/eventos/nuevo']">Nuevo</button>
```

## Obtener Parámetros de Ruta

```typescript
import { ActivatedRoute } from '@angular/router';

constructor(private route: ActivatedRoute) {}

ngOnInit() {
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
  });
  
  this.route.queryParamMap.subscribe(params => {
    const filtro = params.get('filtro');
  });
}
```

## Decoradores Comunes

```typescript
// Componente standalone
@Component({
  selector: 'app-ejemplo',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: '...',
  styles: [':host { ... }']
})

// Input
@Input() evento: Evento;

// Output
@Output() actualizado = new EventEmitter<Evento>();
this.actualizado.emit(evento);

// Inyectable
@Injectable({ providedIn: 'root' })
export class MiService { }
```

## Comandos CLI

```bash
ng build                          # Build development
ng build --configuration=production  # Build optimizado
ng serve                          # Dev server
ng test                           # Tests
ng lint                           # Linter
ng generate component nombre      # Generar componente
ng generate service nombre        # Generar servicio
```

## Debugging

```typescript
// En componente
console.log('Debug:', this.data);

// En template
<p>{{ data | json }}</p>

// Chrome DevTools
- Pestaña Sources
- Elements Inspector
- Angular DevTools extension
```

## Variables de Estilo

Disponibles en `src/app/styles/_variables.scss`:

```scss
$primary: #3f51b5;              // Color primario
$accent: #ff4081;               // Color acentuado
$warn: #f44336;                 // Color de alerta
$spacing-md: 16px;              // Espaciado estándar
$border-radius-md: 4px;         // Border radius
$shadow-1: 0 2px 4px rgba(...); // Sombra
```

## Mixins Útiles

```scss
@include flex-center;        // Centra con flexbox
@include flex-between;       // Espacio entre
@include respond-to('md');   // Media query
@include shadow(2);          // Sombra nivel 2
@include smooth-transition;  // Transición suave
@include hover-lift;         // Efecto hover elevado
```

## Checks Pre-Commit

```bash
# Build
ng build

# Tests
ng test --watch=false --code-coverage

# Lint
ng lint

# Typecheck
npx tsc --noEmit
```

---

**Necesitas ayuda?** Revisa SCAFFOLDING.md para detalles de la arquitectura.
