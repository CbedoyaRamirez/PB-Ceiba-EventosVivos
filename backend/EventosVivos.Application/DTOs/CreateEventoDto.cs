using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.DTOs;

public class CreateEventoDto
{
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int VenueId { get; set; }
    public int CapacidadMaxima { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
    public decimal Precio { get; set; }
    public TipoEvento Tipo { get; set; }
}
