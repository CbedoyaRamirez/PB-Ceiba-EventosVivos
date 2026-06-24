using EventosVivos.Application.Interfaces;

namespace EventosVivos.Tests.Fakes;

public class FakePaymentGatewayService : IPaymentGatewayService
{
    public Task<string> ConfirmarPagoAsync(Guid reservaId, CancellationToken ct = default)
    {
        return Task.FromResult("EV-FAKE00");
    }
}
