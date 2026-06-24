import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { EstadoEvento } from '../../../core/models';

type EstadoType = EstadoEvento | string;

@Component({
  selector: 'app-estado-badge',
  standalone: true,
  imports: [CommonModule, MatBadgeModule],
  template: `
    <span [ngClass]="getEstadoClass(estado)">
      {{ getEstadoLabel(estado) }}
    </span>
  `,
  styles: [`
    span {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .estado-activo {
      background-color: #10b981;
      color: white;
    }

    .estado-cancelado {
      background-color: #ef4444;
      color: white;
    }

    .estado-completado {
      background-color: #3b82f6;
      color: white;
    }

    .estado-pendiente_pago {
      background-color: #f59e0b;
      color: white;
    }

    .estado-confirmada {
      background-color: #10b981;
      color: white;
    }

    .estado-cancelada {
      background-color: #ef4444;
      color: white;
    }
  `]
})
export class EstadoBadgeComponent {
  @Input() estado!: EstadoType;

  getEstadoClass(estado: EstadoType): string {
    return `estado-${estado}`;
  }

  getEstadoLabel(estado: EstadoType): string {
    const labels: Record<string, string> = {
      'activo': 'Activo',
      'cancelado': 'Cancelado',
      'completado': 'Completado',
      'pendiente_pago': 'Pendiente Pago',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada'
    };
    return labels[estado] || estado;
  }
}
