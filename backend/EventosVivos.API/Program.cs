using EventosVivos.API.Filters;
using EventosVivos.Application.DTOs;
using EventosVivos.Application.Interfaces;
using EventosVivos.Application.Services;
using EventosVivos.Application.Validators;
using EventosVivos.API.Middleware;
using EventosVivos.Infrastructure.Data;
using EventosVivos.Infrastructure.Repositories;
using EventosVivos.Infrastructure.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http.Resilience;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<FluentValidationFilter>();
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter(
                System.Text.Json.JsonNamingPolicy.SnakeCaseLower,
                allowIntegerValues: true));
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("EventosVivosDb"));

builder.Services.AddScoped<IEventoRepository, EventoRepository>();
builder.Services.AddScoped<IReservaRepository, ReservaRepository>();
builder.Services.AddScoped<IVenueRepository, VenueRepository>();

builder.Services.AddScoped<EventoService>();
builder.Services.AddScoped<ReservaService>();

builder.Services.AddScoped<IValidator<CreateEventoDto>, CreateEventoDtoValidator>();
builder.Services.AddScoped<IValidator<CreateReservaDto>, CreateReservaDtoValidator>();

builder.Services.AddHttpClient<IPaymentGatewayService, HttpPaymentGatewayService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["PaymentGateway:BaseUrl"] ?? "https://api.pagos.ejemplo.com");
    client.Timeout = TimeSpan.FromSeconds(10);
})
.AddStandardResilienceHandler();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policyBuilder =>
    {
        policyBuilder.WithOrigins("http://localhost:4200", "http://localhost:4300", "http://localhost:4301")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .SetResourceBuilder(ResourceBuilder.CreateDefault()
            .AddService("EventosVivos.API"))
        .AddAspNetCoreInstrumentation()
        .AddConsoleExporter());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();

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
