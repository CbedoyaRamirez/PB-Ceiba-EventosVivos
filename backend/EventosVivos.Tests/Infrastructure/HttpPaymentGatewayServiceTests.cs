using System.Net;
using System.Net.Http.Json;
using EventosVivos.Infrastructure.Services;

namespace EventosVivos.Tests.Infrastructure;

public class HttpPaymentGatewayServiceTests
{
    [Fact]
    public async Task ConfirmarPago_SuccessfulResponse_RetornsCodigoConfirmacion()
    {
        // Arrange
        var reservaId = Guid.NewGuid();
        var expectedCodigo = "EV-SUCCESS";

        using var handler = new MockHttpMessageHandler(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new { codigoConfirmacion = expectedCodigo })
            });

        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.pagos.ejemplo.com")
        };

        var service = new HttpPaymentGatewayService(httpClient);

        // Act
        var result = await service.ConfirmarPagoAsync(reservaId);

        // Assert
        Assert.Equal(expectedCodigo, result);
        Assert.Single(handler.Requests);
    }

    [Fact]
    public async Task ConfirmarPago_ServerError_LanzaExcepcion()
    {
        // Arrange
        var reservaId = Guid.NewGuid();

        using var handler = new MockHttpMessageHandler(
            new HttpResponseMessage(HttpStatusCode.InternalServerError));

        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.pagos.ejemplo.com")
        };

        var service = new HttpPaymentGatewayService(httpClient);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.ConfirmarPagoAsync(reservaId));

        Assert.Contains("InternalServerError", ex.Message);
    }

    [Fact]
    public async Task ConfirmarPago_MissingCodigoConfirmacion_LanzaExcepcion()
    {
        // Arrange
        var reservaId = Guid.NewGuid();

        using var handler = new MockHttpMessageHandler(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(new { otrosCampo = "valor" })
            });

        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.pagos.ejemplo.com")
        };

        var service = new HttpPaymentGatewayService(httpClient);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.ConfirmarPagoAsync(reservaId));

        Assert.Contains("codigoConfirmacion", ex.Message);
    }
}

public class MockHttpMessageHandler : HttpMessageHandler
{
    private readonly HttpResponseMessage _response;
    private readonly List<HttpRequestMessage> _requests = [];

    public IReadOnlyList<HttpRequestMessage> Requests => _requests.AsReadOnly();

    public MockHttpMessageHandler(HttpResponseMessage response)
    {
        _response = response;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        _requests.Add(request);

        if (_response.Content is not null)
        {
            await _response.Content.LoadIntoBufferAsync();
        }

        return _response;
    }
}
