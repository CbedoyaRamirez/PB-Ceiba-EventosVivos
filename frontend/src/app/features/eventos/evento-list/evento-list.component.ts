import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventoService } from '../../../core/services';
import { Evento } from '../../../core/models';
import { EstadoBadgeComponent } from '../../../shared/components';

@Component({
  selector: 'app-evento-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    EstadoBadgeComponent
  ],
  template: `
    <div class="evento-list-container">
      <div class="header">
        <div>
          <h1>Eventos</h1>
          <p class="subtitle">Descubre y reserva los mejores eventos</p>
        </div>
        <button mat-raised-button color="primary" (click)="crearEvento()">
          <mat-icon>add</mat-icon> Nuevo Evento
        </button>
      </div>

      <div class="content-wrapper">
        <aside class="filtros-panel" [class.expanded]="filtrosExpanded">
          <div class="filtros-header">
            <h2>Filtros</h2>
            <button mat-icon-button (click)="filtrosExpanded = !filtrosExpanded" class="toggle-filtros">
              <mat-icon>{{ filtrosExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </div>

          <form [formGroup]="filtrosForm" class="filtros-form">
            <mat-form-field appearance="outline">
              <mat-label>Buscar por título</mat-label>
              <input matInput formControlName="titulo" placeholder="Ingresa un título..." />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Evento</mat-label>
              <mat-select formControlName="tipo">
                <mat-option value="">Todos</mat-option>
                <mat-option value="conferencia">Conferencia</mat-option>
                <mat-option value="taller">Taller</mat-option>
                <mat-option value="concierto">Concierto</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="estado">
                <mat-option value="">Todos</mat-option>
                <mat-option value="activo">Activo</mat-option>
                <mat-option value="cancelado">Cancelado</mat-option>
                <mat-option value="completado">Completado</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ordenar por</mat-label>
              <mat-select formControlName="ordenar">
                <mat-option value="fecha-asc">Fecha: Próximos</mat-option>
                <mat-option value="fecha-desc">Fecha: Últimos</mat-option>
                <mat-option value="precio-asc">Precio: Menor</mat-option>
                <mat-option value="precio-desc">Precio: Mayor</mat-option>
                <mat-option value="titulo-asc">Título: A-Z</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filtros-actions">
              <button mat-raised-button color="primary" type="button" (click)="cargarEventos()">
                <mat-icon>search</mat-icon> Buscar
              </button>
              <button mat-stroked-button type="button" (click)="limpiarFiltros()" class="btn-clear">
                <mat-icon>clear</mat-icon> Limpiar
              </button>
            </div>
          </form>
        </aside>

        <main class="eventos-main">
          <div *ngIf="cargando" class="skeleton-grid">
            <div *ngFor="let i of [0, 1, 2, 3, 4, 5]" class="skeleton-card">
              <div class="skeleton-header"></div>
              <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>

          <div *ngIf="!cargando && eventosFiltrados.length > 0">
            <p class="result-count">{{ eventosFiltrados.length }} evento{{ eventosFiltrados.length !== 1 ? 's' : '' }} encontrado{{ eventosFiltrados.length !== 1 ? 's' : '' }}</p>
            <div class="eventos-grid">
              <div *ngFor="let evento of eventosFiltrados; trackBy: trackByEvento" class="evento-card-wrapper" [ngClass]="'tipo-' + evento.tipo">
                <mat-card class="evento-card">
                <div class="card-header">
                  <h3 class="evento-titulo">{{ evento.titulo }}</h3>
                  <app-estado-badge [estado]="evento.estado"></app-estado-badge>
                </div>

                <mat-card-content>
                  <p class="evento-descripcion">
                    {{ truncarTexto(evento.descripcion, 120) }}
                  </p>

                  <div class="evento-metadata">
                    <div class="metadata-item">
                      <mat-icon>location_on</mat-icon>
                      <span class="metadata-value">Venue #{{ evento.venueId }}</span>
                    </div>
                    <div class="metadata-item">
                      <mat-icon>event</mat-icon>
                      <span class="metadata-value">{{ evento.fechaInicio | date: 'dd MMM yyyy, HH:mm' }}</span>
                    </div>
                    <div class="metadata-item">
                      <mat-icon>attach_money</mat-icon>
                      <span class="metadata-value precio">{{ evento.precio | currency }}</span>
                    </div>
                  </div>

                  <div class="evento-tipo">
                    <mat-chip-set aria-label="Tipo de evento">
                      <mat-chip [highlighted]="true" disabled>
                        {{ evento.tipo | titlecase }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button (click)="verDetalle(evento.id)">
                    <mat-icon>info</mat-icon> Ver Detalles
                  </button>
                  <button mat-raised-button color="primary" (click)="irAReservar(evento.id)">
                    <mat-icon>bookmark</mat-icon> Reservar
                  </button>
                </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </div>

          <div *ngIf="!cargando && eventos.length === 0" class="empty-state">
            <mat-icon class="empty-icon">event_busy</mat-icon>
            <h3>No hay eventos</h3>
            <p *ngIf="tieneFiltersActivos">No encontramos eventos que coincidan con tus filtros. Intenta cambiar los criterios de búsqueda.</p>
            <p *ngIf="!tieneFiltersActivos">No hay eventos registrados aún. ¡Vuelve pronto!</p>
            <button mat-stroked-button (click)="limpiarFiltros()" *ngIf="tieneFiltersActivos">
              <mat-icon>refresh</mat-icon> Limpiar Filtros
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #4F46E5;
      --font-serif: 'Lora', 'Playfair Display', serif;
    }

    .evento-list-container {
      padding: 32px 24px;
      max-width: 1600px;
      margin: 0 auto;
      background-color: #f9f8ff;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;

      h1 {
        margin: 0 0 8px 0;
        font-family: var(--font-serif);
        font-size: 44px;
        font-weight: 700;
        color: #1f2937;
        letter-spacing: -0.5px;
      }

      .subtitle {
        margin: 0;
        font-size: 16px;
        color: #6b7280;
        font-weight: 400;
      }
    }

    .content-wrapper {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
    }

    .filtros-panel {
      background: white;
      border-radius: 8px;
      padding: 24px;
      height: fit-content;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 24px;

      .filtros-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h2 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .toggle-filtros {
          display: none;
        }
      }

      .filtros-form {
        display: flex;
        flex-direction: column;
        gap: 16px;

        mat-form-field {
          width: 100%;
        }
      }

      .filtros-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;

        .btn-clear {
          flex: 1;
          color: #6b7280;
        }
      }
    }

    .eventos-main {
      display: flex;
      flex-direction: column;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 28px;
    }

    .skeleton-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .skeleton-header {
      height: 24px;
      background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-line {
      height: 12px;
      background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;

      &.short {
        width: 60%;
      }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .result-count {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 20px;
      margin-top: 0;
    }

    .eventos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 28px;
      animation: fadeIn 300ms ease-in-out;
    }

    .evento-card-wrapper {
      display: flex;
      perspective: 1000px;

      &.tipo-conferencia .evento-card {
        border-left: 4px solid #4F46E5;
      }

      &.tipo-taller .evento-card {
        border-left: 4px solid #10b981;
      }

      &.tipo-concierto .evento-card {
        border-left: 4px solid #8b5cf6;
      }
    }

    .evento-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
      overflow: hidden;

      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .card-header {
        padding: 24px 24px 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;

        .evento-titulo {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.3;
          flex: 1;
        }
      }

      mat-card-content {
        flex: 1;
        padding: 12px 24px 20px 24px;

        .evento-descripcion {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .evento-metadata {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;

          .metadata-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #6b7280;

            mat-icon {
              width: 18px;
              height: 18px;
              font-size: 18px;
              color: var(--primary);
              opacity: 0.8;
            }

            .metadata-value {
              font-weight: 500;

              &.precio {
                font-weight: 700;
                color: var(--primary);
              }
            }
          }
        }

        .evento-tipo {
          ::ng-deep .mat-mdc-chip {
            background-color: #f0f4ff !important;
            color: var(--primary) !important;
            font-weight: 600;
            font-size: 12px;
          }
        }
      }

      mat-card-actions {
        display: flex;
        gap: 8px;
        padding: 16px 24px;
        border-top: 1px solid #f3f4f6;

        button {
          flex: 1;
          font-weight: 500;

          &:first-child {
            color: var(--primary);
          }
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 80px 24px;
      text-align: center;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #d1d5db;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: #1f2937;
        font-weight: 600;
      }

      p {
        max-width: 400px;
        margin: 0 0 24px 0;
        color: #6b7280;
        line-height: 1.6;
      }
    }

    @media (max-width: 1024px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }

      .filtros-panel {
        position: relative;
        top: 0;

        .filtros-header .toggle-filtros {
          display: block;
        }

        .filtros-form {
          max-height: 400px;
          overflow-y: auto;
        }

        &:not(.expanded) .filtros-form {
          display: none;
        }
      }

      .eventos-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
    }

    @media (max-width: 640px) {
      .evento-list-container {
        padding: 16px 12px;
      }

      .header {
        flex-direction: column;
        gap: 16px;

        h1 {
          font-size: 32px;
        }
      }

      .eventos-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class EventoListComponent implements OnInit, OnDestroy {
  eventos: Evento[] = [];
  cargando = true;
  filtrosExpanded = true;
  filtrosForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private eventoService: EventoService,
    private fb: FormBuilder,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.filtrosForm = this.fb.group({
      titulo: [''],
      tipo: [''],
      estado: [''],
      ordenar: ['fecha-asc']
    });
  }

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.cargando = true;
    const { ordenar, ...filtros } = this.filtrosForm.value;
    console.log('Cargando eventos con filtros:', filtros);
    this.eventoService
      .listar(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (eventos) => {
          console.log('Eventos cargados:', eventos);
          this.ngZone.run(() => {
            this.eventos = eventos;
            this.cargando = false;
          });
        },
        error: (err) => {
          console.log('Error cargando eventos:', err);
          this.ngZone.run(() => {
            this.cargando = false;
          });
        }
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      titulo: '',
      tipo: '',
      estado: '',
      ordenar: 'fecha-asc'
    });
  }

  get tieneFiltersActivos(): boolean {
    const { titulo, tipo, estado } = this.filtrosForm.value;
    return !!(titulo || tipo || estado);
  }

  get eventosFiltrados(): Evento[] {
    let resultado = [...this.eventos];
    const ordenar = this.filtrosForm.get('ordenar')?.value || 'fecha-asc';

    switch (ordenar) {
      case 'fecha-asc':
        resultado.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
        break;
      case 'fecha-desc':
        resultado.sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
        break;
      case 'precio-asc':
        resultado.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        resultado.sort((a, b) => b.precio - a.precio);
        break;
      case 'titulo-asc':
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
    }
    return resultado;
  }

  trackByEvento(index: number, evento: Evento): string {
    return evento.id;
  }

  truncarTexto(texto: string, maxLength: number): string {
    if (texto.length > maxLength) {
      return texto.substring(0, maxLength) + '...';
    }
    return texto;
  }

  verDetalle(eventoId: string): void {
    this.router.navigate(['/eventos', eventoId]);
  }

  irAReservar(eventoId: string): void {
    this.router.navigate(['/eventos', eventoId]);
  }

  crearEvento(): void {
    this.router.navigate(['/eventos/nuevo']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
