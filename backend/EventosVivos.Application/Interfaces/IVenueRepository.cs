using EventosVivos.Domain.Entities;

namespace EventosVivos.Application.Interfaces;

public interface IVenueRepository
{
    Task<List<Venue>> GetAllAsync();
    Task<Venue?> GetByIdAsync(int id);
}
