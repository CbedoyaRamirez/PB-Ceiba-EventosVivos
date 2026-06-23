import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReservaService } from '../../../core/services';
import { CreateReservaDto, Evento } from '../../../core/models';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Nueva Reserva</h2>
    </div>

    <mat-dialog-content class="dialog-content">
      <div *ngIf="evento" class="evento-summary">
        <h3>{{ evento.titulo }}</h3>
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
            <span>{{ evento?.precio | currency }}</span>
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
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="guardar()"
              [disabled]="!reservaForm.valid || enviando">
        <mat-spinner *ngIf="enviando" diameter="20" class="spinner-inline"></mat-spinner>
        {{ enviando ? 'Procesando...' : 'Crear Reserva' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      --primary: #4F46E5;
      --font-serif: 'Lora', 'Playfair Display', serif;
    }

    .dialog-header {
      h2 {
        margin: 0;
        font-family: var(--font-serif);
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }
    }

    .dialog-content {
      padding: 24px 0 !important;
      min-width: 380px;
    }

    .evento-summary {
      padding: 0 24px 20px 24px;

      h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
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
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    mat-dialog-actions {
      padding: 24px !important;
      gap: 12px;
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 8px;
    }

    @media (max-width: 500px) {
      .dialog-content {
        min-width: auto;
        max-width: 100%;
      }
    }
  `]
})
export class ReservaFormComponent implements OnInit, OnDestroy {
  reservaForm: FormGroup;
  evento: Evento | null = null;
  enviando = false;
  mostrarRestriccion24h = false;
  mostrarRestriccionPrecio = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ReservaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { evento: Evento }
  ) {
    this.evento = data.evento;
    this.reservaForm = this.fb.group({
      nombreComprador: ['', [Validators.required, Validators.minLength(3)]],
      emailComprador: ['', [Validators.required, Validators.email]],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.evento) {
      this.reservaForm.patchValue({
        cantidad: 1
      });
      this.actualizarValidadores();
    }
  }

  onCantidadChange(): void {
    this.actualizarValidadores();
    this.verificarRestricciones();
  }

  private actualizarValidadores(): void {
    if (!this.evento) return;

    const cantidadControl = this.reservaForm.get('cantidad');
    const cantidadActual = cantidadControl?.value || 0;

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

    // RN-05: Si evento inicia en < 24h, máximo 5 entradas
    this.mostrarRestriccion24h = horasAlInicio < 24 && cantidadActual > 0;

    // RF-03: Si precio > $100, máximo 10 entradas
    this.mostrarRestriccionPrecio = this.evento.precio > 100 && cantidadActual > 0;
  }

  private getMaximaPermitida(): number {
    if (!this.evento) return 1;

    const disponibles = this.getEntradasDisponibles();
    const ahora = new Date();
    const horasAlInicio = (new Date(this.evento.fechaInicio).getTime() - ahora.getTime()) / (1000 * 60 * 60);

    let maxima = disponibles;

    // RN-05: Si evento inicia en < 24h, máximo 5 entradas
    if (horasAlInicio < 24) {
      maxima = Math.min(maxima, 5);
    }

    // RF-03: Si precio > $100, máximo 10 entradas
    if (this.evento.precio > 100) {
      maxima = Math.min(maxima, 10);
    }

    return Math.max(1, maxima);
  }

  getEntradasDisponibles(): number {
    if (!this.evento) return 0;
    // Esto debería venir de un reporte, por ahora retornamos la capacidad máxima
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
          this.dialogRef.close(true);
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

  cancelar(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
