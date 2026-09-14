// Services/Implementations/TokenService.cs

using CareerMatch.Configuration; // JwtSettings için
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.Extensions.Options; // IOptions için
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CareerMatch.Services.Implementations
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;

        public TokenService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
        }

        public string GenerateToken(User user)
        {
            // 1. Token'ý imzalamak için 'Key'i (appsettings) al
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);

            // 2. Token içeriðini (Payload) oluþtur (Claims)
            // ProfileController'daki metotlar bu Claim'leri okur.
            var claims = new List<Claim>
            {
                // Bu, ProfileController'daki GetCurrentUserId() metodunun çalýþmasýný saðlar
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                
                // Bu, [Authorize(Roles = "Admin")] gibi kontrollerin çalýþmasýný saðlar
                // Not: user.Role'ün 'null' olmamasý gerekir (UserService'te Include ettik)
                new Claim(ClaimTypes.Role, user.Role.Name) 
            };

            // 3. Token'ýn yaþam süresi, Issuer, Audience vb. ayarlarýný yap
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.DurationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            // 4. Token'ý oluþtur ve string'e çevir
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
