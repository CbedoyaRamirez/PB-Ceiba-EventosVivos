export interface Venue {
  id: number;
  nombre: string;
  capacidad: number;
  ciudad: string;
  direccion?: string;
  telefonoPrincipal?: string;
}

export interface CreateVenueDto {
  nombre: string;
  capacidad: number;
  ciudad: string;
  direccion?: string;
  telefonoPrincipal?: string;
}
