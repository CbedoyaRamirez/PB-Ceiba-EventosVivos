using EventosVivos.Application.DTOs;
using FluentValidation;

namespace EventosVivos.Application.Validators;

public class CreateReservaDtoValidator : AbstractValidator<CreateReservaDto>
{
    public CreateReservaDtoValidator()
    {
        RuleFor(x => x.EventoId)
            .NotEmpty().WithMessage("El ID del evento es obligatorio.");

        RuleFor(x => x.Cantidad)
            .GreaterThanOrEqualTo(1).WithMessage("La cantidad debe ser mayor o igual a 1.");

        RuleFor(x => x.NombreComprador)
            .NotEmpty().WithMessage("El nombre del comprador es obligatorio.")
            .Length(2, 100).WithMessage("El nombre debe tener entre 2 y 100 caracteres.");

        RuleFor(x => x.EmailComprador)
            .NotEmpty().WithMessage("El email del comprador es obligatorio.")
            .EmailAddress().WithMessage("El email debe tener un formato válido.");
    }
}
