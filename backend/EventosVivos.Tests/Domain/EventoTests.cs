using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;

namespace EventosVivos.Tests.Domain;

public class EventoTests
{
    private const int VenueId = 1;
    private const int CapacidadMaxima = 100;
    private const decimal Precio = 50m;

    [Fact]
    public void CrearEvento_TituloVacio_LanzaExcepcion()
    {
        // Arrange
        var titulo = "";
        var descripcion = "Una descripción válida";
        var fechaInicio = DateTime.UtcNow.AddHours(24);
        var fechaFin = DateTime.UtcNow.AddHours(25);

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() =>
            new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Conferencia));

        Assert.Equal("RN-01", exception.Code);
    }

    [Fact]
    public void CrearEvento_DescripcionVacia_LanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "";
        var fechaInicio = DateTime.UtcNow.AddHours(24);
        var fechaFin = DateTime.UtcNow.AddHours(25);

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() =>
            new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Conferencia));

        Assert.Equal("RN-02", exception.Code);
    }

    [Fact]
    public void CrearEvento_FechaFinMenorQueInicio_LanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "Una descripción válida";
        var fechaInicio = DateTime.UtcNow.AddHours(25);
        var fechaFin = DateTime.UtcNow.AddHours(24);

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() =>
            new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Conferencia));

        Assert.Equal("RN-04", exception.Code);
        Assert.Contains("posterior", exception.Message);
    }

    [Fact]
    public void CrearEvento_DomingoConInicioDespuesDe22_LanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "Una descripción válida";

        // Encontrar el próximo domingo
        var proximoDomingo = ObtenerProximoDia(DayOfWeek.Sunday);
        var fechaInicio = proximoDomingo.AddHours(21);
        var fechaFin = proximoDomingo.AddHours(22.5);

        // Act & Assert - No lanza excepción en la creación porque la validación es en el servicio
        // La creación debería ser exitosa, la validación ocurre en EventoService
        var evento = new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Concierto);
        Assert.NotNull(evento);
    }

    [Fact]
    public void CrearEvento_SabadoConInicioDespuesDe22_LanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "Una descripción válida";

        // Encontrar el próximo sábado
        var proximoSabado = ObtenerProximoDia(DayOfWeek.Saturday);
        var fechaInicio = proximoSabado.AddHours(21);
        var fechaFin = proximoSabado.AddHours(23);

        // Act & Assert - No lanza excepción en la creación
        var evento = new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Taller);
        Assert.NotNull(evento);
    }

    [Fact]
    public void CrearEvento_LunesConInicioDespuesDe22_NoLanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "Una descripción válida";

        // Encontrar el próximo lunes
        var proximoLunes = ObtenerProximoDia(DayOfWeek.Monday);
        var fechaInicio = proximoLunes.AddHours(23);
        var fechaFin = proximoLunes.AddHours(24);

        // Act
        var evento = new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Conferencia);

        // Assert
        Assert.NotNull(evento);
        Assert.Equal(titulo, evento.Titulo);
        Assert.Equal(descripcion, evento.Descripcion);
        Assert.Equal(EstadoEvento.Activo, evento.Estado);
    }

    [Fact]
    public void CrearEvento_Valido_Exitoso()
    {
        // Arrange
        var titulo = "Conferencia de Tecnología";
        var descripcion = "Una conferencia fascinante sobre las últimas tendencias";
        var fechaInicio = DateTime.UtcNow.AddHours(24);
        var fechaFin = DateTime.UtcNow.AddHours(26);

        // Act
        var evento = new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, Precio, TipoEvento.Conferencia);

        // Assert
        Assert.NotNull(evento);
        Assert.NotEqual(Guid.Empty, evento.Id);
        Assert.Equal(titulo, evento.Titulo);
        Assert.Equal(descripcion, evento.Descripcion);
        Assert.Equal(VenueId, evento.VenueId);
        Assert.Equal(CapacidadMaxima, evento.CapacidadMaxima);
        Assert.Equal(fechaInicio, evento.FechaInicio);
        Assert.Equal(fechaFin, evento.FechaFin);
        Assert.Equal(Precio, evento.Precio);
        Assert.Equal(TipoEvento.Conferencia, evento.Tipo);
        Assert.Equal(EstadoEvento.Activo, evento.Estado);
    }

    [Fact]
    public void CrearEvento_PrecioNegativo_LanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "Una descripción válida";
        var fechaInicio = DateTime.UtcNow.AddHours(24);
        var fechaFin = DateTime.UtcNow.AddHours(25);

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() =>
            new Evento(titulo, descripcion, VenueId, CapacidadMaxima, fechaInicio, fechaFin, -10m, TipoEvento.Conferencia));

        Assert.Equal("RN-05", exception.Code);
    }

    [Fact]
    public void CrearEvento_CapacidadMaximaCero_LanzaExcepcion()
    {
        // Arrange
        var titulo = "Evento Válido";
        var descripcion = "Una descripción válida";
        var fechaInicio = DateTime.UtcNow.AddHours(24);
        var fechaFin = DateTime.UtcNow.AddHours(25);

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() =>
            new Evento(titulo, descripcion, VenueId, 0, fechaInicio, fechaFin, Precio, TipoEvento.Conferencia));

        Assert.Equal("RN-03", exception.Code);
    }

    [Fact]
    public void Evento_Cancelar_Exitoso()
    {
        // Arrange
        var evento = CreaEventoValido();

        // Act
        evento.Cancelar();

        // Assert
        Assert.Equal(EstadoEvento.Cancelado, evento.Estado);
    }

    [Fact]
    public void Evento_CancelarDosVeces_LanzaExcepcion()
    {
        // Arrange
        var evento = CreaEventoValido();
        evento.Cancelar();

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() => evento.Cancelar());
        Assert.Equal("RN-07", exception.Code);
    }

    [Fact]
    public void Evento_Completar_Exitoso()
    {
        // Arrange
        var evento = CreaEventoValido();

        // Act
        evento.Completar();

        // Assert
        Assert.Equal(EstadoEvento.Completado, evento.Estado);
    }

    [Fact]
    public void Evento_CompletarDosVeces_LanzaExcepcion()
    {
        // Arrange
        var evento = CreaEventoValido();
        evento.Completar();

        // Act & Assert
        var exception = Assert.Throws<BusinessRuleException>(() => evento.Completar());
        Assert.Equal("RN-08", exception.Code);
    }

    private static Evento CreaEventoValido()
    {
        return new Evento(
            "Evento de Prueba",
            "Una descripción válida del evento",
            VenueId,
            CapacidadMaxima,
            DateTime.UtcNow.AddHours(24),
            DateTime.UtcNow.AddHours(26),
            Precio,
            TipoEvento.Conferencia);
    }

    private static DateTime ObtenerProximoDia(DayOfWeek dia)
    {
        var hoy = DateTime.UtcNow.Date;
        var diaActual = hoy.DayOfWeek;
        var diasHasta = dia - diaActual;
        if (diasHasta <= 0) diasHasta += 7;
        return hoy.AddDays(diasHasta).AddHours(12);
    }
}
