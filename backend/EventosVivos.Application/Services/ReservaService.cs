using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Domain.Exceptions;
using FluentValidation;

namespace EventosVivos.Application.Services;

public class ReservaService
{
    private readonly IReservaRepository _reservaRepository;
    private readonly IEventoRepository _eventoRepository;
    private readonly IValidator<CreateReservaDto> _validator;
    private const int MaxEntradasPorTransaccion = 10;

    public ReservaService(
        IReservaRepository reservaRepository,
        IEventoRepository eventoRepository,
        IValidator<CreateReservaDto> validator)
    {
        _reservaRepository = reservaRepository;
        _eventoRepository = eventoRepository;
        _validator = validator;
    }

    public async Task<ReservaDto> ReservarAsync(CreateReservaDto dto)
    {
        // Validar DTO
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Obtener evento
        var evento = await _eventoRepository.GetByIdAsync(dto.EventoId);
        if (evento == null)
        {
            throw new BusinessRuleException("NOT_FOUND", "El evento especificado no existe.");
        }

        // RN-04: No se puede reservar si faltan menos de 1 hora para el evento
        var tiempoRestante = evento.FechaInicio - DateTime.UtcNow;
        if (tiempoRestante.TotalHours < 1)
        {
            throw new BusinessRuleException("RN-04", "No se pueden hacer reservas cuando faltan menos de 1 hora para el evento.");
        }

        // RN-05: Validar límite de entradas por transacción (solo para eventos precio > $100)
        if (evento.Precio > 100 && dto.Cantidad > MaxEntradasPorTransaccion)
        {
            throw new BusinessRuleException("RN-05", $"El máximo de entradas por transacción es {MaxEntradasPorTransaccion} para eventos con precio mayor a $100.");
        }

        // Calcular disponibilidad
        var todasLasReservas = await _reservaRepository.GetByEventoIdAsync(dto.EventoId);
        var entradasReservadas = todasLasReservas
            .Where(r => r.Estado != EstadoReserva.Cancelada || r.EsPerdida)
            .Sum(r => r.Cantidad);

        var entradasDisponibles = evento.CapacidadMaxima - entradasReservadas;

        if (dto.Cantidad > entradasDisponibles)
        {
            throw new BusinessRuleException("RN-05", $"No hay suficientes entradas disponibles. Disponibles: {entradasDisponibles}");
        }

        // Crear reserva en estado PendientePago
        var reserva = new Reserva(
            dto.EventoId,
            dto.Cantidad,
            dto.NombreComprador,
            dto.EmailComprador);

        await _reservaRepository.AddAsync(reserva);

        return MapToDto(reserva);
    }

    public async Task<ReservaDto> ConfirmarPagoAsync(Guid reservaId)
    {
        var reserva = await _reservaRepository.GetByIdAsync(reservaId);
        if (reserva == null)
        {
            throw new BusinessRuleException("NOT_FOUND", "La reserva especificada no existe.");
        }

        // Generar código de reserva en formato EV-{6 dígitos}
        var codigoReserva = $"EV-{Random.Shared.Next(100000, 999999)}";

        reserva.ConfirmarPago(codigoReserva);
        await _reservaRepository.UpdateAsync(reserva);

        return MapToDto(reserva);
    }

    public async Task<ReservaDto> CancelarAsync(Guid reservaId)
    {
        var reserva = await _reservaRepository.GetByIdAsync(reservaId);
        if (reserva == null)
        {
            throw new BusinessRuleException("NOT_FOUND", "La reserva especificada no existe.");
        }

        var evento = await _eventoRepository.GetByIdAsync(reserva.EventoId);
        if (evento == null)
        {
            throw new BusinessRuleException("NOT_FOUND", "El evento asociado a la reserva no existe.");
        }

        // RN-07: Si faltan menos de 48 horas, marcar como perdida
        var tiempoRestante = evento.FechaInicio - DateTime.UtcNow;
        if (tiempoRestante.TotalHours < 48)
        {
            reserva.MarcarComoPerdida();
        }

        reserva.Cancelar();
        await _reservaRepository.UpdateAsync(reserva);

        return MapToDto(reserva);
    }

    public async Task<List<ReservaDto>> ListarReservasPorEventoAsync(Guid eventoId)
    {
        var reservas = await _reservaRepository.GetByEventoIdAsync(eventoId);
        return reservas.Select(MapToDto).ToList();
    }

    public async Task<List<ReservaDto>> ListarTodasLasReservasAsync()
    {
        var reservas = await _reservaRepository.GetAllAsync();
        return reservas.Select(MapToDto).ToList();
    }

    private static ReservaDto MapToDto(Reserva reserva)
    {
        return new ReservaDto
        {
            Id = reserva.Id,
            EventoId = reserva.EventoId,
            Cantidad = reserva.Cantidad,
            NombreComprador = reserva.NombreComprador,
            EmailComprador = reserva.EmailComprador,
            Estado = reserva.Estado,
            CodigoReserva = reserva.CodigoReserva,
            FechaCancelacion = reserva.FechaCancelacion,
            EsPerdida = reserva.EsPerdida,
            CreadoEn = reserva.CreadoEn
        };
    }
}
