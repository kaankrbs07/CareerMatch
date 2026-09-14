// Dtos/Industry/IndustryDtos.cs

using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Dtos
{
    // Bir sektörü istemciye (React) göndermek için kullanýlýr (Read).
    public record IndustryDto
    {
        public int Id { get; init; }
        public required string Name { get; init; }
        public string? Description { get; init; }
    }

    // Ýstemciden yeni bir sektör kaydý oluþturmak için kullanýlýr (Create).
    public record IndustryCreateDto
    {
        [Required(ErrorMessage = "Sektör adý zorunludur.")]
        [StringLength(100, ErrorMessage = "Sektör adý 100 karakterden fazla olamaz.")]
        public required string Name { get; init; }

        [StringLength(500, ErrorMessage = "Açýklama 500 karakterden fazla olamaz.")]
        public string? Description { get; init; }
    }

    // Ýstemciden mevcut bir sektör kaydýný güncellemek için kullanýlýr (Update).
    public record IndustryUpdateDto
    {
        [Required(ErrorMessage = "Sektör adý zorunludur.")]
        [StringLength(100, ErrorMessage = "Sektör adý 100 karakterden fazla olamaz.")]
        public required string Name { get; init; }

        [StringLength(500, ErrorMessage = "Açýklama 500 karakterden fazla olamaz.")]
        public string? Description { get; init; }
    }
}
