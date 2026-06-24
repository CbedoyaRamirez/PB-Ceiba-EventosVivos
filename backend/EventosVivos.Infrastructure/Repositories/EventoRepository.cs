using EventosVivos.Application.Interfaces;
using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
using EventosVivos.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Infrastructure.Repositories;

public class EventoRepository : IEventoRepository
{
    private readonly AppDbContext _context;

    public EventoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Evento>> GetAllAsync()
    {
        return await _context.Eventos
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Evento?> GetByIdAsync(Guid id)
    {
        return await _context.Eventos
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task AddAsync(Evento evento)
    {
        if (evento == null)
        {
            return;
        }

        await _context.Eventos.AddAsync(evento);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Evento evento)
    {
        if (evento == null)
        {
            return;
        }

        _context.Eventos.Update(evento);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var evento = await _context.Eventos.FirstOrDefaultAsync(e => e.Id == id);
        if (evento == null)
        {
            return;
        }

        _context.Eventos.Remove(evento);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Evento>> GetByVenueAndDateRangeAsync(int venueId, DateTime fechaInicio, DateTime fechaFin)
    {
        return await _context.Eventos
            .AsNoTracking()
            .Where(e =>
                e.VenueId == venueId &&
                e.FechaInicio < fechaFin &&
                e.FechaFin > fechaInicio)
            .ToListAsync();
    }

    public async Task<List<Evento>> GetFilteredAsync(
        TipoEvento? tipo,
        DateTime? fechaInicio,
        int? venueId,
        EstadoEvento? estado,
        string? titulo)
    {
        var query = _context.Eventos.AsNoTracking().AsQueryable();

        if (tipo.HasValue)
            query = query.Where(e => e.Tipo == tipo.Value);

        if (fechaInicio.HasValue)
            query = query.Where(e => e.FechaInicio >= fechaInicio.Value);

        if (venueId.HasValue)
            query = query.Where(e => e.VenueId == venueId.Value);

        if (estado.HasValue)
            query = query.Where(e => e.Estado == estado.Value);

        if (!string.IsNullOrWhiteSpace(titulo))
            query = query.Where(e => e.Titulo.Contains(titulo));

        return await query.ToListAsync();
    }
}
