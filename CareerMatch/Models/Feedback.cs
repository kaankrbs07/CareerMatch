using System;
using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // general, bug, feature, improvement

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

