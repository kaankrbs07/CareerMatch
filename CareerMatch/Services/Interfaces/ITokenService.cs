// Services/Interfaces/ITokenService.cs

using CareerMatch.Models;

namespace CareerMatch.Services.Interfaces
{
    public interface ITokenService
    {

        // Verilen kullanýcý bilgileri için bir JWT token'ý oluþturur.
        string GenerateToken(User user);
    }
}
