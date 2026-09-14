// Models/Admin.cs 

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerMatch.Models
{
    public class Admin
    {
        [Key] // Primary Key
        public int Id { get; set; }

        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // ----- Ýliþkiler (Foreign Keys) -----

        // Users Tablosu ile 1-1 iliþki
        [ForeignKey("User")] // Navigation property'nin adýný belirtir
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!; 
    }
}
