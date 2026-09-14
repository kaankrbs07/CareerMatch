using System;
using System.ComponentModel.DataAnnotations;

namespace CareerMatch.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; } // Receiver
        public virtual User User { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Link { get; set; } // URL to navigate to (e.g., /dashboard/jobs/123)

        public bool IsRead { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Type: "Application", "Viewed", "System"
        public string Type { get; set; } = "System"; 
    }
}

