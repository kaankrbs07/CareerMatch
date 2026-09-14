namespace CareerMatch.Middlewares;

// Kullanýcýya döneceðimiz tek alan:
public readonly record struct ErrorBody(string Code);

public sealed record AppError(string Code, int StatusCode);

public static class AppErrors
{
    public static class Common
    {
        public static readonly AppError Unexpected   = new("CM-0001", StatusCodes.Status500InternalServerError);
        public static readonly AppError NotFound     = new("CM-0404", StatusCodes.Status404NotFound);
        public static readonly AppError Unauthorized = new("CM-0401", StatusCodes.Status401Unauthorized);
        public static readonly AppError Forbidden    = new("CM-0403", StatusCodes.Status403Forbidden); // Kimlik doðrulama yapýlmýþ olsa bile bu iþlemi yapmaya izin yok.
        public static readonly AppError Conflict     = new("CM-0409", StatusCodes.Status409Conflict); // Çeliþme hatasý
    }
    public static class Validation
    {
        public static readonly AppError BadRequest = new("CM-0400", StatusCodes.Status400BadRequest);
    }
    public static class Database
    {
        public static readonly AppError SqlError = new("CM-0601", StatusCodes.Status500InternalServerError);
    }
    public static class Mail
    {
        public static readonly AppError SendFailed = new("CM-0701", StatusCodes.Status502BadGateway);
    }
}

public sealed class AppException : Exception
{
    public AppError Error { get; }
    public AppException(AppError error, string? message = null, Exception? inner = null)
        : base(message, inner) => Error = error;
}
