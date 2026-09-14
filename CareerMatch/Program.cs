using CareerMatch.Configuration;
using CareerMatch.Data;
using CareerMatch.Services.Implementations;
using CareerMatch.Services.Interfaces;
using CareerMatch.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using NLog;
using NLog.Web;
using System.Text;

// 1. NLog'u erkenden başlat (Startup hatalarını yakalamak için)
var logger = NLog.LogManager.GetCurrentClassLogger();

logger.Debug("Uygulama başlatılıyor (init main)");

try
{
    var builder = WebApplication.CreateBuilder(args);

    // 2. NLog'u .NET Host'una entegre et
    builder.Logging.ClearProviders();
    builder.Host.UseNLog();

    // ----- Servis Kayıtları (Service Registration) -----
    builder.Services.AddControllers();

    // AppSettings.json'dan "JwtSettings" bölümünü oku
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

    // SQL Server Bağlantısı
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    // AutoMapper
    builder.Services.AddAutoMapper(typeof(Program).Assembly);

    // Caching
    builder.Services.AddMemoryCache();

    // Scoped Servisler
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IProfileService, ProfileService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped(typeof(IGenericService<>), typeof(GenericService<>));

    // JWT Yapılandırması
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.Key))
    {
        throw new InvalidOperationException("JWT ayarları (JwtSettings) düzgün yapılandırılmamış.");
    }

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/chathub")))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactApp",
            policy =>
            {
                policy.WithOrigins("http://localhost:5173", "http://localhost:5174") // Frontend URL
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials(); // SignalR için gerekli
            });
    });

    // Swagger
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "CareerMatch API", Version = "v1" });
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            In = ParameterLocation.Header,
            Description = "Lütfen JWT token'ı 'Bearer ' (boşluk) ile girin",
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey
        });
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });

    builder.Services.AddSignalR(); 

    // Mongo Settings
    builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));
    var mongoSettings = builder.Configuration.GetSection("MongoSettings").Get<MongoSettings>()
        ?? throw new InvalidOperationException("MongoSettings yapılandırılmamış.");

    builder.Services.AddSingleton<IMongoClient>(sp => new MongoClient(mongoSettings.ConnectionString));
    builder.Services.AddSingleton(sp => 
        sp.GetRequiredService<IMongoClient>().GetDatabase(mongoSettings.DatabaseName));

    // Diğer Servisler
    builder.Services.AddHttpClient<IFastApiJobService, FastApiService>();
    builder.Services.AddScoped<ITextExtractionService, TextExtractionService>();
    builder.Services.AddScoped<IMongoService, MongoService>();
    builder.Services.AddHttpClient<IAiClient, AiClient>(client =>
    {
        var baseUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:5001";
        client.BaseAddress = new Uri(baseUrl);
    });

    // ----- Pipeline Yapılandırması -----
    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/error");
        app.UseHsts();
    }

    // Veritabanı Seeding
    using (var scope = app.Services.CreateScope())
    {
        await DbSeeder.SeedAsync(app);
    }

    // app.UseHttpsRedirection(); // Localhost'ta SSL hatası vermemesi için kapattık
    app.UseStaticFiles(); // CV işlemleri için gerekli
    
    // CORS'u en başa (veya exception middleware'den önceye) alıyoruz
    app.UseCors("AllowReactApp");

    // Middleware Sıralaması - Global exception handler'ı CORS'tan sonra olmalı (wrapper mantığı: Cors(Global(App)))
    // Ancak burada basit zincirleme var: Request -> Cors -> Global -> App
    // Exception fırlayınca: App -> Global (Catch & Response) -> Cors (Headers ekle) -> Response
    app.UseMiddleware<GlobalExceptionMiddleware>();
    
    app.UseAuthentication(); // Authentication her zaman Authorization'dan önce olmalı
    app.UseAuthorization();
    
    app.UseMiddleware<RequestResponseLoggingMiddleware>();

    app.MapControllers();

    // Uygulama durduğunda LogManager'ı kapat
    app.Lifetime.ApplicationStopped.Register(LogManager.Shutdown);

    app.MapHub<CareerMatch.Hubs.ChatHub>("/chathub");

    app.Run();
}
catch (Exception exception)
{
    logger.Error(exception, "Uygulama başlatılırken kritik bir hata oluştu.");
    throw;
}
finally
{
    LogManager.Shutdown();
}
