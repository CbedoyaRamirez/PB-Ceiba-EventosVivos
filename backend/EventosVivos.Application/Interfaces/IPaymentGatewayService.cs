namespace EventosVivos.Application.Interfaces;

public interface IPaymentGatewayService
{
    Task<string> ConfirmarPagoAsync(Guid reservaId, CancellationToken ct = default);
}
