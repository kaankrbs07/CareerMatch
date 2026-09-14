using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Dtos
{
    // Yeni kullanýcý kaydý için istemciden (React) alýnacak veriyi temsil eder.
    public record RegisterRequestDto
    {
        [Required(ErrorMessage = "E-posta adresi zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçersiz e-posta formatý.")]
        public required string Email { get; init; }

        [Required(ErrorMessage = "Þifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Þifre en az 6 karakter olmalýdýr.")]
        public required string Password { get; init; }

        [Required(ErrorMessage = "Ýsim zorunludur.")]
        [StringLength(100)]
        public required string FirstName { get; init; }

        [Required(ErrorMessage = "Soyisim zorunludur.")]
        [StringLength(100)]
        public required string LastName { get; init; }

        [Required(ErrorMessage = "Rol ID zorunludur.")]
        [Range(1, 3, ErrorMessage = "Geçersiz Rol ID. (1=Admin, 2=Employer, 3=JobSeeker)")]
        public int RoleId { get; init; }
    }

    // Kullanýcý giriþi için istemciden alýnacak veriyi temsil eder.
    public record LoginRequestDto
    {
        [Required(ErrorMessage = "E-posta adresi zorunludur.")]
        [EmailAddress]
        public required string Email { get; init; }

        [Required(ErrorMessage = "Þifre zorunludur.")]
        public required string Password { get; init; }
    }

    // Baþarýlý bir giriþ (login) veya kayýt (register) sonrasý istemciye döneceðimiz cevap.
    public record AuthResponseDto
    {
        public required UserDto User { get; init; }

        [Required]
        public required string Token { get; init; }
        public required string Role { get; init; }
        public required int UserId { get; init; }
    }
}
