namespace EventosVivos.Domain.Exceptions;

public class BusinessRuleException : DomainException
{
    public string Code { get; }

    public BusinessRuleException(string code, string message) : base(message)
    {
        Code = code;
    }

    public BusinessRuleException(string code, string message, Exception innerException)
        : base(message, innerException)
    {
        Code = code;
    }
}
