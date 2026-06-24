using System.Reflection;
using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Application.Services;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;
using Moq;

namespace EventosVivos.Tests.Application;

public class EventoServiceTests
{
    private readonly Mock<IEventoRepository> _mockEventoRepository;
    private readonly Mock<IVenueRepository> _mockVenueRepository;
    private readonly Mock<IReservaRepository> _mockReservaRepository;
    private readonly EventoService _eventoService;

    public EventoServiceTests()
    {
        _mockEventoRepository = new Mock<IEventoRepository>();
        _mockVenueRepository = new Mock<IVenueRepository>();
        _mockReservaRepository = new Mock<IReservaRepository>();

        _eventoService = new EventoService(
            _mockEventoRepository.Object,
            _mockVenueRepository.Object,
            _mockReservaRepository.Object);
    }

    [Fact]
    public async Task CrearEvento_CapacidadMayorQueVenue_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        dto.CapacidadMaxima = 150;

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _eventoService.CrearEventoAsync(dto));

        Assert.False(_mockEventoRepository.Invocations.Any(i => i.Method.Name == "AddAsync"));
    }

    [Fact]
    public async Task CrearEvento_ConOverlapDeHorarios_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        var eventoExistente = new Evento(
            "Evento Existente",
            "Descripción del evento existente",
            dto.VenueId,
            50,
            dto.FechaInicio.AddHours(-1),
            dto.FechaFin.AddHours(-1),
            30m,
            TipoEvento.Conferencia);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento> { eventoExistente });

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _eventoService.CrearEventoAsync(dto));
    }

    [Fact]
    public async Task CrearEvento_Valido_SeGuardaCorrectamente()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        _mockEventoRepository.Setup(x => x.AddAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.CrearEventoAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        Assert.NotEqual(Guid.Empty, resultado.Id);
        Assert.Equal(dto.Titulo, resultado.Titulo);
        Assert.Equal(EstadoEvento.Activo, resultado.Estado);
        _mockEventoRepository.Verify(x => x.AddAsync(It.IsAny<Evento>()), Times.Once);
    }

    [Fact]
    public async Task ListarEventos_ConFiltros_RetornaEventosFiltrados()
    {
        // Arrange
        var evento1 = CreaEventoConTipo(TipoEvento.Conferencia);
        var evento2 = CreaEventoConTipo(TipoEvento.Taller);

        _mockEventoRepository.Setup(x => x.GetFilteredAsync(
                It.IsAny<TipoEvento?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<int?>(),
                It.IsAny<EstadoEvento?>(),
                It.IsAny<string?>()))
            .ReturnsAsync(new List<Evento> { evento1 });

        // Act
        var resultado = await _eventoService.ListarEventosAsync(tipo: TipoEvento.Conferencia);

        // Assert
        Assert.Single(resultado);
        Assert.Equal(TipoEvento.Conferencia, resultado.First().Tipo);
    }

    [Fact]
    public async Task GetEvento_EventoActivo_RetornaCorrectamente()
    {
        // Arrange
        var evento = CreaEventoConTipo(TipoEvento.Conferencia);
        var eventoId = evento.Id;

        _mockEventoRepository.Setup(x => x.GetByIdAsync(eventoId))
            .ReturnsAsync(evento);

        // Act
        var resultado = await _eventoService.GetEventoAsync(eventoId);

        // Assert
        Assert.NotNull(resultado);
        Assert.Equal(EstadoEvento.Activo, resultado.Estado);
        Assert.Equal(eventoId, resultado.Id);
    }

    [Fact]
    public async Task GetEvento_EventoNoExistente_LanzaExcepcion()
    {
        // Arrange
        _mockEventoRepository.Setup(x => x.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Evento?)null);

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _eventoService.GetEventoAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task CrearEvento_FinDeSemanaInicioMasDe22h_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        // Forzar un sábado a las 23:00
        var sabado = DateTime.UtcNow.AddDays(1);
        while (sabado.DayOfWeek != DayOfWeek.Saturday) sabado = sabado.AddDays(1);
        dto.FechaInicio = new DateTime(sabado.Year, sabado.Month, sabado.Day, 23, 0, 0, DateTimeKind.Utc);
        dto.FechaFin = dto.FechaInicio.AddHours(1);

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _eventoService.CrearEventoAsync(dto));
    }

    [Fact]
    public async Task ListarEventos_SinFiltros_RetornaTodos()
    {
        // Arrange
        var eventos = new List<Evento>
        {
            CreaEventoConTipo(TipoEvento.Conferencia),
            CreaEventoConTipo(TipoEvento.Taller),
            CreaEventoConTipo(TipoEvento.Concierto)
        };

        _mockEventoRepository.Setup(x => x.GetFilteredAsync(
                It.IsAny<TipoEvento?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<int?>(),
                It.IsAny<EstadoEvento?>(),
                It.IsAny<string?>()))
            .ReturnsAsync(eventos);

        // Act
        var resultado = await _eventoService.ListarEventosAsync();

        // Assert
        Assert.Equal(3, resultado.Count);
    }

    [Fact]
    public async Task CrearEvento_VenueNoExistente_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync((Venue?)null);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _eventoService.CrearEventoAsync(dto));
        Assert.Equal("RN-01", ex.Code);
    }

    [Fact]
    public async Task CrearEvento_CapacidadIgualQueVenue_SePermite()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        dto.CapacidadMaxima = 100;

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        _mockEventoRepository.Setup(x => x.AddAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.CrearEventoAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        Assert.Equal(100, resultado.CapacidadMaxima);
        _mockEventoRepository.Verify(x => x.AddAsync(It.IsAny<Evento>()), Times.Once);
    }

    [Fact]
    public async Task CrearEvento_OverlapSoloConEventosCancelados_SePermite()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        var eventoCancelado = new Evento(
            "Evento Cancelado",
            "Descripción",
            dto.VenueId,
            50,
            dto.FechaInicio.AddHours(-1),
            dto.FechaFin.AddHours(-1),
            30m,
            TipoEvento.Conferencia);
        eventoCancelado.Cancelar();

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento> { eventoCancelado });

        _mockEventoRepository.Setup(x => x.AddAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.CrearEventoAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        _mockEventoRepository.Verify(x => x.AddAsync(It.IsAny<Evento>()), Times.Once);
    }

    [Fact]
    public async Task CrearEvento_SinOverlapEnMismoVenue_SePermite()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        _mockEventoRepository.Setup(x => x.AddAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.CrearEventoAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        _mockEventoRepository.Verify(x => x.AddAsync(It.IsAny<Evento>()), Times.Once);
    }

    [Fact]
    public async Task CrearEvento_DomingoA22h00_LanzaExcepcion()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        var domingo = ObtenerProximoDia(DayOfWeek.Sunday);
        dto.FechaInicio = new DateTime(domingo.Year, domingo.Month, domingo.Day, 22, 0, 0, DateTimeKind.Utc);
        dto.FechaFin = dto.FechaInicio.AddHours(1);

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        // Act & Assert
        await Assert.ThrowsAsync<BusinessRuleException>(async () =>
            await _eventoService.CrearEventoAsync(dto));
    }

    [Fact]
    public async Task CrearEvento_SabadoA21h59_SePermite()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        var sabado = ObtenerProximoDia(DayOfWeek.Saturday);
        dto.FechaInicio = new DateTime(sabado.Year, sabado.Month, sabado.Day, 21, 59, 0, DateTimeKind.Utc);
        dto.FechaFin = dto.FechaInicio.AddHours(1);

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        _mockEventoRepository.Setup(x => x.AddAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.CrearEventoAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        _mockEventoRepository.Verify(x => x.AddAsync(It.IsAny<Evento>()), Times.Once);
    }

    [Fact]
    public async Task CrearEvento_LunesA23h_SePermite()
    {
        // Arrange
        var dto = CreaCreateEventoDtoValido();
        var lunes = ObtenerProximoDia(DayOfWeek.Monday);
        dto.FechaInicio = new DateTime(lunes.Year, lunes.Month, lunes.Day, 23, 0, 0, DateTimeKind.Utc);
        dto.FechaFin = dto.FechaInicio.AddHours(1);

        var venue = CreaVenueConCapacidad(100);
        _mockVenueRepository.Setup(x => x.GetByIdAsync(dto.VenueId))
            .ReturnsAsync(venue);

        _mockEventoRepository.Setup(x => x.GetByVenueAndDateRangeAsync(
            It.IsAny<int>(),
            It.IsAny<DateTime>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Evento>());

        _mockEventoRepository.Setup(x => x.AddAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.CrearEventoAsync(dto);

        // Assert
        Assert.NotNull(resultado);
        _mockEventoRepository.Verify(x => x.AddAsync(It.IsAny<Evento>()), Times.Once);
    }

    [Fact]
    public async Task GetEvento_FechaFinPasada_RetornaEstadoCompletado()
    {
        // Arrange
        var evento = CreaEventoConFechasPasadas();

        _mockEventoRepository.Setup(x => x.GetByIdAsync(evento.Id))
            .ReturnsAsync(evento);

        _mockEventoRepository.Setup(x => x.UpdateAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        var resultado = await _eventoService.GetEventoAsync(evento.Id);

        // Assert
        Assert.Equal(EstadoEvento.Completado, resultado.Estado);
    }

    [Fact]
    public async Task GetEvento_FechaFinPasada_LlamaUpdateAsync()
    {
        // Arrange
        var evento = CreaEventoConFechasPasadas();

        _mockEventoRepository.Setup(x => x.GetByIdAsync(evento.Id))
            .ReturnsAsync(evento);

        _mockEventoRepository.Setup(x => x.UpdateAsync(It.IsAny<Evento>()))
            .Returns(Task.CompletedTask);

        // Act
        await _eventoService.GetEventoAsync(evento.Id);

        // Assert
        _mockEventoRepository.Verify(x => x.UpdateAsync(It.IsAny<Evento>()), Times.Once);
    }

    private static CreateEventoDto CreaCreateEventoDtoValido()
    {
        return new CreateEventoDto
        {
            Titulo = "Evento de Prueba",
            Descripcion = "Una descripción válida para el evento",
            VenueId = 1,
            CapacidadMaxima = 100,
            FechaInicio = DateTime.UtcNow.AddHours(24),
            FechaFin = DateTime.UtcNow.AddHours(26),
            Precio = 50m,
            Tipo = TipoEvento.Conferencia
        };
    }

    private static Venue CreaVenueConCapacidad(int capacidad)
    {
        return new Venue
        {
            Id = 1,
            Nombre = "Venue de Prueba",
            Capacidad = capacidad,
            Ciudad = "Bogotá"
        };
    }

    private static Evento CreaEventoConTipo(TipoEvento tipo)
    {
        return new Evento(
            $"Evento {tipo}",
            $"Descripción del evento de tipo {tipo}",
            1,
            50,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            30m,
            tipo);
    }

    private static DateTime ObtenerProximoDia(DayOfWeek dayOfWeek)
    {
        var fecha = DateTime.UtcNow.Date.AddDays(1);
        while (fecha.DayOfWeek != dayOfWeek)
        {
            fecha = fecha.AddDays(1);
        }
        return fecha;
    }

    private static Evento CreaEventoConFechasPasadas()
    {
        var evento = (Evento)Activator.CreateInstance(typeof(Evento), nonPublic: true)!;
        static void Set(object obj, string name, object val) =>
            typeof(Evento).GetProperty(name, BindingFlags.Public | BindingFlags.Instance)!
                .GetSetMethod(nonPublic: true)!.Invoke(obj, new[] { val });
        Set(evento, "Id", Guid.NewGuid());
        Set(evento, "Titulo", "Evento Pasado");
        Set(evento, "Descripcion", "Descripción");
        Set(evento, "VenueId", 1);
        Set(evento, "CapacidadMaxima", 100);
        Set(evento, "FechaInicio", DateTime.UtcNow.AddHours(-2));
        Set(evento, "FechaFin", DateTime.UtcNow.AddHours(-1));
        Set(evento, "Precio", 50m);
        Set(evento, "Tipo", TipoEvento.Conferencia);
        Set(evento, "Estado", EstadoEvento.Activo);
        Set(evento, "CreadoEn", DateTime.UtcNow.AddDays(-7));
        return evento;
    }
}
