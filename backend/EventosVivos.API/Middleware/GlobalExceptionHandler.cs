using EventosVivos.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EventosVivos.API.Middleware;

public sealed partial class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        IProblemDetailsService problemDetailsService,
        ILogger<GlobalExceptionHandler> logger)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, extensions) = MapException(exception);

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            LogUnhandledException(_logger, exception);
        }
        else
        {
            LogHandledException(_logger, exception.GetType().Name, exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = statusCode < 500 ? exception.Message : "Ocurrió un error interno en el servidor",
        };

        foreach (var (key, value) in extensions)
            problemDetails.Extensions[key] = value;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception,
        });
    }

    private static (int statusCode, string title, Dictionary<string, object?> extensions)
        MapException(Exception exception)
    {
        return exception switch
        {
            BusinessRuleException br => (
                StatusCodes.Status400BadRequest,
                "Regla de negocio violada",
                new Dictionary<string, object?> { ["code"] = br.Code }),

            DomainException => (
                StatusCodes.Status400BadRequest,
                "Error de dominio",
                new Dictionary<string, object?> { ["code"] = string.Empty }),

            ValidationException ve => (
                StatusCodes.Status400BadRequest,
                "Error de validación",
                new Dictionary<string, object?>
                {
                    ["code"] = "VALIDATION_ERROR",
                    ["errors"] = ve.Errors
                        .Select(f => new { property = f.PropertyName, message = f.ErrorMessage })
                        .ToList()
                }),

            ArgumentException or InvalidOperationException => (
                StatusCodes.Status400BadRequest,
                "Argumento inválido",
                new Dictionary<string, object?> { ["code"] = string.Empty }),

            KeyNotFoundException => (
                StatusCodes.Status404NotFound,
                "Recurso no encontrado",
                new Dictionary<string, object?> { ["code"] = "NOT_FOUND" }),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Error interno del servidor",
                new Dictionary<string, object?> { ["code"] = "INTERNAL_ERROR" })
        };
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled exception")]
    private static partial void LogUnhandledException(ILogger logger, Exception exception);

    [LoggerMessage(Level = LogLevel.Warning,
        Message = "Handled exception of type {ExceptionType}: {Message}")]
    private static partial void LogHandledException(
        ILogger logger, string exceptionType, string message);
}
