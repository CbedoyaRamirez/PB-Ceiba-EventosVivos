import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Evento, CreateEventoDto, UpdateEventoDto, ReporteEvento } from '../models';

export interface FiltrosEvento {
  tipo?: string;
  estado?: string;
  venueId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  titulo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  constructor(private api: ApiService) {}

  listar(filtros?: FiltrosEvento): Observable<Evento[]> {
    const params = filtros ? this.normalizeFiltros(filtros) : undefined;
    return this.api.get<Evento[]>('/eventos', params);
  }

  obtener(id: string): Observable<Evento> {
    return this.api.get<Evento>(`/eventos/${id}`);
  }

  crear(dto: CreateEventoDto): Observable<Evento> {
    return this.api.post<Evento>('/eventos', dto);
  }

  actualizar(id: string, dto: UpdateEventoDto): Observable<Evento> {
    return this.api.put<Evento>(`/eventos/${id}`, dto);
  }

  cancelar(id: string): Observable<Evento> {
    return this.api.patch<Evento>(`/eventos/${id}/cancelar`, {});
  }

  reporte(id: string): Observable<ReporteEvento> {
    return this.api.get<ReporteEvento>(`/eventos/${id}/reporte`);
  }

  private normalizeFiltros(filtros: FiltrosEvento): Record<string, any> {
    const normalized: Record<string, any> = {};

    if (filtros.tipo) normalized['tipo'] = filtros.tipo;
    if (filtros.estado) normalized['estado'] = filtros.estado;
    if (filtros.venueId) normalized['venueId'] = filtros.venueId;
    if (filtros.fechaInicio) normalized['fechaInicio'] = filtros.fechaInicio.toISOString();
    if (filtros.fechaFin) normalized['fechaFin'] = filtros.fechaFin.toISOString();
    if (filtros.titulo) normalized['titulo'] = filtros.titulo;

    return normalized;
  }
}
