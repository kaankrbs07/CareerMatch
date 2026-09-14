using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Dtos
{
    public record RoleDto
    {
        public int Id { get; init; }
        public required string Name { get; init; }
        public string? Description { get; init; }
    }

    public record RoleCreateDto
    {
        [Required(ErrorMessage = "Rol adı zorunludur.")]
        [StringLength(50, ErrorMessage = "Rol adı 50 karakterden fazla olamaz.")]
        public required string Name { get; init; }

        [StringLength(500, ErrorMessage = "Açıklama 500 karakterden fazla olamaz.")]
        public string? Description { get; init; }
    }

    public record RoleUpdateDto
    {
        [Required(ErrorMessage = "Rol adı zorunludur.")]
        [StringLength(50, ErrorMessage = "Rol adı 50 karakterden fazla olamaz.")]
        public required string Name { get; init; }

        [StringLength(500, ErrorMessage = "Açıklama 500 karakterden fazla olamaz.")]
        public string? Description { get; init; }
    }
}

