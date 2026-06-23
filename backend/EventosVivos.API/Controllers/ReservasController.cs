using EventosVivos.Application.DTOs;
using EventosVivos.Application.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly ReservaService _reservaService;
    private readonly IValidator<CreateReservaDto> _createReservaValidator;

    public ReservasController(ReservaService reservaService, IValidator<CreateReservaDto> createReservaValidator)
    {
        _reservaService = reservaService;
        _createReservaValidator = createReservaValidator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaDto>>> ListarReservas([FromQuery] Guid? eventoId = null)
    {
        if (eventoId.HasValue)
        {
            var reservas = await _reservaService.ListarReservasPorEventoAsync(eventoId.Value);
            return Ok(reservas);
        }

        var todasLasReservas = await _reservaService.ListarTodasLasReservasAsync();
        return Ok(todasLasReservas);
    }

    [HttpPost]
    public async Task<ActionResult<ReservaDto>> CrearReserva([FromBody] CreateReservaDto dto)
    {
        var validationResult = await _createReservaValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(f => new { property = f.PropertyName, message = f.ErrorMessage })
                .ToList();
            return BadRequest(new { errors });
        }

        var reserva = await _reservaService.ReservarAsync(dto);
        return CreatedAtAction(nameof(ListarReservas), new { eventoId = reserva.EventoId }, reserva);
    }

    [HttpPut("{id}/confirmar")]
    public async Task<ActionResult<ReservaDto>> ConfirmarPago(Guid id)
    {
        var reserva = await _reservaService.ConfirmarPagoAsync(id);
        return Ok(reserva);
    }

    [HttpPut("{id}/cancelar")]
    public async Task<ActionResult<ReservaDto>> Cancelar(Guid id)
    {
        var reserva = await _reservaService.CancelarAsync(id);
        return Ok(reserva);
    }
}
