using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;

namespace CareerMatch.Services.Implementations
{
    public class FastApiService : IFastApiJobService
    {
        private readonly ILogger<FastApiService> _logger;
        private readonly HttpClient _http;

        public FastApiService(HttpClient http,ILogger<FastApiService> logger)
        {
            _logger = logger;
            _http = http;
        } 

        public async Task<List<JobListing>> GetScrapedJobsAsync()
        {
            // Example: call external API and deserialize JSON to List<JobListing>
            List<JobListing>? fetchedJobs = await _http.GetFromJsonAsync<List<JobListing>>("https://example.com/api/jobs");
            return fetchedJobs ?? new List<JobListing>();
        }
    }
}


