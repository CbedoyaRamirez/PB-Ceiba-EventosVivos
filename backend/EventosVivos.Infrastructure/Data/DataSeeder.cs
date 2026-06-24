using EventosVivos.Domain.Entities;
using EventosVivos.Domain.Enums;
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

        // Create sample eventos
        var tomorrow = DateTime.UtcNow.AddDays(1);
        var nextWeek = DateTime.UtcNow.AddDays(7);
        var nextMonth = DateTime.UtcNow.AddDays(30);

        var eventos = new List<Evento>
        {
            new Evento(
                "Conferencia de Tecnología 2024",
                "Una conferencia anual sobre las últimas tendencias en tecnología, inteligencia artificial y transformación digital.",
                1,
                150,
                tomorrow.AddHours(10),
                tomorrow.AddHours(12),
                0,
                TipoEvento.Conferencia
            ),
            new Evento(
                "Taller de Angular Avanzado",
                "Aprende técnicas avanzadas de Angular, optimización de rendimiento y mejores prácticas en desarrollo.",
                2,
                40,
                nextWeek.AddHours(14),
                nextWeek.AddHours(17),
                50,
                TipoEvento.Taller
            ),
            new Evento(
                "Concierto de Rock en Vivo",
                "Disfruta de una noche de rock en vivo con las mejores bandas locales e internacionales.",
                3,
                400,
                nextMonth.AddHours(20),
                nextMonth.AddHours(23),
                25,
                TipoEvento.Concierto
            ),
            new Evento(
                "Taller de Diseño UX/UI",
                "Descubre los principios fundamentales del diseño de experiencia de usuario y mejora tus habilidades de diseño.",
                1,
                35,
                nextWeek.AddDays(3).AddHours(9),
                nextWeek.AddDays(3).AddHours(13),
                40,
                TipoEvento.Taller
            )
        };

        await context.Eventos.AddRangeAsync(eventos);
        await context.SaveChangesAsync();
    }
}
