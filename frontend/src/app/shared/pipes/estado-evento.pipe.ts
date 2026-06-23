import { Pipe, PipeTransform } from '@angular/core';
import { EstadoEvento } from '../../core/models';

@Pipe({
  name: 'estadoEvento',
  standalone: true
})
export class EstadoEventoPipe implements PipeTransform {
  transform(value: EstadoEvento): string {
    const estadosMap: Record<EstadoEvento, string> = {
      'activo': 'Activo',
      'cancelado': 'Cancelado',
      'completado': 'Completado'
    };
    return estadosMap[value] || value;
  }
}

@Pipe({
  name: 'estadoReserva',
  standalone: true
})
export class EstadoReservaPipe implements PipeTransform {
  transform(value: string): string {
    const estadosMap: Record<string, string> = {
      'pendiente_pago': 'Pendiente de Pago',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada'
    };
    return estadosMap[value] || value;
  }
}
