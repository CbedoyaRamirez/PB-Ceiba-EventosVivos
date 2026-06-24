using EventosVivos.Application.DTOs;
using EventosVivos.Application.Services;
using EventosVivos.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventosController : ControllerBase
{
    private readonly EventoService _eventoService;

    public EventosController(EventoService eventoService)
    {
        _eventoService = eventoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventoDto>>> ListarEventos(
        [FromQuery] TipoEvento? tipo = null,
        [FromQuery] DateTime? fechaInicio = null,
        [FromQuery] int? venueId = null,
        [FromQuery] EstadoEvento? estado = null,
        [FromQuery] string? titulo = null)
    {
        var eventos = await _eventoService.ListarEventosAsync(tipo, fechaInicio, venueId, estado, titulo);
        return Ok(eventos);
    }

    [HttpPost]
    public async Task<ActionResult<EventoDto>> CrearEvento([FromBody] CreateEventoDto dto)
    {
        var evento = await _eventoService.CrearEventoAsync(dto);
        return CreatedAtAction(nameof(ObtenerEvento), new { id = evento.Id }, evento);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EventoDto>> ObtenerEvento(Guid id)
    {
        var evento = await _eventoService.GetEventoAsync(id);
        return Ok(evento);
    }

    [HttpGet("{id}/reporte")]
    public async Task<ActionResult<ReporteOcupacionDto>> ObtenerReporte(Guid id)
    {
        var reporte = await _eventoService.GetReporteAsync(id);
        return Ok(reporte);
    }

    [HttpPatch("{id}/cancelar")]
    public async Task<ActionResult<EventoDto>> CancelarEvento(Guid id)
    {
        var evento = await _eventoService.CancelarEventoAsync(id);
        return Ok(evento);
    }
}
