namespace EventosVivos.Application.DTOs;

public class CreateReservaDto
{
    public Guid EventoId { get; set; }
    public int Cantidad { get; set; }
    public string NombreComprador { get; set; } = null!;
    public string EmailComprador { get; set; } = null!;
}
