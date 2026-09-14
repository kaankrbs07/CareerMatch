// Models/User.cs

using CareerMatch.Models.Interfaces;

namespace CareerMatch.Models
{
    public class User : IActiveEntity
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        public string? PasswordResetCode { get; set; }
        public DateTime? PasswordResetCodeExpires { get; set; }

        public bool IsVerified { get; set; }
        public string? VerificationCode { get; set; }
        public DateTime? VerificationCodeExpires { get; set; }

        public int RoleId { get; set; } 
        public virtual Role Role { get; set; } = null!;

        public virtual Admin? Admin { get; set; }
        public virtual Employer? Employer { get; set; }
        public virtual JobSeeker? JobSeeker { get; set; }
    }
}
