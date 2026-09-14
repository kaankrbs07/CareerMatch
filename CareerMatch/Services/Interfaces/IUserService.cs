// Interfaces/IUserService.cs

using CareerMatch.Dtos; // DTO'larýmýzý ekledik

namespace CareerMatch.Services.Interfaces
{
    public interface IUserService
    {

        // Yeni bir kullanýcýyý, DTO'dan aldýðý bilgilere göre oluþturur.
        //Kimlik doðrulama cevabýný (Kullanýcý ve Token) içeren DTO
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
        

        //Kimlik doðrulama cevabýný (Kullanýcý ve Token) içeren DTO
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);


        // ID'ye göre bir kullanýcýyý  getirir.
        Task<UserDto?> GetUserByIdAsync(int id);
        

        // Tüm kullanýcýlarý  getirir.
        Task<IEnumerable<UserDto>> GetAllUsersAsync();

        // Þifre deðiþtirme
        Task ChangePasswordAsync(int userId, ChangePasswordDto dto);

        // Þifremi Unuttum - Kod Gönder
        Task ForgotPasswordAsync(string email);

        // Þifremi Unuttum - Kod Doðrula
        Task<bool> VerifyResetCodeAsync(string email, string code);

        // Þifremi Unuttum - Yeni Þifre Belirle
        // Þifremi Unuttum - Yeni Þifre Belirle
        Task ResetPasswordAsync(string email, string code, string newPassword);

        // E-posta Doðrulama
        Task VerifyEmailAsync(string email, string code);
        Task ResendVerificationCodeAsync(string email);
    }
}
