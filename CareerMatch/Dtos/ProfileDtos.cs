using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Dtos
{
    // ----- JobSeeker (Ýþ Arayan) DTO'larý -----
    
    // Bir Ýþ Arayan profilini güncellemek için istemciden alýnacak veriler.
    public record JobSeekerProfileUpdateDto
    {
        // Kullanýcý bilgileri
        [Required]
        public required string FirstName { get; init; }
        [Required]
        public required string LastName { get; init; }

        // JobSeeker bilgileri
        public string? Country { get; init; }
        public string? City { get; init; }
        
        // SQL'deki CHECK kýsýtlamasýna (0-60) uygun
        [Range(0, 60, ErrorMessage = "Deneyim yýlý 0 ile 60 arasýnda olmalýdýr.")] 
        public byte? ExperienceYears { get; init; } // 'byte' SQL'deki 'TINYINT' karþýlýðýdýr
        
        public string? Description { get; init; }

        // Ýliþkiler: Ýstemci ID'leri gönderir
        public int? OccupationId { get; init; }
        public int? EducationId { get; init; }
    }

    // ----- Employer (Ýþ Veren) DTO'larý -----

    // Bir Ýþ Veren profilini güncellemek için istemciden alýnacak veriler.
    public record EmployerProfileUpdateDto
    {
        // Kullanýcý bilgileri
        [Required]
        public required string FirstName { get; init; } // Temsilcinin adý
        [Required]
        public required string LastName { get; init; }  // Temsilcinin soyadý

        // Employer bilgileri
        [Required(ErrorMessage = "Þirket adý zorunludur.")]
        public required string CompanyName { get; init; }

        [Required(ErrorMessage = "Þirket e-posta adresi zorunludur.")]
        [EmailAddress]
        public required string Email { get; init; } // Þirketin iletiþim e-postasý (Kullanýcýnýnkinden ayrý)

        public string? PhoneNumber { get; init; }
        public string? Country { get; init; }
        public string? City { get; init; }
        public string? Address { get; init; }
        public string? Description { get; init; }
        
        // Ýliþki: Ýstemci ID'yi gönderir
        public int? IndustryId { get; init; }
    }
}
