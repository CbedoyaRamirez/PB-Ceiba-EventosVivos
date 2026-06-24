import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventoService, VenueService } from '../../../core/services';
import { CreateEventoDto, Venue, Evento } from '../../../core/models';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule
  ],
  template: `
    <div class="form-wrapper">
      <div class="form-container">
        <button mat-button class="back-button" (click)="cancelar()">
          <mat-icon>arrow_back</mat-icon>
          Volver a eventos
        </button>

        <div class="form-header">
          <h1>{{ modoEdicion ? 'Editar Evento' : 'Crear Nuevo Evento' }}</h1>
          <p class="form-description">
            {{ modoEdicion
              ? 'Actualiza la información del evento'
              : 'Completa los campos para crear un nuevo evento' }}
          </p>
        </div>

        <form [formGroup]="eventoForm" (ngSubmit)="guardar()" class="evento-form">
          <div class="form-section">
            <h2 class="section-title">Información Básica</h2>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título del Evento</mat-label>
              <input matInput formControlName="titulo" maxlength="100" placeholder="Ej: Conferencia de Tecnología 2026" />
              <mat-icon matSuffix>event</mat-icon>
              <mat-hint align="end">{{ eventoForm.get('titulo')?.value?.length || 0 }}/100</mat-hint>
              <mat-error *ngIf="getFieldError('titulo', 'required')">
                El título es obligatorio
              </mat-error>
              <mat-error *ngIf="getFieldError('titulo', 'minlength')">
                Mínimo 5 caracteres
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="descripcion" rows="4" maxlength="500"
                        placeholder="Describe brevemente el evento..."></textarea>
              <mat-hint align="end">{{ eventoForm.get('descripcion')?.value?.length || 0 }}/500</mat-hint>
              <mat-error *ngIf="getFieldError('descripcion', 'required')">
                La descripción es obligatoria
              </mat-error>
              <mat-error *ngIf="getFieldError('descripcion', 'minlength')">
                Mínimo 10 caracteres
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h2 class="section-title">Detalles del Evento</h2>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo de Evento</mat-label>
              <mat-select formControlName="tipo">
                <mat-option value="conferencia">
                  <mat-icon class="option-icon">school</mat-icon> Conferencia
                </mat-option>
                <mat-option value="taller">
                  <mat-icon class="option-icon">build</mat-icon> Taller
                </mat-option>
                <mat-option value="concierto">
                  <mat-icon class="option-icon">music_note</mat-icon> Concierto
                </mat-option>
              </mat-select>
              <mat-error *ngIf="getFieldError('tipo', 'required')">
                Selecciona un tipo de evento
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Venue</mat-label>
              <mat-select formControlName="venueId">
                <mat-option *ngFor="let venue of venues" [value]="venue.id">
                  {{ venue.nombre }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="getFieldError('venueId', 'required')">
                Selecciona un venue
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Capacidad Máxima</mat-label>
              <input matInput formControlName="capacidadMaxima" type="number" min="1"
                     placeholder="Ej: 100" />
              <mat-icon matSuffix>people</mat-icon>
              <mat-error *ngIf="getFieldError('capacidadMaxima', 'required')">
                La capacidad es obligatoria
              </mat-error>
              <mat-error *ngIf="getFieldError('capacidadMaxima', 'min')">
                Debe ser mayor a 0
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h2 class="section-title">Fecha y Horario</h2>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha y Hora de Inicio</mat-label>
              <input matInput [matDatepicker]="picker1" formControlName="fechaInicio"
                     placeholder="Selecciona fecha y hora" />
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
              <mat-error *ngIf="getFieldError('fechaInicio', 'required')">
                La fecha de inicio es obligatoria
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha y Hora de Fin</mat-label>
              <input matInput [matDatepicker]="picker2" formControlName="fechaFin"
                     placeholder="Selecciona fecha y hora" />
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
              <mat-error *ngIf="getFieldError('fechaFin', 'required')">
                La fecha de fin es obligatoria
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h2 class="section-title">Precio</h2>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Precio (USD)</mat-label>
              <input matInput formControlName="precio" type="number" step="0.01" min="0"
                     placeholder="Ej: 50.00" />
              <span matPrefix>$</span>
              <mat-error *ngIf="getFieldError('precio', 'required')">
                El precio es obligatorio
              </mat-error>
              <mat-error *ngIf="getFieldError('precio', 'min')">
                El precio debe ser mayor o igual a 0
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="cancelar()" class="btn-cancel">
              <mat-icon>close</mat-icon> Cancelar
            </button>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="!eventoForm.valid || enviando" class="btn-submit">
              <mat-icon *ngIf="!enviando">save</mat-icon>
              <mat-spinner *ngIf="enviando" diameter="20" class="spinner-inline"></mat-spinner>
              {{ enviando
                ? 'Guardando...'
                : (modoEdicion ? 'Actualizar Evento' : 'Crear Evento') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #4F46E5;
      --font-serif: 'Lora', 'Playfair Display', serif;
    }

    .form-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #f9f8ff 0%, #f0f4ff 100%);
      padding: 32px 24px;
    }

    .form-container {
      max-width: 580px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .back-button {
      margin-bottom: 24px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover {
        color: var(--primary);
      }
    }

    .form-header {
      margin-bottom: 32px;

      h1 {
        margin: 0 0 8px 0;
        font-family: var(--font-serif);
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
      }

      .form-description {
        margin: 0;
        font-size: 15px;
        color: #6b7280;
        font-weight: 400;
      }
    }

    .evento-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .section-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #9ca3af;
      }
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      ::ng-deep {
        .mat-mdc-form-field-hint {
          font-size: 12px !important;
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
      justify-content: flex-end;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;

      button {
        min-width: 140px;
        font-weight: 600;
        letter-spacing: 0.3px;

        &.btn-cancel {
          color: #6b7280;
        }
      }
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 8px;
    }

    @media (max-width: 640px) {
      .form-wrapper {
        padding: 16px 12px;
      }

      .form-container {
        padding: 24px;
      }

      .form-header h1 {
        font-size: 24px;
      }

      .form-actions {
        flex-direction: column-reverse;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class EventoFormComponent implements OnInit, OnDestroy {
  eventoForm: FormGroup;
  venues: Venue[] = [];
  modoEdicion = false;
  eventoId: string | null = null;
  enviando = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private venueService: VenueService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.eventoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      venueId: [null, Validators.required],
      capacidadMaxima: [0, [Validators.required, Validators.min(1)]],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      tipo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarVenues();
    this.verificarModoEdicion();
  }

  cargarVenues(): void {
    this.venueService
      .listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (venues) => {
          this.venues = venues;
        }
      });
  }

  verificarModoEdicion(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.modoEdicion = true;
        this.eventoId = id;
        this.cargarEvento(id);
      }
    });
  }

  cargarEvento(id: string): void {
    this.eventoService
      .obtener(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (evento: Evento) => {
          this.eventoForm.patchValue({
            titulo: evento.titulo,
            descripcion: evento.descripcion,
            venueId: evento.venueId,
            capacidadMaxima: evento.capacidadMaxima,
            fechaInicio: new Date(evento.fechaInicio),
            fechaFin: new Date(evento.fechaFin),
            precio: evento.precio,
            tipo: evento.tipo
          });
        }
      });
  }

  guardar(): void {
    if (!this.eventoForm.valid) return;

    this.enviando = true;
    const dto: CreateEventoDto = this.eventoForm.value;

    const operacion = this.modoEdicion && this.eventoId
      ? this.eventoService.actualizar(this.eventoId, dto)
      : this.eventoService.crear(dto);

    operacion.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.enviando = false;
        this.snackBar.open(
          this.modoEdicion ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente',
          'Cerrar',
          { duration: 3000, panelClass: 'success-snackbar' }
        );
        this.router.navigate(['/eventos']);
      },
      error: () => {
        this.enviando = false;
        this.snackBar.open(
          'Error al guardar el evento',
          'Cerrar',
          { duration: 3000, panelClass: 'error-snackbar' }
        );
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/eventos']);
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    const field = this.eventoForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
