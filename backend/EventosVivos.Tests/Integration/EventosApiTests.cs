using EventosVivos.Application.DTOs;
using EventosVivos.Domain.Enums;
using EventosVivos.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace EventosVivos.Tests.Integration;

public class EventosApiTests : IAsyncLifetime
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task InitializeAsync()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    [Fact]
    public async Task CrearEvento_ConDatosValidos_Retorna201()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();

        // Act
        var response = await _client.PostAsJsonAsync("/api/eventos", dto);
        var json = await response.Content.ReadAsStringAsync();

        // Assert
        if (response.StatusCode != HttpStatusCode.Created)
        {
            throw new Xunit.Sdk.XunitException($"Expected 201 Created but got {response.StatusCode}. Response: {json}");
        }

        var createdEvento = JsonSerializer.Deserialize<EventoDto>(json, _jsonOptions);
        Assert.NotNull(createdEvento);
        Assert.Equal(dto.Titulo, createdEvento.Titulo);
    }

    [Fact]
    public async Task CrearEvento_ConTituloInvalido_Retorna400()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        dto.Titulo = "";

        // Act
        var response = await _client.PostAsJsonAsync("/api/eventos", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearEvento_ConCapacidadMayorQueVenue_Retorna400()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        dto.VenueId = 1;
        dto.CapacidadMaxima = 5000;

        // Act
        var response = await _client.PostAsJsonAsync("/api/eventos", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ListarEventos_SinFiltros_Retorna200()
    {
        // Act
        var response = await _client.GetAsync("/api/eventos");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var eventos = JsonSerializer.Deserialize<List<EventoDto>>(json, _jsonOptions);
        Assert.NotNull(eventos);
    }

    [Fact]
    public async Task ListarEventos_ConFiltroTipo_RetornaEventosFiltrados()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        dto.Tipo = TipoEvento.Conferencia;

        await _client.PostAsJsonAsync("/api/eventos", dto);

        // Act
        var response = await _client.GetAsync($"/api/eventos?tipo={TipoEvento.Conferencia}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var eventos = JsonSerializer.Deserialize<List<EventoDto>>(json, _jsonOptions);
        Assert.NotNull(eventos);
    }

    [Fact]
    public async Task ObtenerEvento_EventoExistente_Retorna200()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        var createResponse = await _client.PostAsJsonAsync("/api/eventos", dto);
        var jsonCreate = await createResponse.Content.ReadAsStringAsync();
        var createdEvento = JsonSerializer.Deserialize<EventoDto>(jsonCreate, _jsonOptions);

        // Act
        var response = await _client.GetAsync($"/api/eventos/{createdEvento.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var evento = JsonSerializer.Deserialize<EventoDto>(json, _jsonOptions);
        Assert.NotNull(evento);
        Assert.Equal(createdEvento.Id, evento.Id);
    }

    [Fact]
    public async Task ObtenerEvento_EventoNoExiste_Retorna404()
    {
        // Arrange
        var fakeId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/eventos/{fakeId}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ObtenerReporte_EventoValido_Retorna200_ConDatos()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        var createResponse = await _client.PostAsJsonAsync("/api/eventos", dto);
        var jsonCreate = await createResponse.Content.ReadAsStringAsync();
        var createdEvento = JsonSerializer.Deserialize<EventoDto>(jsonCreate, _jsonOptions);

        // Act
        var response = await _client.GetAsync($"/api/eventos/{createdEvento.Id}/reporte");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var reporte = JsonSerializer.Deserialize<ReporteOcupacionDto>(json, _jsonOptions);
        Assert.NotNull(reporte);
        Assert.Equal(createdEvento.Id, reporte.EventoId);
        Assert.Equal(0, reporte.EntradasVendidas);
        Assert.Equal(dto.CapacidadMaxima, reporte.EntradasDisponibles);
    }

    private static CreateEventoDto CreaCreateEventoDtoValido()
    {
        var ahora = DateTime.UtcNow;
        return new CreateEventoDto
        {
            Titulo = "Conferencia de Tecnología",
            Descripcion = "Una conferencia fascinante sobre las últimas tendencias en tecnología",
            VenueId = 1,
            CapacidadMaxima = 100,
            FechaInicio = ahora.AddDays(1),
            FechaFin = ahora.AddDays(1).AddHours(2),
            Precio = 50m,
            Tipo = TipoEvento.Conferencia
        };
    }
}
