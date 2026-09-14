// Models/Employer.cs 

using System.ComponentModel.DataAnnotations.Schema;

namespace CareerMatch.Models
{
    public class Employer
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // ----- Ýliþkiler (Foreign Keys) -----

        // Users Tablosu ile 1-1 iliþki
        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        // Industries Tablosu ile iliþki (Update script'ine göre)
        [ForeignKey("Industry")]
        public int? IndustryId { get; set; } // SQL'de NULL olabilir 
        public virtual Industry? Industry { get; set; }
    }
}
