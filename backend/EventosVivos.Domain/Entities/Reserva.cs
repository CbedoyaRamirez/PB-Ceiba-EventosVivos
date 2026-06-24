using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;

namespace EventosVivos.Domain.Entities;

public class Reserva
{
    public Guid Id { get; private set; }
    public Guid EventoId { get; private set; }
    public int Cantidad { get; private set; }
    public string NombreComprador { get; private set; } = null!;
    public string EmailComprador { get; private set; } = null!;
    public EstadoReserva Estado { get; private set; }
    public string? CodigoReserva { get; private set; }
    public DateTime? FechaCancelacion { get; private set; }
    public bool EsPerdida { get; private set; }
    public DateTime CreadoEn { get; private set; }

    private Reserva() { }

    public Reserva(
        Guid eventoId,
        int cantidad,
        string nombreComprador,
        string emailComprador)
    {
        ValidarReservaBasica(cantidad, nombreComprador, emailComprador);

        Id = Guid.NewGuid();
        EventoId = eventoId;
        Cantidad = cantidad;
        NombreComprador = nombreComprador;
        EmailComprador = emailComprador;
        Estado = EstadoReserva.PendientePago;
        CodigoReserva = null;
        FechaCancelacion = null;
        EsPerdida = false;
        CreadoEn = DateTime.UtcNow;
    }

    private static void ValidarReservaBasica(
        int cantidad,
        string nombreComprador,
        string emailComprador)
    {
        if (cantidad <= 0)
            throw new BusinessRuleException("RN-01", "La cantidad de entradas debe ser mayor a 0.");

        if (string.IsNullOrWhiteSpace(nombreComprador))
            throw new BusinessRuleException("RN-02", "El nombre del comprador es requerido.");

        if (string.IsNullOrWhiteSpace(emailComprador))
            throw new BusinessRuleException("RN-03", "El email del comprador es requerido.");

        if (!emailComprador.Contains("@"))
            throw new BusinessRuleException("RN-04", "El email del comprador debe ser válido.");
    }

    public void ConfirmarPago(string codigoReserva)
    {
        if (Estado != EstadoReserva.PendientePago)
            throw new BusinessRuleException("RN-05", "Solo se pueden confirmar reservas pendientes de pago.");

        if (string.IsNullOrWhiteSpace(codigoReserva))
            throw new BusinessRuleException("RN-06", "El código de reserva es requerido.");

        Estado = EstadoReserva.Confirmada;
        CodigoReserva = codigoReserva;
    }

    public void Cancelar()
    {
        if (Estado == EstadoReserva.Cancelada)
            throw new BusinessRuleException("RF05-01", "La reserva ya está cancelada.");

        if (Estado == EstadoReserva.PendientePago)
            throw new BusinessRuleException("RF05-02", "No se puede cancelar una reserva pendiente de pago. Solo se permiten cancelaciones de reservas confirmadas.");

        Estado = EstadoReserva.Cancelada;
        FechaCancelacion = DateTime.UtcNow;
    }

    public void MarcarComoPerdida()
    {
        EsPerdida = true;
    }
}
