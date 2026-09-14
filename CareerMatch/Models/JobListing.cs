using System.Text.Json.Serialization;
using MongoDB.Bson.Serialization.Attributes;

namespace CareerMatch.Models
{
    public record JobListing 
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; } // MongoDB ID'si

        public int? EmployerId { get; set; } // Link to MSSQL Employer Context
        [JsonPropertyName("scraperId")]
        public string? ScraperJobId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ExpirationDate { get; init; }

        [JsonPropertyName("site")]
        public string? Site { get; init; }

        [JsonPropertyName("job_url")]
        public string? JobUrl { get; init; }

        [JsonPropertyName("job_url_direct")]
        public string? JobUrlDirect { get; init; }

        [JsonPropertyName("title")]
        public string? Title { get; init; }

        [JsonPropertyName("company")]
        public string? Company { get; init; }

        [JsonPropertyName("location")]
        public string? Location { get; init; }

        [JsonPropertyName("date_posted")]
        public string? DatePosted { get; init; }

        [JsonPropertyName("job_type")]
        public string? JobType { get; init; }

        [JsonPropertyName("salary_source")]
        public string? SalarySource { get; init; }

        [JsonPropertyName("interval")]
        public string? Interval { get; init; }

        [JsonPropertyName("min_amount")]
        public double? MinAmount { get; init; }

        [JsonPropertyName("max_amount")]
        public double? MaxAmount { get; init; }

        [JsonPropertyName("currency")]
        public string? Currency { get; init; }

        [JsonPropertyName("is_remote")]
        public bool? IsRemote { get; init; }

        [JsonPropertyName("job_level")]
        public string? JobLevel { get; init; }

        [JsonPropertyName("job_function")]
        public string? JobFunction { get; init; }

        [JsonPropertyName("listing_type")]
        public string? ListingType { get; init; }

        [JsonPropertyName("emails")]
        public List<string>? Emails { get; init; }

        [JsonPropertyName("description")]
        public string? Description { get; init; }

        [JsonPropertyName("company_industry")]
        public string? CompanyIndustry { get; init; }

        [JsonPropertyName("company_url")]
        public string? CompanyUrl { get; init; }

        [JsonPropertyName("companyLogo")]
        public string? CompanyLogo { get; init; }

        [JsonPropertyName("company_url_direct")]
        public string? CompanyUrlDirect { get; init; }

        [JsonPropertyName("company_adresses")]
        public string? CompanyAdresses { get; init; }

        [JsonPropertyName("company_num_employees")]
        public string? CompanyNumEmployees { get; init; }

        [JsonPropertyName("comapy_revenue")]
        public double? CompanyRevenue { get; init; }

        [JsonPropertyName("company_description")]
        public string? CompanyDescription { get; init; }

        [JsonPropertyName("skills")]
        public string? Skills { get; init; }

        [JsonPropertyName("experince_range")]
        public double? ExperinceRange { get; init; }

        [JsonPropertyName("company_rating")]
        public double? CompanyRating { get; init; }

        [JsonPropertyName("comany_reviews_count")]
        public long? CompanyReviewsCount { get; init; }

        [JsonPropertyName("vacancy_count")]
        public int? VacancyCount { get; init; }

        [JsonPropertyName("work_from_home_type")]
        public string? WorkFromHomeType { get; init; }

        public bool IsActive { get; set; } = true;
    }
}

