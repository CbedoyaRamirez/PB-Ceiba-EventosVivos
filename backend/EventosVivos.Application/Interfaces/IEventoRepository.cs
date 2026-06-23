using EventosVivos.Domain.Entities;

namespace EventosVivos.Application.Interfaces;

public interface IEventoRepository
{
    Task<List<Evento>> GetAllAsync();
    Task<Evento?> GetByIdAsync(Guid id);
    Task AddAsync(Evento evento);
    Task UpdateAsync(Evento evento);
    Task DeleteAsync(Guid id);
    Task<List<Evento>> GetByVenueAndDateRangeAsync(int venueId, DateTime fechaInicio, DateTime fechaFin);
}
