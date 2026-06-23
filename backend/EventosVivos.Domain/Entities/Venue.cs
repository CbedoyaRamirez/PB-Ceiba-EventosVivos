namespace EventosVivos.Domain.Entities;

public class Venue
{
    public int Id { get; init; }
    public string Nombre { get; init; } = null!;
    public int Capacidad { get; init; }
    public string Ciudad { get; init; } = null!;
}
