using EventosVivos.Application.DTOs;
using EventosVivos.Domain.Enums;
using FluentValidation;

namespace EventosVivos.Application.Validators;

public class CreateEventoDtoValidator : AbstractValidator<CreateEventoDto>
{
    public CreateEventoDtoValidator()
    {
        RuleFor(x => x.Titulo)
            .NotEmpty().WithMessage("El título es obligatorio.")
            .Length(5, 100).WithMessage("El título debe tener entre 5 y 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria.")
            .Length(10, 500).WithMessage("La descripción debe tener entre 10 y 500 caracteres.");

        RuleFor(x => x.VenueId)
            .GreaterThan(0).WithMessage("El ID del venue debe ser mayor a 0.");

        RuleFor(x => x.CapacidadMaxima)
            .GreaterThan(0).WithMessage("La capacidad máxima debe ser mayor a 0.");

        RuleFor(x => x.FechaInicio)
            .GreaterThan(DateTime.UtcNow).WithMessage("La fecha de inicio debe ser futura.");

        RuleFor(x => x.FechaFin)
            .GreaterThan(x => x.FechaInicio).WithMessage("La fecha de fin debe ser posterior a la fecha de inicio.");

        RuleFor(x => x.Precio)
            .GreaterThan(0).WithMessage("El precio debe ser mayor a 0.");

        RuleFor(x => x.Tipo)
            .NotEqual(default(TipoEvento)).WithMessage("El tipo de evento no puede ser None.");
    }
}
