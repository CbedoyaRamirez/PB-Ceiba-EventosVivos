using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Application.Services;
using EventosVivos.Application.Validators;
using EventosVivos.API.Middleware;
using EventosVivos.Infrastructure.Data;
using EventosVivos.Infrastructure.Repositories;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter(
                System.Text.Json.JsonNamingPolicy.CamelCase,
                allowIntegerValues: true));
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("EventosVivosDb"));

builder.Services.AddScoped<IEventoRepository, EventoRepository>();
builder.Services.AddScoped<IReservaRepository, ReservaRepository>();
builder.Services.AddScoped<IVenueRepository, VenueRepository>();

builder.Services.AddScoped<EventoService>();
builder.Services.AddScoped<ReservaService>();

builder.Services.AddScoped<IValidator<CreateEventoDto>, CreateEventoDtoValidator>();
builder.Services.AddScoped<IValidator<CreateReservaDto>, CreateReservaDtoValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policyBuilder =>
    {
        policyBuilder.WithOrigins("http://localhost:4200", "http://localhost:4300", "http://localhost:4301")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionHandler>();

app.UseCors("AllowLocalhost");
app.UseHttpsRedirection();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DataSeeder.SeedAsync(services);
}

app.Run();

public partial class Program { }
