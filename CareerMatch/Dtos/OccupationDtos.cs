using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Dtos
{
    // Bir mesleði istemciye (React) göndermek için kullanýlýr (Read).
    public record OccupationDto
    {
        public int Id { get; init; }
        public required string Name { get; init; }
        public string? Description { get; init; }
    }

    // Ýstemciden yeni bir meslek kaydý oluþturmak için kullanýlýr (Create).
    public record OccupationCreateDto
    {
        [Required(ErrorMessage = "Meslek adý zorunludur.")]
        [StringLength(100, ErrorMessage = "Meslek adý 100 karakterden fazla olamaz.")]
        public required string Name { get; init; }

        [StringLength(500, ErrorMessage = "Açýklama 500 karakterden fazla olamaz.")]
        public string? Description { get; init; }
    }

    // Ýstemciden mevcut bir meslek kaydýný güncellemek için kullanýlýr (Update).
    public record OccupationUpdateDto
    {
        [Required(ErrorMessage = "Meslek adý zorunludur.")]
        [StringLength(100, ErrorMessage = "Meslek adý 100 karakterden fazla olamaz.")]
        public required string Name { get; init; }

        [StringLength(500, ErrorMessage = "Açýklama 500 karakterden fazla olamaz.")]
        public string? Description { get; init; }
    }
}
