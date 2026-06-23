using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VenuesController : ControllerBase
{
    private readonly IVenueRepository _venueRepository;

    public VenuesController(IVenueRepository venueRepository)
    {
        _venueRepository = venueRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VenueDto>>> ListarVenues()
    {
        var venues = await _venueRepository.GetAllAsync();
        var dtos = venues.Select(v => new VenueDto
        {
            Id = v.Id,
            Nombre = v.Nombre,
            Capacidad = v.Capacidad,
            Ciudad = v.Ciudad
        }).ToList();

        return Ok(dtos);
    }
}
