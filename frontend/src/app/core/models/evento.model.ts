export type TipoEvento = 'conferencia' | 'taller' | 'concierto';
export type EstadoEvento = 'activo' | 'cancelado' | 'completado';

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  venueId: number;
  capacidadMaxima: number;
  fechaInicio: Date;
  fechaFin: Date;
  precio: number;
  tipo: TipoEvento;
  estado: EstadoEvento;
  creadoEn: Date;
}

export interface CreateEventoDto {
  titulo: string;
  descripcion: string;
  venueId: number;
  capacidadMaxima: number;
  fechaInicio: Date;
  fechaFin: Date;
  precio: number;
  tipo: TipoEvento;
}

export interface UpdateEventoDto extends Partial<CreateEventoDto> {
  estado?: EstadoEvento;
}

export interface ReporteEvento {
  eventoId: string;
  entradasVendidas: number;
  entradasDisponibles: number;
  porcentajeOcupacion: number;
  ingresosTotales: number;
  estadoEvento: string;
}
