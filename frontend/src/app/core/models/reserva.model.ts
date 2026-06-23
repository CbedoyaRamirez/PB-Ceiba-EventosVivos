export type EstadoReserva = 'pendiente_pago' | 'confirmada' | 'cancelada';

export interface Reserva {
  id: string;
  eventoId: string;
  cantidad: number;
  nombreComprador: string;
  emailComprador: string;
  estado: EstadoReserva;
  codigoReserva: string | null;
  creadoEn: Date;
  actualizadoEn?: Date;
}

export interface CreateReservaDto {
  eventoId: string;
  cantidad: number;
  nombreComprador: string;
  emailComprador: string;
}

export interface ConfirmarPagoDto {
  reservaId: string;
  metodoPago: 'tarjeta' | 'transferencia' | 'efectivo';
  referenciaTransaccion?: string;
}

export interface CancelarReservaDto {
  razon: string;
}
