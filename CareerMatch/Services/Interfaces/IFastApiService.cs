using System.Collections.Generic;
using System.Threading.Tasks;
using CareerMatch.Models;

namespace CareerMatch.Services.Interfaces{

    public interface IFastApiJobService
    {
        Task<List<JobListing>> GetScrapedJobsAsync();
    }
}

