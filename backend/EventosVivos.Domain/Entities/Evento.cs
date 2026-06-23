using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;

namespace EventosVivos.Domain.Entities;

public class Evento
{
    public Guid Id { get; private set; }
    public string Titulo { get; private set; } = null!;
    public string Descripcion { get; private set; } = null!;
    public int VenueId { get; private set; }
    public int CapacidadMaxima { get; private set; }
    public DateTime FechaInicio { get; private set; }
    public DateTime FechaFin { get; private set; }
    public decimal Precio { get; private set; }
    public TipoEvento Tipo { get; private set; }
    public EstadoEvento Estado { get; private set; }
    public DateTime CreadoEn { get; private set; }

    private Evento() { }

    public Evento(
        string titulo,
        string descripcion,
        int venueId,
        int capacidadMaxima,
        DateTime fechaInicio,
        DateTime fechaFin,
        decimal precio,
        TipoEvento tipo)
    {
        ValidarEventoBasico(titulo, descripcion, capacidadMaxima, fechaInicio, fechaFin, precio);

        Id = Guid.NewGuid();
        Titulo = titulo;
        Descripcion = descripcion;
        VenueId = venueId;
        CapacidadMaxima = capacidadMaxima;
        FechaInicio = fechaInicio;
        FechaFin = fechaFin;
        Precio = precio;
        Tipo = tipo;
        Estado = EstadoEvento.Activo;
        CreadoEn = DateTime.UtcNow;
    }

    private static void ValidarEventoBasico(
        string titulo,
        string descripcion,
        int capacidadMaxima,
        DateTime fechaInicio,
        DateTime fechaFin,
        decimal precio)
    {
        if (string.IsNullOrWhiteSpace(titulo))
            throw new BusinessRuleException("RN-01", "El título del evento es requerido.");

        if (string.IsNullOrWhiteSpace(descripcion))
            throw new BusinessRuleException("RN-02", "La descripción del evento es requerida.");

        if (capacidadMaxima <= 0)
            throw new BusinessRuleException("RN-03", "La capacidad máxima debe ser mayor a 0.");

        if (fechaFin <= fechaInicio)
            throw new BusinessRuleException("RN-04", "La fecha de fin debe ser posterior a la fecha de inicio.");

        if (precio < 0)
            throw new BusinessRuleException("RN-05", "El precio no puede ser negativo.");

        if (fechaInicio <= DateTime.UtcNow)
            throw new BusinessRuleException("RN-06", "La fecha de inicio debe ser en el futuro.");
    }

    public void Cancelar()
    {
        if (Estado == EstadoEvento.Cancelado)
            throw new BusinessRuleException("RN-07", "El evento ya está cancelado.");

        Estado = EstadoEvento.Cancelado;
    }

    public void Completar()
    {
        if (Estado == EstadoEvento.Completado)
            throw new BusinessRuleException("RN-08", "El evento ya está completado.");

        Estado = EstadoEvento.Completado;
    }
}
