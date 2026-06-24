using System.Text;
using System.Text.Json;
using EventosVivos.Application.Interfaces;

namespace EventosVivos.Infrastructure.Services;

public class HttpPaymentGatewayService : IPaymentGatewayService
{
    private readonly HttpClient _httpClient;

    public HttpPaymentGatewayService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> ConfirmarPagoAsync(Guid reservaId, CancellationToken ct = default)
    {
        var requestBody = JsonSerializer.Serialize(new { reservaId });
        var content = new StringContent(requestBody, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("/payments/confirm", content, ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Payment gateway error: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync(ct);
        using var jsonDoc = JsonDocument.Parse(responseContent);
        var root = jsonDoc.RootElement;

        if (!root.TryGetProperty("codigoConfirmacion", out var codigoElement))
        {
            throw new InvalidOperationException(
                "Payment gateway response missing codigoConfirmacion field");
        }

        return codigoElement.GetString() ?? throw new InvalidOperationException(
            "codigoConfirmacion is null or not a string");
    }
}
