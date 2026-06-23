using EventosVivos.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;

namespace EventosVivos.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Check if data already exists
        if (context.Venues.Any())
        {
            return;
        }

        // Create venues
        var venues = new List<Venue>
        {
            new Venue
            {
                Id = 1,
                Nombre = "Auditorio Central",
                Capacidad = 200,
                Ciudad = "Bogotá"
            },
            new Venue
            {
                Id = 2,
                Nombre = "Sala Norte",
                Capacidad = 50,
                Ciudad = "Bogotá"
            },
            new Venue
            {
                Id = 3,
                Nombre = "Arena Sur",
                Capacidad = 500,
                Ciudad = "Medellín"
            }
        };

        await context.Venues.AddRangeAsync(venues);
        await context.SaveChangesAsync();
    }
}
