// Models/Occupation.cs

using System;
using System.Collections.Generic;

using CareerMatch.Models.Interfaces;

namespace CareerMatch.Models
{
    public class Occupation : IActiveEntity
    {
        public bool IsActive { get; set; } = true;
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Ýliþki: Bir meslek birden fazla iþ arayana sahip olabilir
        public virtual ICollection<JobSeeker> JobSeekers { get; set; } = new List<JobSeeker>();
    }
}
