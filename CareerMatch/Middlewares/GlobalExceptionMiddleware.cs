using Microsoft.Data.SqlClient;

namespace CareerMatch.Middlewares;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var traceId = context.TraceIdentifier;
            var (code, status) = MapToError(ex);

            // Ayrýntýlar logda:
            _logger.LogError(ex, "Unhandled exception code={Code} traceId={TraceId} path={Path}",
                code, traceId, context.Request.Path);

            // Kullanýcýya sadece KOD
            context.Response.StatusCode = status;
            context.Response.ContentType = "application/json";

            // Ýzi header’a koy, body’de göstermiyoruz
            context.Response.Headers["X-Correlation-ID"] = traceId;

            await context.Response.WriteAsJsonAsync(new ErrorBody(code));
        }
    }

    private static (string Code, int Status) MapToError(Exception ex) => ex switch
    {
        AppException a              => (a.Error.Code, a.Error.StatusCode),
        SqlException                => (AppErrors.Database.SqlError.Code, AppErrors.Database.SqlError.StatusCode),
        UnauthorizedAccessException => (AppErrors.Common.Unauthorized.Code, AppErrors.Common.Unauthorized.StatusCode),
        KeyNotFoundException        => (AppErrors.Common.NotFound.Code, AppErrors.Common.NotFound.StatusCode),
        ArgumentException           => (AppErrors.Validation.BadRequest.Code, AppErrors.Validation.BadRequest.StatusCode),
        _                           => (AppErrors.Common.Unexpected.Code, AppErrors.Common.Unexpected.StatusCode)
    };
}
