using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.DTOs;

public class ReporteOcupacionDto
{
    public Guid EventoId { get; set; }
    public int EntradasVendidas { get; set; }
    public int EntradasDisponibles { get; set; }
    public decimal PorcentajeOcupacion { get; set; }
    public decimal IngresosTotales { get; set; }
    public EstadoEvento EstadoEvento { get; set; }
}
