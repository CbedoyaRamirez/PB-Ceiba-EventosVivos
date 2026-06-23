import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Venue, CreateVenueDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  constructor(private api: ApiService) {}

  listar(): Observable<Venue[]> {
    return this.api.get<Venue[]>('/venues');
  }

  obtener(id: number): Observable<Venue> {
    return this.api.get<Venue>(`/venues/${id}`);
  }

  crear(dto: CreateVenueDto): Observable<Venue> {
    return this.api.post<Venue>('/venues', dto);
  }

  actualizar(id: number, dto: Partial<CreateVenueDto>): Observable<Venue> {
    return this.api.put<Venue>(`/venues/${id}`, dto);
  }
}
