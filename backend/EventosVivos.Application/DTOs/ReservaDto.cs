using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.DTOs;

public class ReservaDto
{
    public Guid Id { get; set; }
    public Guid EventoId { get; set; }
    public int Cantidad { get; set; }
    public string NombreComprador { get; set; } = null!;
    public string EmailComprador { get; set; } = null!;
    public EstadoReserva Estado { get; set; }
    public string? CodigoReserva { get; set; }
    public DateTime? FechaCancelacion { get; set; }
    public bool EsPerdida { get; set; }
    public DateTime CreadoEn { get; set; }
}
