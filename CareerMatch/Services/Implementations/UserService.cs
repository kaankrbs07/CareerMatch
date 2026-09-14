// Services/Implementations/UserService.cs

using AutoMapper;
using CareerMatch.Data;
using CareerMatch.Dtos;
using CareerMatch.Middlewares;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces; 
using Microsoft.EntityFrameworkCore;

namespace CareerMatch.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UserService> _logger;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService; 
        private readonly IEmailService _emailService;
        
        public UserService(
            AppDbContext context, 
            ILogger<UserService> logger, 
            IMapper mapper, 
            ITokenService tokenService,
            IEmailService emailService) 
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
            _tokenService = tokenService;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            // 1. E-posta zaten var mý?
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            {
                throw new AppException(AppErrors.Common.Conflict, $"'{dto.Email}' e-posta adresi zaten kullanýlýyor.");
            }

            // 2. Þifre Hashing (GEÇÝCÝ olarak atlandý)
            _logger.LogWarning(" {Email} kullanýcýsýnýn þifresi düz metin olarak kaydediliyor.", dto.Email);
            
            // 3. DTO -> Entity Dönüþümü (AutoMapper ile)
            var user = _mapper.Map<User>(dto); 

            // Manuel atanan alanlar
            user.IsActive = true;
            user.CreatedAt = DateTime.UtcNow;

            // 4. Database Transaction
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // A, B, C, D adýmlarý (Veritabaný iþlemleri)
                
                // Doðrulama kodu ve durumu
                user.IsVerified = false;
                var random = new Random();
                user.VerificationCode = random.Next(100000, 999999).ToString();
                user.VerificationCodeExpires = DateTime.UtcNow.AddMinutes(15);
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync(); 

                switch (user.RoleId)
                {
                    case 1: // Admin
                         _context.Admins.Add(new Admin 
                         { 
                             UserId = user.Id, 
                             CreatedAt = DateTime.UtcNow 
                         }); 
                         break;
                    case 2: // Employer
                         _context.Employers.Add(new Employer 
                         { 
                             UserId = user.Id, 
                             Email = user.Email, 
                             CompanyName = $"{user.FirstName} {user.LastName} Þirketi", // Daha okunaklý varsayýlan
                             CreatedAt = DateTime.UtcNow,
                             Description = "Kayýt sýrasýnda oluþturuldu."
                         }); 
                         break;
                    case 3: // JobSeeker
                         _context.JobSeekers.Add(new JobSeeker 
                         { 
                             UserId = user.Id, 
                             CreatedAt = DateTime.UtcNow 
                         }); 
                         break;
                    default:
                        throw new AppException(AppErrors.Validation.BadRequest, "Geçersiz rol ID'si."); 
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Yeni kullanýcý kayýt oldu (UserID: {UserId}, RoleID: {RoleId})", user.Id, user.RoleId);

                // 5. Baþarýlý cevap için DTO oluþtur
                
                // RoleName'in doðru gelmesi için 'Include' ile yeniden çekiyoruz (TokenService de buna ihtiyaç duyar)
                var registeredUser = await _context.Users
                    .Include(u => u.Role)
                    .FirstAsync(u => u.Id == user.Id);

                var userDto = _mapper.Map<UserDto>(registeredUser); 

                // GÜNCELLEME: Geçici token yerine TokenService'i kullan
                // Token verification iþleminden sonra verilecek, burada sadece kayýt baþarýlý dönüyoruz
                // var token = _tokenService.GenerateToken(registeredUser);
                // _logger.LogInformation("Kullanýcý için JWT Token oluþturuldu (UserID: {UserId})", registeredUser.Id);

                // E-posta gönder (Doðrulama Kodu)
                var subject = "Hesap Doðrulama Kodu";
                var body = $@"
                    <h3>Hoþ Geldiniz!</h3>
                    <p>CareerMatch hesabýnýzý oluþturduðunuz için teþekkürler.</p>
                    <p>Hesabýnýzý doðrulamak için lütfen aþaðýdaki kodu kullanýn:</p>
                    <p>Doðrulama Kodu: <strong>{user.VerificationCode}</strong></p>
                    <p>Bu kod 15 dakika süreyle geçerlidir.</p>
                ";

                // Arka planda veya burada gönderebiliriz. Þimdilik burada:
                try 
                {
                    await _emailService.SendEmailAsync(user.Email, subject, body);
                }
                catch(Exception ex)
                {
                     _logger.LogError(ex, "Doðrulama e-postasý gönderilemedi (Email: {Email})", user.Email);
                     // Kullanýcýya kayýt oldu ama mail gitmedi uyarýsý verilebilir, þimdilik devam.
                }

                return new AuthResponseDto
                {
                    User = userDto,
                    Token = "", // Token henüz yok, doðrulama gerekli
                    Role = registeredUser.Role.Name,
                    UserId = registeredUser.Id
                };
            }
            catch (Exception ex)
            {
                // ... (catch bloðu ayný)
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Kayýt iþlemi sýrasýnda hata oluþtu (Email: {Email})", dto.Email);
                if (ex is not AppException)
                    throw new AppException(AppErrors.Database.SqlError, "Kayýt iþlemi veritabaný hatasý nedeniyle baþarýsýz oldu.", ex);
                throw;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            // user.Role'ü dahil et (TokenService ve Mapper için gerekli)
            var user = await _context.Users
                .Include(u => u.Role) 
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            // 1. Kullanýcý var mý veya aktif mi?
            if (user == null)
            {
                 _logger.LogWarning("Giriþ baþarýsýz: Kullanýcý bulunamadý (Email: {Email})", dto.Email);
                 throw new AppException(AppErrors.Common.Unauthorized, "Geçersiz e-posta veya þifre.");
            }
            
            if (!user.IsActive)
            {
                _logger.LogWarning("Giriþ baþarýsýz: Kullanýcý aktif deðil (Email: {Email})", dto.Email);
                throw new AppException(AppErrors.Common.Unauthorized, "Hesabýnýz aktif deðil.");
            }
            
            if (!user.IsVerified)
            {
                _logger.LogWarning("Giriþ baþarýsýz: E-posta doðrulanmamýþ (Email: {Email})", dto.Email);
                throw new AppException(AppErrors.Common.Unauthorized, "Lütfen önce e-posta adresinizi doðrulayýn.");
            }

            // 2. Þifre Doðrulama (GEÇÝCÝ olarak düz metin)
            var inputPassword = dto.Password?.Trim();
            var dbPassword = user.Password?.Trim();
            
            if (dbPassword != inputPassword)  
            {
                _logger.LogWarning("Baþarýsýz giriþ denemesi (Email: {Email}) - Þifre uyuþmadý", dto.Email);
                throw new AppException(AppErrors.Common.Unauthorized, "Geçersiz e-posta veya þifre.");
            }

            _logger.LogInformation("Kullanýcý baþarýyla giriþ yaptý (Email: {Email})", dto.Email);

            // 3. Entity -> DTO Dönüþümü
            var userDto = _mapper.Map<UserDto>(user); 
            
            var token = _tokenService.GenerateToken(user);
            _logger.LogInformation("Kullanýcý için JWT Token oluþturuldu (Email: {Email})", dto.Email);

            return new AuthResponseDto
            {
                User = userDto,
                Token = token,
                Role = user.Role.Name,
                UserId = user.Id 
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            // 'IsActive = false' olan pasif kullanýcýlarý getirmez
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id && u.IsActive); 

            if (user == null)
                return null;
                
            return _mapper.Map<UserDto>(user); 
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            // Sadece 'IsActive = true' olan kullanýcýlarý listele
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.IsActive) 
                .ToListAsync();

            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) 
                throw new AppException(AppErrors.Common.NotFound, "Kullanýcý bulunamadý.");

            // Plain text check (current implementation style)
            // Note: Should be upgraded to BCrypt.Verify later
            if (user.Password != dto.ActivePassword)
                throw new AppException(AppErrors.Common.Unauthorized, "Mevcut þifre hatalý.");

            if (dto.ActivePassword == dto.NewPassword)
                throw new AppException(AppErrors.Validation.BadRequest, "Yeni þifre eski þifre ile ayný olamaz.");

            user.Password = dto.NewPassword;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Kullanýcý þifresini deðiþtirdi (UserId: {UserId})", userId);
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Güvenlik gereði kullanýcý bulunamadý hatasý dönmeyebiliriz,
                // ama þimdilik "Böyle bir kullanýcý yok" diyelim ki frontend anlasýn.
                // Veya sessizce dönüp log atabiliriz. Kullanýcý deneyimi için hata dönüyorum.
                throw new AppException(AppErrors.Common.NotFound, "Bu e-posta adresiyle kayýtlý kullanýcý bulunamadý.");
            }

            // 6 haneli kod üret
            var random = new Random();
            var code = random.Next(100000, 999999).ToString();

            user.PasswordResetCode = code;
            user.PasswordResetCodeExpires = DateTime.UtcNow.AddMinutes(15); // 15 dakika geçerli

            await _context.SaveChangesAsync();
            
            // E-posta gönder
            var subject = "Þifre Sýfýrlama Kodu";
            var body = $@"
                <h3>Þifre Sýfýrlama Ýsteði</h3>
                <p>Hesabýnýz için þifre sýfýrlama talebinde bulundunuz.</p>
                <p>Doðrulama kodunuz: <strong>{code}</strong></p>
                <p>Bu kod 15 dakika süreyle geçerlidir.</p>
            ";

            try 
            {
                await _emailService.SendEmailAsync(email, subject, body);
                _logger.LogInformation("Þifre sýfýrlama kodu gönderildi (Email: {Email})", email);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "E-posta gönderilemedi (Email: {Email})", email);
                // Hata detayýný görebilmek için ex.Message ekliyoruz
                throw new AppException(AppErrors.Common.Unexpected, $"E-posta gönderilirken hata: {ex.Message}");
            }
        }

        public async Task<bool> VerifyResetCodeAsync(string email, string code)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;

            if (user.PasswordResetCode == code && user.PasswordResetCodeExpires > DateTime.UtcNow)
            {
                return true;
            }
            return false;
        }

        public async Task ResetPasswordAsync(string email, string code, string newPassword)
        {
             var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
             if (user == null)
                 throw new AppException(AppErrors.Common.NotFound, "Kullanýcý bulunamadý.");

             if (user.PasswordResetCode != code || user.PasswordResetCodeExpires <= DateTime.UtcNow)
             {
                 throw new AppException(AppErrors.Validation.BadRequest, "Geçersiz veya süresi dolmuþ kod.");
             }

             // Yeni þifreyi ata (Þimdilik düz metin)
             user.Password = newPassword;
             
             // Kodu temizle
             user.PasswordResetCode = null;
             user.PasswordResetCodeExpires = null;

             await _context.SaveChangesAsync();
             _logger.LogInformation("Þifre sýfýrlama baþarýlý (Email: {Email})", email);
        }

        public async Task VerifyEmailAsync(string email, string code)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new AppException(AppErrors.Common.NotFound, "Kullanýcý bulunamadý.");

            if (user.IsVerified)
            {
                // Zaten doðrulanmýþsa hata vermeye gerek yok, belki bilgi verilebilir.
                return;
            }

            if (user.VerificationCode != code || user.VerificationCodeExpires <= DateTime.UtcNow)
            {
                throw new AppException(AppErrors.Validation.BadRequest, "Geçersiz veya süresi dolmuþ doðrulama kodu.");
            }

            user.IsVerified = true;
            user.VerificationCode = null;
            user.VerificationCodeExpires = null;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Kullanýcý e-postasý doðrulandý (Email: {Email})", email);
        }

        public async Task ResendVerificationCodeAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new AppException(AppErrors.Common.NotFound, "Kullanýcý bulunamadý.");

            if (user.IsVerified)
                throw new AppException(AppErrors.Validation.BadRequest, "E-posta adresi zaten doðrulanmýþ.");

            var random = new Random();
            var code = random.Next(100000, 999999).ToString();
            
            user.VerificationCode = code;
            user.VerificationCodeExpires = DateTime.UtcNow.AddMinutes(15);

            await _context.SaveChangesAsync();

             var subject = "Hesap Doðrulama Kodu (Tekrar)";
             var body = $@"
                <h3>Hesap Doðrulama</h3>
                <p>Yeni doðrulama kodunuz: <strong>{code}</strong></p>
                <p>Bu kod 15 dakika süreyle geçerlidir.</p>
             ";

             await _emailService.SendEmailAsync(email, subject, body);
             _logger.LogInformation("Doðrulama kodu tekrar gönderildi (Email: {Email})", email);
        }
    }
}
