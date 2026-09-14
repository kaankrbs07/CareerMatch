// Controllers/AuthController.cs

using CareerMatch.Dtos;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        
        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        
        // Yeni bir kullanýcý (JobSeeker, Employer veya Admin) kaydý oluþturur.
        [HttpPost("register")] 
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            var authResponse = await _userService.RegisterAsync(dto);
            
            // Baþarýlý olursa 200 OK ve AuthResponseDto (token) döner
            return Ok(authResponse);
        } 
        
        
        // Mevcut bir kullanýcýnýn sisteme giriþ yapmasýný saðlar.
        [HttpPost("login")] // POST api/auth/login
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            var authResponse = await _userService.LoginAsync(dto);

            // Baþarýlý olursa 200 OK ve AuthResponseDto (token) döner
            return Ok(authResponse);
        }
        

        // Þifre deðiþtirme
        [HttpPost("change-password")]
        [Microsoft.AspNetCore.Authorization.Authorize] // Token gerekli
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!);
            await _userService.ChangePasswordAsync(userId, dto);
            return Ok(new { message = "Þifreniz baþarýyla güncellendi." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            await _userService.ForgotPasswordAsync(email);
            return Ok(new { message = "Þifre sýfýrlama kodu e-posta adresinize gönderildi." });
        }

        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromQuery] string email, [FromQuery] string code)
        {
            var result = await _userService.VerifyResetCodeAsync(email, code);
            if (!result)
                return BadRequest(new { message = "Geçersiz veya süresi dolmuþ kod." });
            
            return Ok(new { message = "Kod doðrulandý." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await _userService.ResetPasswordAsync(dto.Email, dto.Code, dto.NewPassword);
            return Ok(new { message = "Þifreniz baþarýyla sýfýrlandý." });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            await _userService.VerifyEmailAsync(dto.Email, dto.Code);
            return Ok(new { message = "E-posta adresiniz baþarýyla doðrulandý." });
        }

        [HttpPost("resend-verification-email")]
        public async Task<IActionResult> ResendVerificationEmail([FromQuery] string email)
        {
            await _userService.ResendVerificationCodeAsync(email);
            return Ok(new { message = "Doðrulama kodu tekrar gönderildi." });
        }
    }

    public class VerifyEmailDto
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
    }


    public class ResetPasswordDto 
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
