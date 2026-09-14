using CareerMatch.Data;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IMongoService _mongoService;

        public AdminController(AppDbContext db, IMongoService mongoService)
        {
            _db = db;
            _mongoService = mongoService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _db.Users.Where(u => u.IsActive).CountAsync();
            var totalEmployers = await _db.Employers.CountAsync();
            var totalJobSeekers = await _db.JobSeekers.CountAsync();
            
            var allJobs = await _mongoService.GetAllJobsAsync();
            var totalJobs = allJobs.Count;
            var activeJobs = allJobs.Count(j => j.IsActive == true);

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalEmployers = totalEmployers,
                TotalJobSeekers = totalJobSeekers,
                TotalJobs = totalJobs,
                ActiveJobs = activeJobs
            });
        }
    }
}

