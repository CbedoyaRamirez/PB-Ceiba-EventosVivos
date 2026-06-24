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
    return this.api.get<Reserva[]>('/reservas', { eventoId });
  }

  obtener(id: string): Observable<Reserva> {
    return this.api.get<Reserva>(`/reservas/${id}`);
  }

  crear(dto: CreateReservaDto): Observable<Reserva> {
    return this.api.post<Reserva>('/reservas', dto);
  }

  confirmarPago(reservaId: string): Observable<Reserva> {
    return this.api.put<Reserva>(`/reservas/${reservaId}/confirmar`, {});
  }

  cancelar(id: string): Observable<Reserva> {
    return this.api.put<Reserva>(`/reservas/${id}/cancelar`, {});
  }
}
