using System.ComponentModel.DataAnnotations.Schema;

namespace CareerMatch.Models
{
    public class SavedJob
    {
        public int Id { get; set; }

        [ForeignKey("JobSeeker")]
        public int JobSeekerId { get; set; }
        public virtual JobSeeker JobSeeker { get; set; } = null!;

        public string JobListingId { get; set; } = null!; // MongoDB ObjectId

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}

