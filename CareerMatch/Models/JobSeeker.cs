// Models/JobSeeker.cs

using System.ComponentModel.DataAnnotations.Schema; 

namespace CareerMatch.Models
{
    public class JobSeeker
    {
        public int Id { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public byte? ExperienceYears { get; set; } // SQL'de TINYINT, C#'ta 'byte' karþýlýðýdýr
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // ----- Ýliþkiler (Foreign Keys) -----

        // Users Tablosu ile 1-1 iliþki
        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        // Occupations Tablosu ile iliþki
        [ForeignKey("Occupation")]
        public int? OccupationId { get; set; } // SQL'de NULL olabilir 
        public virtual Occupation? Occupation { get; set; }

        // EducationLevels Tablosu ile iliþki
        [ForeignKey("EducationLevel")]
        public int? EducationId { get; set; } // SQL'de NULL olabilir 
        public virtual EducationLevel? EducationLevel { get; set; }
    }
}
