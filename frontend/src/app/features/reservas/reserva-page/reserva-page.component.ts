import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReservaService, EventoService } from '../../../core/services';
import { CreateReservaDto, Evento } from '../../../core/models';

@Component({
  selector: 'app-reserva-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="reserva-page-container" *ngIf="!cargando && !errorCarga && evento; else stateTemplate">
      <!-- Encabezado con botón volver -->
      <div class="page-header">
        <button mat-stroked-button (click)="volver()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
          Volver al evento
        </button>
        <h1>Nueva Reserva</h1>
      </div>

      <mat-card class="reserva-card">
        <!-- Resumen del evento -->
        <div class="evento-summary">
          <h2>{{ evento.titulo }}</h2>
          <div class="summary-details">
            <div class="detail-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ evento.fechaInicio | date: 'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Precio por entrada:</span>
              <span class="value highlight">{{ evento.precio | currency }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Formulario de reserva -->
        <form [formGroup]="reservaForm" class="reserva-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nombre del Comprador</mat-label>
            <input matInput formControlName="nombreComprador" placeholder="Ej: Juan García" />
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="getFieldError('nombreComprador', 'required')">
              El nombre es obligatorio
            </mat-error>
            <mat-error *ngIf="getFieldError('nombreComprador', 'minlength')">
              Mínimo 3 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="emailComprador" placeholder="correo@ejemplo.com" />
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="getFieldError('emailComprador', 'required')">
              El email es obligatorio
            </mat-error>
            <mat-error *ngIf="getFieldError('emailComprador', 'email')">
              Ingresa un email válido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cantidad de Entradas</mat-label>
            <input matInput formControlName="cantidad" type="number" min="1"
                   (change)="onCantidadChange()" placeholder="Ej: 2" />
            <mat-icon matSuffix>shopping_cart</mat-icon>
            <mat-hint align="start" *ngIf="evento">
              Disponibles: {{ getEntradasDisponibles() }}
            </mat-hint>
            <mat-error *ngIf="getFieldError('cantidad', 'required')">
              La cantidad es obligatoria
            </mat-error>
            <mat-error *ngIf="getFieldError('cantidad', 'min')">
              Mínimo 1 entrada
            </mat-error>
            <mat-error *ngIf="getFieldError('cantidad', 'max')">
              Cantidad máxima excedida
            </mat-error>
          </mat-form-field>

          <!-- Información de restricciones -->
          <div *ngIf="mostrarRestriccion24h" class="restriccion-info warning">
            <mat-icon>info</mat-icon>
            <span>El evento inicia en menos de 24 horas. Máximo 5 entradas permitidas.</span>
          </div>

          <div *ngIf="mostrarRestriccionPrecio" class="restriccion-info info">
            <mat-icon>info</mat-icon>
            <span>Para eventos con precio mayor a $100, máximo 10 entradas por reserva.</span>
          </div>

          <mat-divider></mat-divider>

          <!-- Resumen de precio -->
          <div class="resumen-precio">
            <div class="precio-row">
              <span>Precio unitario:</span>
              <span>{{ evento.precio | currency }}</span>
            </div>
            <div class="precio-row">
              <span>Cantidad:</span>
              <span>{{ reservaForm.get('cantidad')?.value || 0 }}</span>
            </div>
            <div class="precio-row total">
              <span>Total a pagar:</span>
              <span class="total-amount">{{ calcularTotal() | currency }}</span>
            </div>
          </div>
        </form>
      </mat-card>

      <!-- Botones de acción -->
      <div class="actions">
        <button mat-stroked-button (click)="volver()">Cancelar</button>
        <button mat-raised-button color="primary" (click)="guardar()"
                [disabled]="!reservaForm.valid || enviando">
          <mat-spinner *ngIf="enviando" diameter="20" class="spinner-inline"></mat-spinner>
          {{ enviando ? 'Procesando...' : 'Crear Reserva' }}
        </button>
      </div>
    </div>

    <ng-template #stateTemplate>
      <div *ngIf="cargando" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Cargando formulario de reserva...</p>
      </div>
      <div *ngIf="errorCarga" class="error-state">
        <mat-icon>error_outline</mat-icon>
        <p>No se pudo cargar el evento. Verifica tu conexión o que el servidor esté disponible.</p>
        <button mat-stroked-button [routerLink]="['/eventos']">Volver a eventos</button>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      --primary: #4F46E5;
      --font-serif: 'Lora', 'Playfair Display', serif;
    }

    .reserva-page-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      .back-btn {
        color: var(--primary);
        border-color: var(--primary);
        flex-shrink: 0;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      h1 {
        margin: 0;
        font-family: var(--font-serif);
        font-size: 28px;
        font-weight: 700;
        color: #1f2937;
      }
    }

    .reserva-card {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;

      ::ng-deep {
        .mat-mdc-card-content {
          padding: 24px;
        }
      }
    }

    .evento-summary {
      margin-bottom: 16px;

      h2 {
        margin: 0 0 12px 0;
        font-size: 18px;
        font-weight: 700;
        color: #1f2937;
      }

      .summary-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;

        .label {
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          color: #1f2937;
          font-weight: 600;

          &.highlight {
            color: var(--primary);
            font-size: 16px;
          }
        }
      }
    }

    mat-divider {
      margin: 16px 0;
    }

    .reserva-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .restriccion-info {
      padding: 12px 16px;
      border-radius: 6px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
      margin: 8px 0;

      mat-icon {
        width: 20px;
        height: 20px;
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      &.warning {
        background: #fef3c7;
        color: #92400e;

        mat-icon {
          color: #f59e0b;
        }
      }

      &.info {
        background: #dbeafe;
        color: #1e40af;

        mat-icon {
          color: #3b82f6;
        }
      }
    }

    .resumen-precio {
      background: #f9f8ff;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid var(--primary);
      margin-top: 8px;
    }

    .precio-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      &.total {
        font-weight: 700;
        color: #1f2937;
        font-size: 16px;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
      }

      .total-amount {
        color: var(--primary);
        font-size: 18px;
      }
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;

      p {
        color: #6b7280;
        font-size: 14px;
      }
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      text-align: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ef4444;
      }

      p {
        color: #6b7280;
        font-size: 14px;
        max-width: 400px;
        margin: 0;
      }
    }

    @media (max-width: 600px) {
      .reserva-page-container {
        padding: 12px;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;

        h1 {
          font-size: 24px;
        }
      }

      .actions {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ReservaPageComponent implements OnInit, OnDestroy {
  reservaForm: FormGroup;
  evento: Evento | null = null;
  eventoId: string = '';
  enviando = false;
  cargando = true;
  errorCarga = false;
  mostrarRestriccion24h = false;
  mostrarRestriccionPrecio = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private reservaService: ReservaService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.reservaForm = this.fb.group({
      nombreComprador: ['', [Validators.required, Validators.minLength(3)]],
      emailComprador: ['', [Validators.required, Validators.email]],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.eventoId) {
      this.cargarEvento();
    } else {
      this.cargando = false;
      this.errorCarga = true;
    }
  }

  private cargarEvento(): void {
    this.cargando = true;
    this.errorCarga = false;
    this.eventoService
      .obtener(this.eventoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (evento) => {
          this.evento = evento;
          this.cargando = false;
          this.reservaForm.patchValue({
            cantidad: 1
          });
          this.actualizarValidadores();
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargando = false;
          this.errorCarga = true;
          this.cdr.markForCheck();
        }
      });
  }

  onCantidadChange(): void {
    this.actualizarValidadores();
    this.verificarRestricciones();
  }

  private actualizarValidadores(): void {
    if (!this.evento) return;

    const cantidadControl = this.reservaForm.get('cantidad');
    const maxima = this.getMaximaPermitida();
    const validators = [Validators.required, Validators.min(1), Validators.max(maxima)];

    cantidadControl?.setValidators(validators);
    cantidadControl?.updateValueAndValidity();
  }

  private verificarRestricciones(): void {
    if (!this.evento) return;

    const cantidadActual = this.reservaForm.get('cantidad')?.value || 0;
    const ahora = new Date();
    const horasAlInicio = (new Date(this.evento.fechaInicio).getTime() - ahora.getTime()) / (1000 * 60 * 60);

    this.mostrarRestriccion24h = horasAlInicio < 24 && cantidadActual > 0;
    this.mostrarRestriccionPrecio = this.evento.precio > 100 && cantidadActual > 0;
  }

  private getMaximaPermitida(): number {
    if (!this.evento) return 1;

    const disponibles = this.getEntradasDisponibles();
    const ahora = new Date();
    const horasAlInicio = (new Date(this.evento.fechaInicio).getTime() - ahora.getTime()) / (1000 * 60 * 60);

    let maxima = disponibles;

    if (horasAlInicio < 24) {
      maxima = Math.min(maxima, 5);
    }

    if (this.evento.precio > 100) {
      maxima = Math.min(maxima, 10);
    }

    return Math.max(1, maxima);
  }

  getEntradasDisponibles(): number {
    if (!this.evento) return 0;
    return this.evento.capacidadMaxima;
  }

  calcularTotal(): number {
    const cantidad = this.reservaForm.get('cantidad')?.value || 0;
    return cantidad * (this.evento?.precio || 0);
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    const field = this.reservaForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  guardar(): void {
    if (!this.reservaForm.valid || !this.evento) return;

    this.enviando = true;
    const dto: CreateReservaDto = {
      ...this.reservaForm.value,
      eventoId: this.evento.id
    };

    this.reservaService
      .crear(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.enviando = false;
          this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
          this.router.navigate(['/eventos', this.eventoId], {
            queryParams: { reservaCreada: 'true' }
          });
        },
        error: () => {
          this.enviando = false;
          this.snackBar.open('Error al crear la reserva', 'Cerrar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  volver(): void {
    this.router.navigate(['/eventos', this.eventoId]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
