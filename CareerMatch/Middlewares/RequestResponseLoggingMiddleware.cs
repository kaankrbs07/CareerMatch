using System.Diagnostics;
using System.Security.Claims;
using NLog;

namespace CareerMatch.Middlewares;

public sealed class RequestResponseLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestResponseLoggingMiddleware> _log;

    public RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> log)
    {
        _next = next;
        _log  = log;
    }

    public async Task Invoke(HttpContext ctx)
    {
        // CorrelationId: header > traceId > yeni guid
        var correlationId =
            (ctx.Request.Headers.TryGetValue("X-Correlation-ID", out var h) && !string.IsNullOrWhiteSpace(h))
                ? h.ToString()
                : (ctx.TraceIdentifier ?? Guid.NewGuid().ToString("N"));

        ctx.Response.Headers["X-Correlation-ID"] = correlationId;

        var userId = ctx.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "-";

        // NLog 5.0: ScopeContext
        using (ScopeContext.PushProperty("CorrelationId", correlationId))
        using (ScopeContext.PushProperty("UserId", userId))
        using (_log.BeginScope(new Dictionary<string, object?> { ["CorrelationId"] = correlationId, ["UserId"] = userId }))
        {
            var sw   = Stopwatch.StartNew();
            var req  = ctx.Request;
            var path = req.Path + req.QueryString;

            await _next(ctx);

            sw.Stop();
            var status = ctx.Response.StatusCode;

            if (status >= 500)
            {
                _log.LogError("HTTP {Method} {Path} => {Status} ({Elapsed} ms)", req.Method, path, status, sw.ElapsedMilliseconds);
            }
            else if (status >= 400)
            {
                _log.LogWarning("HTTP {Method} {Path} => {Status} ({Elapsed} ms)", req.Method, path, status, sw.ElapsedMilliseconds);
            }
            // 2xx-3xx: log yazmýyoruz (dosya þiþmesin)
        }
    }
}
