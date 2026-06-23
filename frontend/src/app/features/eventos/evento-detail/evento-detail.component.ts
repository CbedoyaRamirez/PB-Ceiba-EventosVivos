import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventoService, ReservaService } from '../../../core/services';
import { Evento, Reserva } from '../../../core/models';
import { EstadoBadgeComponent, ConfirmDialogComponent } from '../../../shared/components';
import { ReservaFormComponent } from '../../reservas/reserva-form/reserva-form.component';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    EstadoBadgeComponent,
    ReservaFormComponent
  ],
  template: `
    <div class="detail-wrapper">
      <div class="detail-container">
        <button mat-icon-button (click)="volver()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>

        <div *ngIf="!cargando; else loading" class="detail-content">
          <div *ngIf="evento" class="header-section">
            <div class="header-info">
              <h1 class="evento-titulo">{{ evento.titulo }}</h1>
              <p class="evento-descripcion">{{ evento.descripcion }}</p>
              <app-estado-badge [estado]="evento.estado"></app-estado-badge>
            </div>
            <button mat-raised-button color="primary" class="btn-reservar"
                    (click)="abrirFormReserva()" [disabled]="evento.estado !== 'activo'">
              <mat-icon>bookmark</mat-icon> Reservar Ahora
            </button>
          </div>

          <mat-tab-group class="event-tabs" animationDuration="300">
            <!-- TAB 1: Información -->
            <mat-tab label="Información">
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">info</mat-icon>
                <span>Información</span>
              </ng-template>

              <div class="tab-content">
                <div class="info-grid">
                  <div class="info-card">
                    <div class="info-label">
                      <mat-icon>category</mat-icon> Tipo
                    </div>
                    <p class="info-value">{{ evento?.tipo | titlecase }}</p>
                  </div>

                  <div class="info-card">
                    <div class="info-label">
                      <mat-icon>location_on</mat-icon> Venue
                    </div>
                    <p class="info-value">Venue #{{ evento?.venueId }}</p>
                  </div>

                  <div class="info-card">
                    <div class="info-label">
                      <mat-icon>event</mat-icon> Inicio
                    </div>
                    <p class="info-value">{{ evento?.fechaInicio | date: 'dd MMM yyyy, HH:mm' }}</p>
                  </div>

                  <div class="info-card">
                    <div class="info-label">
                      <mat-icon>event_note</mat-icon> Fin
                    </div>
                    <p class="info-value">{{ evento?.fechaFin | date: 'dd MMM yyyy, HH:mm' }}</p>
                  </div>

                  <div class="info-card">
                    <div class="info-label">
                      <mat-icon>attach_money</mat-icon> Precio
                    </div>
                    <p class="info-value">{{ evento?.precio | currency }}</p>
                  </div>

                  <div class="info-card">
                    <div class="info-label">
                      <mat-icon>people</mat-icon> Capacidad
                    </div>
                    <p class="info-value">{{ evento?.capacidadMaxima }} personas</p>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- TAB 2: Reporte -->
            <mat-tab label="Reporte">
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">bar_chart</mat-icon>
                <span>Reporte</span>
              </ng-template>

              <div class="tab-content">
                <div *ngIf="reporte" class="reporte-container">
                  <div class="reporte-stats">
                    <div class="stat-card primary">
                      <div class="stat-label">Total Reservas</div>
                      <div class="stat-value">{{ reporte.reservasTotal }}</div>
                    </div>

                    <div class="stat-card success">
                      <div class="stat-label">Confirmadas</div>
                      <div class="stat-value">{{ reporte.reservasConfirmadas }}</div>
                    </div>

                    <div class="stat-card warning">
                      <div class="stat-label">Pendientes</div>
                      <div class="stat-value">{{ reporte.reservasPendientes }}</div>
                    </div>

                    <div class="stat-card highlight">
                      <div class="stat-label">Ingreso Total</div>
                      <div class="stat-value">{{ reporte.ingresoTotal | currency }}</div>
                    </div>
                  </div>

                  <div class="ocupacion-section">
                    <h3>Ocupación del Evento</h3>
                    <div class="ocupacion-bar">
                      <mat-progress-bar mode="determinate"
                                        [value]="reporte.capacidadUtilizada">
                      </mat-progress-bar>
                      <span class="ocupacion-text">{{ reporte.capacidadUtilizada }}% ocupado</span>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- TAB 3: Reservas -->
            <mat-tab label="Reservas">
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">receipt_long</mat-icon>
                <span>Reservas</span>
              </ng-template>

              <div class="tab-content">
                <div *ngIf="reservas.length > 0" class="reservas-section">
                  <table mat-table [dataSource]="reservas" class="reservas-table">
                    <ng-container matColumnDef="codigoReserva">
                      <th mat-header-cell *matHeaderCellDef>Código</th>
                      <td mat-cell *matCellDef="let reserva">
                        <span class="codigo-badge">{{ reserva.codigoReserva || '-' }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="nombreComprador">
                      <th mat-header-cell *matHeaderCellDef>Comprador</th>
                      <td mat-cell *matCellDef="let reserva">{{ reserva.nombreComprador }}</td>
                    </ng-container>

                    <ng-container matColumnDef="emailComprador">
                      <th mat-header-cell *matHeaderCellDef>Email</th>
                      <td mat-cell *matCellDef="let reserva">{{ reserva.emailComprador }}</td>
                    </ng-container>

                    <ng-container matColumnDef="cantidad">
                      <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                      <td mat-cell *matCellDef="let reserva" class="cantidad-cell">
                        <span class="quantity-badge">{{ reserva.cantidad }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="estado">
                      <th mat-header-cell *matHeaderCellDef>Estado</th>
                      <td mat-cell *matCellDef="let reserva">
                        <app-estado-badge [estado]="reserva.estado"></app-estado-badge>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="acciones">
                      <th mat-header-cell *matHeaderCellDef>Acciones</th>
                      <td mat-cell *matCellDef="let reserva">
                        <button mat-icon-button *ngIf="reserva.estado === 'pendiente_pago'"
                                (click)="confirmarPago(reserva)" matTooltip="Confirmar pago">
                          <mat-icon>check_circle</mat-icon>
                        </button>
                        <button mat-icon-button *ngIf="reserva.estado === 'confirmada'"
                                (click)="cancelarReserva(reserva)" matTooltip="Cancelar reserva"
                                class="btn-danger">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="columnasReservas"></tr>
                    <tr mat-row *matRowDef="let row; columns: columnasReservas;"></tr>
                  </table>
                </div>

                <div *ngIf="reservas.length === 0" class="empty-reservas">
                  <mat-icon>bookmark_border</mat-icon>
                  <p>No hay reservas para este evento</p>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>

          <div class="actions-section">
            <button mat-stroked-button [routerLink]="['/eventos', evento?.id, 'editar']"
                    *ngIf="evento?.estado === 'activo'">
              <mat-icon>edit</mat-icon> Editar Evento
            </button>
            <button mat-raised-button color="warn" (click)="cancelarEvento()"
                    *ngIf="evento?.estado === 'activo'">
              <mat-icon>close</mat-icon> Cancelar Evento
            </button>
          </div>
        </div>

        <ng-template #loading>
          <div class="loading">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Cargando información del evento...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #4F46E5;
      --font-serif: 'Lora', 'Playfair Display', serif;
    }

    .detail-wrapper {
      background: linear-gradient(135deg, #f9f8ff 0%, #f0f4ff 100%);
      min-height: 100vh;
      padding: 24px;
    }

    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-button {
      margin-bottom: 24px;
      color: #6b7280;

      &:hover {
        color: var(--primary);
      }
    }

    .detail-content {
      animation: slideUp 300ms ease-out;
    }

    .header-section {
      background: white;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;

      .header-info {
        flex: 1;

        .evento-titulo {
          margin: 0 0 12px 0;
          font-family: var(--font-serif);
          font-size: 36px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
        }

        .evento-descripcion {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #6b7280;
          line-height: 1.6;
          max-width: 600px;
        }
      }

      .btn-reservar {
        min-width: 160px;
        height: 48px;
        font-weight: 600;
        font-size: 16px;
      }
    }

    .event-tabs {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;

      ::ng-deep {
        .mat-mdc-tab-labels {
          border-bottom: 1px solid #e5e7eb;
        }

        .mat-mdc-tab {
          min-width: 160px !important;
        }

        .mat-mdc-tab-header-pagination {
          display: none;
        }
      }
    }

    .tab-icon {
      margin-right: 8px;
    }

    .tab-content {
      padding: 32px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .info-card {
      padding: 20px;
      background: #f9f8ff;
      border-radius: 8px;
      border-left: 4px solid var(--primary);

      .info-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6b7280;
        margin-bottom: 8px;

        mat-icon {
          width: 18px;
          height: 18px;
          font-size: 18px;
          color: var(--primary);
        }
      }

      .info-value {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .reporte-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .reporte-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      color: white;

      .stat-label {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
      }

      &.primary {
        background: linear-gradient(135deg, var(--primary) 0%, #6366f1 100%);
      }

      &.success {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      }

      &.highlight {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }
    }

    .ocupacion-section {
      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }

      .ocupacion-bar {
        display: flex;
        flex-direction: column;
        gap: 8px;

        mat-progress-bar {
          height: 24px !important;
          border-radius: 4px;

          ::ng-deep {
            .mdc-linear-progress__bar-inner {
              background: linear-gradient(90deg, var(--primary), #6366f1) !important;
            }
          }
        }

        .ocupacion-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
        }
      }
    }

    .reservas-section {
      overflow-x: auto;
    }

    .reservas-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: #f9f8ff;
        font-weight: 700;
        text-align: left;
        padding: 16px;
        border-bottom: 2px solid #e5e7eb;
        color: #1f2937;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        color: #6b7280;

        .codigo-badge {
          background: #f0f4ff;
          color: var(--primary);
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
        }

        .quantity-badge {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        button {
          &.btn-danger {
            color: #ef4444;
          }
        }
      }

      tr:hover {
        background: #fafafa;
      }
    }

    .empty-reservas {
      text-align: center;
      padding: 48px 24px;
      color: #9ca3af;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.5;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }

    .actions-section {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 24px 32px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

      button {
        min-width: 140px;
        font-weight: 600;
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 80px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      gap: 16px;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .header-section {
        flex-direction: column;
        gap: 16px;

        .evento-titulo {
          font-size: 28px;
        }

        .btn-reservar {
          width: 100%;
        }
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .reporte-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .actions-section {
        flex-direction: column;

        button {
          width: 100%;
        }
      }

      .reservas-table {
        font-size: 12px;

        th, td {
          padding: 12px 8px;
        }
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class EventoDetailComponent implements OnInit, OnDestroy {
  evento: Evento | null = null;
  reservas: Reserva[] = [];
  reporte: any = null;
  cargando = true;
  columnasReservas = ['codigoReserva', 'nombreComprador', 'emailComprador', 'cantidad', 'estado', 'acciones'];
  private destroy$ = new Subject<void>();

  constructor(
    private eventoService: EventoService,
    private reservaService: ReservaService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.cargarDatos(id);
      }
    });
  }

  cargarDatos(id: string): void {
    this.cargando = true;
    this.eventoService
      .obtener(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (evento) => {
          this.evento = evento;
          this.cargarReservas(id);
          this.cargarReporte(id);
        }
      });
  }

  cargarReservas(eventoId: string): void {
    this.reservaService
      .listarPorEvento(eventoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reservas) => {
          this.reservas = reservas;
          this.cargando = false;
        }
      });
  }

  cargarReporte(id: string): void {
    this.eventoService
      .reporte(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reporte) => {
          this.reporte = reporte;
        }
      });
  }

  abrirFormReserva(): void {
    if (!this.evento) return;

    this.dialog.open(ReservaFormComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: { evento: this.evento }
    }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado) => {
        if (resultado) {
          this.cargarReservas(this.evento!.id);
          this.cargarReporte(this.evento!.id);
        }
      });
  }

  confirmarPago(reserva: Reserva): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar Pago',
        mensaje: `¿Deseas confirmar el pago de la reserva ${reserva.codigoReserva}?`,
        textoBtnAceptar: 'Confirmar',
        tipo: 'info'
      }
    }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado) => {
        if (resultado && this.evento) {
          this.reservaService
            .confirmarPago(reserva.id, 'tarjeta')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Pago confirmado exitosamente', 'Cerrar', {
                  duration: 3000,
                  panelClass: 'success-snackbar'
                });
                this.cargarReservas(this.evento!.id);
                this.cargarReporte(this.evento!.id);
              },
              error: () => {
                this.snackBar.open('Error al confirmar el pago', 'Cerrar', {
                  duration: 3000,
                  panelClass: 'error-snackbar'
                });
              }
            });
        }
      });
  }

  cancelarReserva(reserva: Reserva): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cancelar Reserva',
        mensaje: `¿Deseas cancelar la reserva ${reserva.codigoReserva}? Esta acción no se puede deshacer.`,
        textoBtnAceptar: 'Cancelar Reserva',
        tipo: 'warning'
      }
    }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado) => {
        if (resultado && this.evento) {
          this.reservaService
            .cancelar(reserva.id, 'Cancelada por el administrador')
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Reserva cancelada', 'Cerrar', {
                  duration: 3000,
                  panelClass: 'success-snackbar'
                });
                this.cargarReservas(this.evento!.id);
                this.cargarReporte(this.evento!.id);
              },
              error: () => {
                this.snackBar.open('Error al cancelar la reserva', 'Cerrar', {
                  duration: 3000,
                  panelClass: 'error-snackbar'
                });
              }
            });
        }
      });
  }

  cancelarEvento(): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cancelar Evento',
        mensaje: 'Esta acción no se puede deshacer. Todas las reservas serán canceladas.',
        textoBtnAceptar: 'Cancelar Evento',
        tipo: 'warning'
      }
    }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado) => {
        if (resultado && this.evento) {
          this.eventoService
            .cancelar(this.evento.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Evento cancelado', 'Cerrar', {
                  duration: 3000,
                  panelClass: 'success-snackbar'
                });
                this.router.navigate(['/eventos']);
              },
              error: () => {
                this.snackBar.open('Error al cancelar el evento', 'Cerrar', {
                  duration: 3000,
                  panelClass: 'error-snackbar'
                });
              }
            });
        }
      });
  }

  volver(): void {
    this.router.navigate(['/eventos']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
