using EventosVivos.Domain.Entities;

namespace EventosVivos.Application.Interfaces;

public interface IReservaRepository
{
    Task<List<Reserva>> GetAllAsync();
    Task<Reserva?> GetByIdAsync(Guid id);
    Task AddAsync(Reserva reserva);
    Task UpdateAsync(Reserva reserva);
    Task DeleteAsync(Guid id);
    Task<List<Reserva>> GetByEventoIdAsync(Guid eventoId);
}
