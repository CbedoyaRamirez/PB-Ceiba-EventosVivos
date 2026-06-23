using EventosVivos.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventosVivos.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public required DbSet<Venue> Venues { get; set; }
    public required DbSet<Evento> Eventos { get; set; }
    public required DbSet<Reserva> Reservas { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Venue
        modelBuilder.Entity<Venue>()
            .HasKey(v => v.Id);

        // Configure Evento
        modelBuilder.Entity<Evento>()
            .HasKey(e => e.Id);

        // Configure Reserva
        modelBuilder.Entity<Reserva>()
            .HasKey(r => r.Id);
    }
}
