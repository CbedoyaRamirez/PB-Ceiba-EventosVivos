using EventosVivos.Domain.Exceptions;
using FluentValidation;
using System.Text.Json;

namespace EventosVivos.API.Middleware;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;

    public GlobalExceptionHandler(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new { error = string.Empty, code = string.Empty };

        if (exception is BusinessRuleException brException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            response = new { error = brException.Message, code = brException.Code };
        }
        else if (exception is DomainException dException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            response = new { error = dException.Message, code = string.Empty };
        }
        else if (exception is ValidationException vException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            var errors = vException.Errors
                .Select(f => new { property = f.PropertyName, message = f.ErrorMessage })
                .ToList();
            return context.Response.WriteAsJsonAsync(new { errors });
        }
        else if (exception is ArgumentException or InvalidOperationException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            response = new { error = exception.Message, code = string.Empty };
        }
        else if (exception is KeyNotFoundException kException)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            response = new { error = "Recurso no encontrado", code = "NOT_FOUND" };
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            response = new { error = "Ocurrió un error interno en el servidor", code = "INTERNAL_ERROR" };
        }

        return context.Response.WriteAsJsonAsync(response);
    }
}
