import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReservaService } from '../../../core/services';
import { Reserva } from '../../../core/models';
import { EstadoBadgeComponent, ConfirmDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-reserva-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    EstadoBadgeComponent
  ],
  template: `
    <div class="panel-container">
      <div class="hero-header">
        <div class="hero-content">
          <h1 class="hero-title">Reservas</h1>
          <p class="hero-subtitle">Gestiona todas tus reservas en un solo lugar</p>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-card stat-total">
          <h3 class="stat-label">Total</h3>
          <p class="stat-value">{{ reservas.length }}</p>
        </div>
        <div class="stat-card stat-confirmed">
          <h3 class="stat-label">Confirmadas</h3>
          <p class="stat-value">{{ reservasConfirmadas }}</p>
        </div>
        <div class="stat-card stat-pending">
          <h3 class="stat-label">Pendientes</h3>
          <p class="stat-value">{{ reservasPendientes }}</p>
        </div>
      </div>

      <div class="table-wrapper">
        <div *ngIf="cargando" class="skeleton-loader">
          <div class="skeleton-row" *ngFor="let i of [0, 1, 2, 3, 4]"></div>
        </div>

        <table mat-table [dataSource]="reservas" class="reservas-table" *ngIf="!cargando">
          <ng-container matColumnDef="codigoReserva">
            <th mat-header-cell *matHeaderCellDef>Código</th>
            <td mat-cell *matCellDef="let reserva">{{ reserva.codigoReserva || '-' }}</td>
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
            <td mat-cell *matCellDef="let reserva">{{ reserva.cantidad }}</td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let reserva">
              <app-estado-badge [estado]="reserva.estado"></app-estado-badge>
            </td>
          </ng-container>

          <ng-container matColumnDef="creadoEn">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let reserva">
              {{ reserva.creadoEn | date: 'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let reserva">
              <button
                mat-icon-button
                [disabled]="reserva.estado === 'confirmada'"
                (click)="confirmarPago(reserva)"
                matTooltip="Confirmar pago">
                <mat-icon>check_circle</mat-icon>
              </button>
              <button
                mat-icon-button
                [disabled]="reserva.estado === 'cancelada'"
                (click)="cancelarReserva(reserva)"
                matTooltip="Cancelar reserva">
                <mat-icon>close</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let row; columns: columnas;" class="data-row"></tr>
        </table>

        <div *ngIf="!cargando && reservas.length === 0" class="empty-state">
          <mat-icon class="empty-icon">event_note</mat-icon>
          <h3>No hay reservas</h3>
          <p>Cuando haya reservas disponibles, aparecerán aquí</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel-container {
      padding: 0;
      margin: 0;
      background: #f9f8ff;
      min-height: 100vh;
    }

    .hero-header {
      background: linear-gradient(135deg, #4F46E5 0%, #6366f1 100%);
      padding: 48px 24px;
      color: white;
      margin-bottom: 32px;
    }

    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero-title {
      margin: 0 0 8px 0;
      font-size: 44px;
      font-weight: 700;
      font-family: var(--font-serif, 'Lora', serif);
      letter-spacing: -0.5px;
    }

    .hero-subtitle {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
      font-weight: 400;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 0 24px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .stat-card {
      border-radius: 12px;
      padding: 24px;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-total {
      background: linear-gradient(135deg, #4F46E5 0%, #6366f1 100%);
    }

    .stat-confirmed {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    }

    .stat-pending {
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    }

    .stat-label {
      margin: 0 0 8px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
      opacity: 0.9;
    }

    .stat-value {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }

    .table-wrapper {
      padding: 0 24px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .skeleton-loader {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .skeleton-row {
      height: 48px;
      background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .reservas-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px 8px 0 0;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    th {
      background: #f0eeff;
      font-weight: 600;
      text-align: left;
      padding: 12px 16px;
      border-bottom: 2px solid #e8e6ff;
      color: #4F46E5;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 14px 16px;
      border-bottom: 1px solid #f0eeff;
      color: #1f2937;
    }

    .data-row {
      transition: background-color 200ms;
      animation: fadeIn 0.3s ease-out;
    }

    .data-row:hover {
      background: rgba(79, 70, 229, 0.04);
    }

    .empty-state {
      text-align: center;
      padding: 60px 24px;
      background: white;
      border-radius: 8px;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      color: #d1d5db;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #374151;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    button[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ReservaPanelComponent implements OnInit, OnDestroy {
  reservas: Reserva[] = [];
  cargando = false;
  columnas = ['codigoReserva', 'nombreComprador', 'emailComprador', 'cantidad', 'estado', 'creadoEn', 'acciones'];
  private destroy$ = new Subject<void>();

  constructor(
    private reservaService: ReservaService,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get reservasConfirmadas(): number {
    return this.reservas.filter(r => r.estado === 'confirmada').length;
  }

  get reservasPendientes(): number {
    return this.reservas.filter(r => r.estado === 'pendiente_pago').length;
  }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.reservaService
      .listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reservas) => {
          this.reservas = reservas;
          this.cargando = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargando = false;
          this.cdr.markForCheck();
        }
      });
  }

  confirmarPago(reserva: Reserva): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      panelClass: 'ev-confirm-dialog',
      data: {
        titulo: 'Confirmar Pago',
        mensaje: `¿Confirmar pago de reserva ${reserva.codigoReserva || 'N/A'} de ${reserva.nombreComprador}?`,
        textoBtnAceptar: 'Confirmar',
        tipo: 'info'
      }
    }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado) => {
        if (resultado) {
          this.reservaService
            .confirmarPago(reserva.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.cargarReservas();
              }
            });
        }
      });
  }

  cancelarReserva(reserva: Reserva): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      panelClass: 'ev-confirm-dialog',
      data: {
        titulo: 'Cancelar Reserva',
        mensaje: `¿Cancelar reserva ${reserva.codigoReserva || 'N/A'} de ${reserva.nombreComprador}?`,
        textoBtnAceptar: 'Cancelar',
        tipo: 'error'
      }
    }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((resultado) => {
        if (resultado) {
          this.reservaService
            .cancelar(reserva.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.cargarReservas();
              }
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
