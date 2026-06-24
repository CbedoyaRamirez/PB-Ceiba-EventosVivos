using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Infrastructure.Data;
using EventosVivos.Tests.Fakes;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace EventosVivos.Tests.Integration;

public class ReservasApiTests : IAsyncLifetime
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter(
            System.Text.Json.JsonNamingPolicy.SnakeCaseLower, allowIntegerValues: true) }
    };

    public async Task InitializeAsync()
    {
        var dbName = $"TestDb_{Guid.NewGuid()}";

        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
                    if (descriptor != null) services.Remove(descriptor);

                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase(dbName));

                    var paymentDescriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(IPaymentGatewayService));
                    if (paymentDescriptor != null) services.Remove(paymentDescriptor);

                    services.AddScoped<IPaymentGatewayService, FakePaymentGatewayService>();
                });
            });

        _client = _factory.CreateClient();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Clear any existing venues to ensure we have a clean state
            db.Venues.RemoveRange(db.Venues);
            await db.SaveChangesAsync();

            // Add venues
            db.Venues.AddRange(
                new Venue { Id = 1, Nombre = "Auditorio Central", Capacidad = 200, Ciudad = "Bogotá" },
                new Venue { Id = 2, Nombre = "Sala Norte", Capacidad = 50, Ciudad = "Bogotá" },
                new Venue { Id = 3, Nombre = "Arena Sur", Capacidad = 500, Ciudad = "Medellín" });
            await db.SaveChangesAsync();
        }
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    [Fact]
    public async Task CrearReserva_ConDatosValidos_Retorna201()
    {
        // Arrange
        var evento = await CreaEventoValido();
        var dto = CreaCreateReservaDtoValido(evento.Id);

        // Act
        var response = await _client.PostAsJsonAsync("/api/reservas", dto);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var createdReserva = JsonSerializer.Deserialize<ReservaDto>(json, _jsonOptions);
        Assert.NotNull(createdReserva);
        Assert.Equal(dto.Cantidad, createdReserva.Cantidad);
    }

    [Fact]
    public async Task CrearReserva_EmailInvalido_Retorna400()
    {
        // Arrange
        var evento = await CreaEventoValido();
        var dto = CreaCreateReservaDtoValido(evento.Id);
        dto.EmailComprador = "emailinvalido";

        // Act
        var response = await _client.PostAsJsonAsync("/api/reservas", dto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CrearReserva_SinCapacidad_Retorna400()
    {
        // Arrange
        var evento = await CreaEventoConCapacidad(5);
        var dto1 = CreaCreateReservaDtoValido(evento.Id);
        dto1.Cantidad = 5;

        var dto2 = CreaCreateReservaDtoValido(evento.Id);
        dto2.Cantidad = 3;

        await _client.PostAsJsonAsync("/api/reservas", dto1);

        // Act
        var response = await _client.PostAsJsonAsync("/api/reservas", dto2);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ConfirmarPago_ReservaValida_Retorna200()
    {
        // Arrange
        var evento = await CreaEventoValido();
        var dto = CreaCreateReservaDtoValido(evento.Id);
        var createResponse = await _client.PostAsJsonAsync("/api/reservas", dto);
        var jsonCreate = await createResponse.Content.ReadAsStringAsync();
        var createdReserva = JsonSerializer.Deserialize<ReservaDto>(jsonCreate, _jsonOptions);

        // Act
        var response = await _client.PutAsync($"/api/reservas/{createdReserva.Id}/confirmar", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var confirmedReserva = JsonSerializer.Deserialize<ReservaDto>(json, _jsonOptions);
        Assert.Equal(EstadoReserva.Confirmada, confirmedReserva.Estado);
        Assert.NotNull(confirmedReserva.CodigoReserva);
        Assert.Equal("EV-FAKE00", confirmedReserva.CodigoReserva);
    }

    [Fact]
    public async Task ConfirmarPago_ReservaYaConfirmada_Retorna409()
    {
        // Arrange
        var evento = await CreaEventoValido();
        var dto = CreaCreateReservaDtoValido(evento.Id);
        var createResponse = await _client.PostAsJsonAsync("/api/reservas", dto);
        var jsonCreate = await createResponse.Content.ReadAsStringAsync();
        var createdReserva = JsonSerializer.Deserialize<ReservaDto>(jsonCreate, _jsonOptions);

        await _client.PutAsync($"/api/reservas/{createdReserva.Id}/confirmar", null);

        // Act
        var response = await _client.PutAsync($"/api/reservas/{createdReserva.Id}/confirmar", null);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Cancelar_ReservaConfirmada_Retorna200()
    {
        // Arrange
        var evento = await CreaEventoValido();
        var dto = CreaCreateReservaDtoValido(evento.Id);
        var createResponse = await _client.PostAsJsonAsync("/api/reservas", dto);
        var jsonCreate = await createResponse.Content.ReadAsStringAsync();
        var createdReserva = JsonSerializer.Deserialize<ReservaDto>(jsonCreate, _jsonOptions);

        await _client.PutAsync($"/api/reservas/{createdReserva.Id}/confirmar", null);

        // Act
        var response = await _client.PutAsync($"/api/reservas/{createdReserva.Id}/cancelar", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var cancelledReserva = JsonSerializer.Deserialize<ReservaDto>(json, _jsonOptions);
        Assert.Equal(EstadoReserva.Cancelada, cancelledReserva.Estado);
    }

    [Fact]
    public async Task ListarReservas_PorEvento_Retorna200()
    {
        // Arrange
        var evento = await CreaEventoValido();
        var dto1 = CreaCreateReservaDtoValido(evento.Id);
        var dto2 = CreaCreateReservaDtoValido(evento.Id);

        await _client.PostAsJsonAsync("/api/reservas", dto1);
        await _client.PostAsJsonAsync("/api/reservas", dto2);

        // Act
        var response = await _client.GetAsync($"/api/reservas?eventoId={evento.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var reservas = JsonSerializer.Deserialize<List<ReservaDto>>(json, _jsonOptions);
        Assert.NotNull(reservas);
        Assert.Equal(2, reservas.Count);
    }

    [Fact]
    public async Task ListarReservas_SinFiltros_Retorna200()
    {
        // Act
        var response = await _client.GetAsync("/api/reservas");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        var reservas = JsonSerializer.Deserialize<List<ReservaDto>>(json, _jsonOptions);
        Assert.NotNull(reservas);
    }

    private async Task<EventoDto> CreaEventoValido()
    {
        var ahora = DateTime.UtcNow;
        var dto = new CreateEventoDto
        {
            Titulo = "Evento de Prueba",
            Descripcion = "Una descripción válida para el evento",
            VenueId = 1,
            CapacidadMaxima = 100,
            FechaInicio = ahora.AddDays(1),
            FechaFin = ahora.AddDays(1).AddHours(2),
            Precio = 50m,
            Tipo = TipoEvento.Conferencia
        };

        var response = await _client.PostAsJsonAsync("/api/eventos", dto);
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<EventoDto>(json, _jsonOptions);
    }

    private async Task<EventoDto> CreaEventoConCapacidad(int capacidad)
    {
        var ahora = DateTime.UtcNow;
        var dto = new CreateEventoDto
        {
            Titulo = "Evento Pequeño",
            Descripcion = "Un evento con capacidad limitada",
            VenueId = 1,
            CapacidadMaxima = capacidad,
            FechaInicio = ahora.AddDays(1),
            FechaFin = ahora.AddDays(1).AddHours(2),
            Precio = 50m,
            Tipo = TipoEvento.Taller
        };

        var response = await _client.PostAsJsonAsync("/api/eventos", dto);
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<EventoDto>(json, _jsonOptions);
    }

    private static CreateReservaDto CreaCreateReservaDtoValido(Guid eventoId)
    {
        return new CreateReservaDto
        {
            EventoId = eventoId,
            Cantidad = 5,
            NombreComprador = "Juan Pérez",
            EmailComprador = "juan@example.com"
        };
    }
}
