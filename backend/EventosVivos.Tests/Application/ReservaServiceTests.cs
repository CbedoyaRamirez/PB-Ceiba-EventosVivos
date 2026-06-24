using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Application.Services;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;
using Moq;

namespace EventosVivos.Tests.Application;

public class ReservaServiceTests
{
    private readonly Mock<IReservaRepository> _mockReservaRepository;
    private readonly Mock<IEventoRepository> _mockEventoRepository;
    private readonly ReservaService _reservaService;

    public ReservaServiceTests()
    {
        _mockReservaRepository = new Mock<IReservaRepository>();
        _mockEventoRepository = new Mock<IEventoRepository>();

        _reservaService = new ReservaService(
            _mockReservaRepository.Object,
            _mockEventoRepository.Object);
    }

    [Fact]
    public async Task Reservar_MenosDe1HoraParaEvento_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();

        var evento = new Evento(
            "Evento Próximo",
            "Descripción del evento",
            1,
            100,
            DateTime.UtcNow.AddMinutes(30),
            DateTime.UtcNow.AddHours(1),
            50m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.ReservarAsync(dto));

        Assert.False(_mockReservaRepository.Invocations.Any(i => i.Method.Name == "AddAsync"));
    }

    [Fact]
    public async Task Reservar_PrecioMayor100_MasDe10Entradas_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();
        dto.Cantidad = 11;

        var evento = new Evento(
            "Evento Válido",
            "Descripción del evento",
            1,
            100,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            150m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.ReservarAsync(dto));
    }

    [Fact]
    public async Task Reservar_PrecioMenorIgual100_MasDe10Entradas_SePermite()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();
        dto.Cantidad = 11;

        var evento = CreaEventoValido(); // precio = 50m

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<Reserva>());

        _mockReservaRepository.Setup(x => x.AddAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.ReservarAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        Assert.Equal(EstadoReserva.PendientePago, resultado.Estado);
        _mockReservaRepository.Verify(x => x.AddAsync(It.IsAny<Reserva>()), Times.Once);
    }

    [Fact]
    public async Task Reservar_SinCapacidadDisponible_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();
        dto.Cantidad = 30;

        var evento = new Evento(
            "Evento Lleno",
            "Descripción del evento",
            1,
            100,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            50m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        var reservaExistente = new Reserva(dto.EventoId, 80, "Otro Comprador", "otro@example.com");
        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<Reserva> { reservaExistente });

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.ReservarAsync(dto));
    }

    [Fact]
    public async Task Reservar_Valido_CreaPendientePago()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();

        var evento = CreaEventoValido();
        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<Reserva>());

        _mockReservaRepository.Setup(x => x.AddAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.ReservarAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        Assert.NotEqual(Guid.Empty, resultado.Id);
        Assert.Equal(EstadoReserva.PendientePago, resultado.Estado);
        Assert.Null(resultado.CodigoReserva);
        _mockReservaRepository.Verify(x => x.AddAsync(It.IsAny<Reserva>()), Times.Once);
    }

    [Fact]
    public async Task ConfirmarPago_GeneraCodigoReserva_FormatoCorrect()
    {
        // Arrange
        var reserva = new Reserva(
            Guid.NewGuid(),
            5,
            "Juan Pérez",
            "juan@example.com");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockReservaRepository.Setup(x => x.UpdateAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.ConfirmarPagoAsync(reserva.Id);

        // Assert
        Assert.NotNull(resultado);
        Assert.NotNull(resultado.CodigoReserva);
        Assert.StartsWith("EV-", resultado.CodigoReserva);
        Assert.Equal(6, resultado.CodigoReserva.Length - 3);
        Assert.Equal(EstadoReserva.Confirmada, resultado.Estado);
    }

    [Fact]
    public async Task ConfirmarPago_ReservaYaConfirmada_LanzaExcepcion()
    {
        // Arrange
        var reserva = new Reserva(
            Guid.NewGuid(),
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.ConfirmarPagoAsync(reserva.Id));
    }

    [Fact]
    public async Task Cancelar_MenosDe48Horas_MarcaComoPerdida()
    {
        // Arrange
        var eventoProximo = new Evento(
            "Evento Próximo",
            "Descripción del evento",
            1,
            100,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(25),
            50m,
            TipoEvento.Conferencia);

        var reserva = new Reserva(
            eventoProximo.Id,
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(eventoProximo.Id))
            .ReturnsAsync(eventoProximo);

        _mockReservaRepository.Setup(x => x.UpdateAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.CancelarAsync(reserva.Id);

        // Assert
        Assert.Equal(EstadoReserva.Cancelada, resultado.Estado);
        Assert.NotNull(resultado.FechaCancelacion);
        Assert.True(resultado.EsPerdida);
    }

    [Fact]
    public async Task Cancelar_MasDe48Horas_LiberaCapacidad()
    {
        // Arrange
        var eventoLejano = new Evento(
            "Evento Lejano",
            "Descripción del evento",
            1,
            100,
            DateTime.UtcNow.AddDays(7),
            DateTime.UtcNow.AddDays(7).AddHours(2),
            50m,
            TipoEvento.Conferencia);

        var reserva = new Reserva(
            eventoLejano.Id,
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(eventoLejano.Id))
            .ReturnsAsync(eventoLejano);

        _mockReservaRepository.Setup(x => x.UpdateAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.CancelarAsync(reserva.Id);

        // Assert
        Assert.Equal(EstadoReserva.Cancelada, resultado.Estado);
        Assert.False(resultado.FechaCancelacion == null);
    }

    [Fact]
    public async Task Cancelar_ReservaYaCancelada_LanzaExcepcion()
    {
        // Arrange
        var evento = CreaEventoValido();
        var reserva = new Reserva(
            evento.Id,
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");
        reserva.Cancelar();

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(evento.Id))
            .ReturnsAsync(evento);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.CancelarAsync(reserva.Id));
    }

    [Fact]
    public async Task Cancelar_ReservaPendientePago_LanzaExcepcion()
    {
        // Arrange
        var evento = CreaEventoValido();
        var reserva = new Reserva(
            evento.Id,
            5,
            "Juan Pérez",
            "juan@example.com");
        // Estado permanece PendientePago — NO se llama ConfirmarPago ni Cancelar

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(evento.Id))
            .ReturnsAsync(evento);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.CancelarAsync(reserva.Id));
    }

    [Fact]
    public async Task ListarReservasPorEvento_RetornaSoloDelEvento()
    {
        // Arrange
        var eventoId = Guid.NewGuid();
        var reserva1 = new Reserva(eventoId, 5, "Juan", "juan@example.com");
        var reserva2 = new Reserva(eventoId, 3, "María", "maria@example.com");

        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(eventoId))
            .ReturnsAsync(new List<Reserva> { reserva1, reserva2 });

        // Act
        var resultado = await _reservaService.ListarReservasPorEventoAsync(eventoId);

        // Assert
        Assert.Equal(2, resultado.Count);
        Assert.True(resultado.All(r => r.EventoId == eventoId));
    }

    [Fact]
    public async Task Reservar_ExactamenteUnaHoraParaEvento_SePermite()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();

        var evento = new Evento(
            "Evento Válido",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddMinutes(60).AddSeconds(5),
            DateTime.UtcNow.AddMinutes(120).AddSeconds(5),
            50m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<Reserva>());

        _mockReservaRepository.Setup(x => x.AddAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.ReservarAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        Assert.Equal(EstadoReserva.PendientePago, resultado.Estado);
        _mockReservaRepository.Verify(x => x.AddAsync(It.IsAny<Reserva>()), Times.Once);
    }

    [Fact]
    public async Task Reservar_59MinutosParaEvento_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();

        var evento = new Evento(
            "Evento Próximo",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddMinutes(59),
            DateTime.UtcNow.AddMinutes(120),
            50m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _reservaService.ReservarAsync(dto));
    }

    [Fact]
    public async Task Reservar_PrecioMayor100_Exactamente10Entradas_SePermite()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();
        dto.Cantidad = 10;

        var evento = new Evento(
            "Evento Válido",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            150m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<Reserva>());

        _mockReservaRepository.Setup(x => x.AddAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.ReservarAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        _mockReservaRepository.Verify(x => x.AddAsync(It.IsAny<Reserva>()), Times.Once);
    }

    [Fact]
    public async Task Reservar_PrecioExactamente100_MasDe10Entradas_SePermite()
    {
        // Arrange
        var dto = CreaCreateReservaDtoValido();
        dto.Cantidad = 11;

        var evento = new Evento(
            "Evento Válido",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            100m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(dto.EventoId))
            .ReturnsAsync(evento);

        _mockReservaRepository.Setup(x => x.GetByEventoIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(new List<Reserva>());

        _mockReservaRepository.Setup(x => x.AddAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.ReservarAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        _mockReservaRepository.Verify(x => x.AddAsync(It.IsAny<Reserva>()), Times.Once);
    }

    [Fact]
    public async Task Cancelar_Exactamente48Horas_NoMarcaComoPerdida()
    {
        // Arrange
        var eventoProximo = new Evento(
            "Evento en 48h",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddHours(48).AddSeconds(5),
            DateTime.UtcNow.AddHours(49).AddSeconds(5),
            50m,
            TipoEvento.Conferencia);

        var reserva = new Reserva(
            eventoProximo.Id,
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(eventoProximo.Id))
            .ReturnsAsync(eventoProximo);

        _mockReservaRepository.Setup(x => x.UpdateAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.CancelarAsync(reserva.Id);

        // Assert
        Assert.Equal(EstadoReserva.Cancelada, resultado.Estado);
        Assert.False(resultado.EsPerdida);
    }

    [Fact]
    public async Task Cancelar_47Horas_MarcaComoPerdida()
    {
        // Arrange
        var eventoProximo = new Evento(
            "Evento en 47h",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddHours(47),
            DateTime.UtcNow.AddHours(48),
            50m,
            TipoEvento.Conferencia);

        var reserva = new Reserva(
            eventoProximo.Id,
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(eventoProximo.Id))
            .ReturnsAsync(eventoProximo);

        _mockReservaRepository.Setup(x => x.UpdateAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.CancelarAsync(reserva.Id);

        // Assert
        Assert.Equal(EstadoReserva.Cancelada, resultado.Estado);
        Assert.True(resultado.EsPerdida);
    }

    [Fact]
    public async Task Cancelar_MasDe48Horas_EsPerdidaFalse()
    {
        // Arrange
        var eventoLejano = new Evento(
            "Evento Lejano",
            "Descripción",
            1,
            100,
            DateTime.UtcNow.AddDays(7),
            DateTime.UtcNow.AddDays(7).AddHours(2),
            50m,
            TipoEvento.Conferencia);

        var reserva = new Reserva(
            eventoLejano.Id,
            5,
            "Juan Pérez",
            "juan@example.com");

        reserva.ConfirmarPago("EV-123456");

        _mockReservaRepository.Setup(x => x.GetByIdAsync(reserva.Id))
            .ReturnsAsync(reserva);

        _mockEventoRepository.Setup(x => x.GetByIdAsync(eventoLejano.Id))
            .ReturnsAsync(eventoLejano);

        _mockReservaRepository.Setup(x => x.UpdateAsync(It.IsAny<Reserva>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _reservaService.CancelarAsync(reserva.Id);

        // Assert
        Assert.Equal(EstadoReserva.Cancelada, resultado.Estado);
        Assert.False(resultado.EsPerdida);
    }

    private static CreateReservaDto CreaCreateReservaDtoValido()
    {
        return new CreateReservaDto
        {
            EventoId = Guid.NewGuid(),
            Cantidad = 5,
            NombreComprador = "Juan Pérez",
            EmailComprador = "juan@example.com"
        };
    }

    private static Evento CreaEventoValido()
    {
        return new Evento(
            "Evento de Prueba",
            "Una descripción válida del evento",
            1,
            100,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            50m,
            TipoEvento.Conferencia);
    }
}
