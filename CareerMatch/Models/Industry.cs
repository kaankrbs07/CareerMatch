// Models/Industry.cs

using CareerMatch.Models.Interfaces;

namespace CareerMatch.Models
{
    public class Industry : IActiveEntity
    {
        public bool IsActive { get; set; } = true;
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Ýliþki: Bir sektör birden fazla iþverene sahip olabilir
        public virtual ICollection<Employer> Employers { get; set; } = new List<Employer>();
    }
}
