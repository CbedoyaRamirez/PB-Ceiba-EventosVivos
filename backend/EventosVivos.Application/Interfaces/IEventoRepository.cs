using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;

namespace EventosVivos.Application.Interfaces;

public interface IEventoRepository
{
    Task<List<Evento>> GetAllAsync();
    Task<Evento?> GetByIdAsync(Guid id);
    Task AddAsync(Evento evento);
    Task UpdateAsync(Evento evento);
    Task DeleteAsync(Guid id);
    Task<List<Evento>> GetByVenueAndDateRangeAsync(int venueId, DateTime fechaInicio, DateTime fechaFin);
    Task<List<Evento>> GetFilteredAsync(
        TipoEvento? tipo,
        DateTime? fechaInicio,
        int? venueId,
        EstadoEvento? estado,
        string? titulo);
}
