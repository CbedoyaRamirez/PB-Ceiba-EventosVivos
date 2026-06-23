using EventosVivos.Application.Interfaces;
using EventosVivos.Domain.Entities;
using EventosVivos.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly AppDbContext _context;

    public ReservaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Reserva>> GetAllAsync()
    {
        return await _context.Reservas
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Reserva?> GetByIdAsync(Guid id)
    {
        return await _context.Reservas
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task AddAsync(Reserva reserva)
    {
        if (reserva == null)
        {
            return;
        }

        await _context.Reservas.AddAsync(reserva);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Reserva reserva)
    {
        if (reserva == null)
        {
            return;
        }

        _context.Reservas.Update(reserva);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var reserva = await _context.Reservas.FirstOrDefaultAsync(r => r.Id == id);
        if (reserva == null)
        {
            return;
        }

        _context.Reservas.Remove(reserva);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Reserva>> GetByEventoIdAsync(Guid eventoId)
    {
        return await _context.Reservas
            .AsNoTracking()
            .Where(r => r.EventoId == eventoId)
            .ToListAsync();
    }
}
