// Models/EducationLevel.cs

namespace CareerMatch.Models
{
    public class EducationLevel
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }


        // Ýliþki: Bir eðitim seviyesi birden fazla iþ arayana sahip olabilir
        public virtual ICollection<JobSeeker> JobSeekers { get; set; } = new List<JobSeeker>();
    }
}
