namespace CareerMatch.Dtos
{
    public class CreateJobDto
    {
        public string Title { get; set; } = null!;
        public string? DescriptionText { get; set; }
        public string? TagsCsv { get; set; }
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public double? SalaryMin { get; set; }
        public double? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public string? Occupation { get; set; }
        public int DurationDays { get; set; } = 7; // Default 7 days, max 15
    }
}

