using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;
using FluentValidation;

namespace EventosVivos.Application.Services;

public class EventoService
{
    private readonly IEventoRepository _eventoRepository;
    private readonly IVenueRepository _venueRepository;
    private readonly IReservaRepository _reservaRepository;
    private readonly IValidator<CreateEventoDto> _validator;

    public EventoService(
        IEventoRepository eventoRepository,
        IVenueRepository venueRepository,
        IReservaRepository reservaRepository,
        IValidator<CreateEventoDto> validator)
    {
        _eventoRepository = eventoRepository;
        _venueRepository = venueRepository;
        _reservaRepository = reservaRepository;
        _validator = validator;
    }

    public async Task<EventoDto> CrearEventoAsync(CreateEventoDto dto)
    {
        // Validar DTO
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // RN-01: Validar que la capacidad del evento no exceda la del venue
        var venue = await _venueRepository.GetByIdAsync(dto.VenueId);
        if (venue == null)
        {
            throw new BusinessRuleException("RN-01", "El venue especificado no existe.");
        }

        if (dto.CapacidadMaxima > venue.Capacidad)
        {
            throw new BusinessRuleException("RN-01", "La capacidad del evento no puede exceder la capacidad del venue.");
        }

        // RN-02: Validar que no haya overlap con eventos activos en el mismo venue
        var eventosEnRango = await _eventoRepository.GetByVenueAndDateRangeAsync(
            dto.VenueId,
            dto.FechaInicio,
            dto.FechaFin);

        if (eventosEnRango.Any(e => e.Estado == EstadoEvento.Activo))
        {
            throw new BusinessRuleException("RN-02", "Ya existe un evento activo en este venue durante el rango de fechas especificado.");
        }

        // RN-03: Validar que eventos de fin de semana no terminen después de las 22:00
        if ((dto.FechaInicio.DayOfWeek == DayOfWeek.Saturday || dto.FechaInicio.DayOfWeek == DayOfWeek.Sunday) &&
            dto.FechaFin.Hour >= 22)
        {
            throw new BusinessRuleException("RN-03", "Los eventos de fin de semana no pueden terminar después de las 22:00.");
        }

        // Crear el evento
        var evento = new Evento(
            dto.Titulo,
            dto.Descripcion,
            dto.VenueId,
            dto.CapacidadMaxima,
            dto.FechaInicio,
            dto.FechaFin,
            dto.Precio,
            dto.Tipo);

        await _eventoRepository.AddAsync(evento);

        return MapToDto(evento);
    }

    public async Task<List<EventoDto>> ListarEventosAsync(
        TipoEvento? tipo = null,
        DateTime? fechaInicio = null,
        int? venueId = null,
        EstadoEvento? estado = null,
        string? titulo = null)
    {
        var eventos = await _eventoRepository.GetAllAsync();

        // Aplicar filtros
        if (tipo.HasValue)
        {
            eventos = eventos.Where(e => e.Tipo == tipo.Value).ToList();
        }

        if (fechaInicio.HasValue)
        {
            eventos = eventos.Where(e => e.FechaInicio >= fechaInicio.Value).ToList();
        }

        if (venueId.HasValue)
        {
            eventos = eventos.Where(e => e.VenueId == venueId.Value).ToList();
        }

        if (estado.HasValue)
        {
            eventos = eventos.Where(e => e.Estado == estado.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(titulo))
        {
            eventos = eventos.Where(e => e.Titulo.Contains(titulo, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return eventos.Select(MapToDto).ToList();
    }

    public async Task<EventoDto> GetEventoAsync(Guid id)
    {
        var evento = await _eventoRepository.GetByIdAsync(id);
        if (evento == null)
        {
            throw new BusinessRuleException("NOT_FOUND", "El evento especificado no existe.");
        }

        // RN-06: Marcar como completado si la fecha de fin ha pasado
        if (evento.Estado == EstadoEvento.Activo && evento.FechaFin <= DateTime.UtcNow)
        {
            evento.Completar();
            await _eventoRepository.UpdateAsync(evento);
        }

        return MapToDto(evento);
    }

    public async Task<ReporteOcupacionDto> GetReporteAsync(Guid eventoId)
    {
        var evento = await _eventoRepository.GetByIdAsync(eventoId);
        if (evento == null)
        {
            throw new BusinessRuleException("NOT_FOUND", "El evento especificado no existe.");
        }

        var reservas = await _reservaRepository.GetByEventoIdAsync(eventoId);

        // Calcular entradas vendidas (confirmadas y perdidas no cuentan como vendidas)
        var entradasVendidas = reservas
            .Where(r => r.Estado == EstadoReserva.Confirmada)
            .Sum(r => r.Cantidad);

        var entradasDisponibles = evento.CapacidadMaxima - entradasVendidas;
        var porcentajeOcupacion = evento.CapacidadMaxima > 0
            ? (decimal)entradasVendidas / evento.CapacidadMaxima * 100
            : 0;

        var ingresosTotales = reservas
            .Where(r => r.Estado == EstadoReserva.Confirmada)
            .Sum(r => r.Cantidad * evento.Precio);

        return new ReporteOcupacionDto
        {
            EventoId = eventoId,
            EntradasVendidas = entradasVendidas,
            EntradasDisponibles = Math.Max(0, entradasDisponibles),
            PorcentajeOcupacion = Math.Round(porcentajeOcupacion, 2),
            IngresosTotales = ingresosTotales,
            EstadoEvento = evento.Estado
        };
    }

    private static EventoDto MapToDto(Evento evento)
    {
        return new EventoDto
        {
            Id = evento.Id,
            Titulo = evento.Titulo,
            Descripcion = evento.Descripcion,
            VenueId = evento.VenueId,
            CapacidadMaxima = evento.CapacidadMaxima,
            FechaInicio = evento.FechaInicio,
            FechaFin = evento.FechaFin,
            Precio = evento.Precio,
            Tipo = evento.Tipo,
            Estado = evento.Estado,
            CreadoEn = evento.CreadoEn
        };
    }
}
