using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Dtos
{
    public record EducationLevelDto
    {
        public int Id { get; init; }
        public required string Name { get; init; }
    }

    public record EducationLevelCreateDto
    {
        [Required(ErrorMessage = "Eğitim seviyesi adı zorunludur.")]
        public required string Name { get; init; }
    }

    public record EducationLevelUpdateDto
    {
        [Required(ErrorMessage = "Eğitim seviyesi adı zorunludur.")]
        public required string Name { get; init; }
    }
}

