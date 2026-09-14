
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CareerMatch.Models
{
    public class Application
    {
        [Key]
        public int Id { get; set; }

        public int JobSeekerId { get; set; }
        public JobSeeker JobSeeker { get; set; } = null!;

        public string JobListingId { get; set; } = null!; // MongoDB ID for the job

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    }

    public enum ApplicationStatus
    {
        Applied,
        Viewed,
        Shortlisted,
        Rejected,
        Accepted,
        Removed,
        Withdrawn
    }
}

