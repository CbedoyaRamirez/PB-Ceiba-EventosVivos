import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Reserva, CreateReservaDto, ConfirmarPagoDto, CancelarReservaDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  constructor(private api: ApiService) {}

  listar(eventoId?: string): Observable<Reserva[]> {
    const params = eventoId ? { eventoId } : undefined;
    return this.api.get<Reserva[]>('/reservas', params);
  }

  listarPorEvento(eventoId: string): Observable<Reserva[]> {
    return this.api.get<Reserva[]>(`/eventos/${eventoId}/reservas`);
  }

  obtener(id: string): Observable<Reserva> {
    return this.api.get<Reserva>(`/reservas/${id}`);
  }

  crear(dto: CreateReservaDto): Observable<Reserva> {
    return this.api.post<Reserva>('/reservas', dto);
  }

  confirmarPago(reservaId: string, metodoPago: string, referenciaTransaccion?: string): Observable<Reserva> {
    const payload = {
      metodoPago,
      referenciaTransaccion: referenciaTransaccion || ''
    };
    return this.api.patch<Reserva>(`/reservas/${reservaId}/confirmar-pago`, payload);
  }

  cancelar(id: string, razon: string): Observable<Reserva> {
    return this.api.patch<Reserva>(`/reservas/${id}/cancelar`, { razon });
  }
}
