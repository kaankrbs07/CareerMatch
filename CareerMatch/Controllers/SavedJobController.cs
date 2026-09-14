using CareerMatch.Data;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "JobSeeker")]
    public class SavedJobController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IMongoService _mongoService;

        public SavedJobController(AppDbContext db, IMongoService mongoService)
        {
            _db = db;
            _mongoService = mongoService;
        }

        [HttpPost("{jobId}")]
        public async Task<IActionResult> SaveJob(string jobId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _db.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);
            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            // Check if already saved and active
            var existing = await _db.SavedJobs.FirstOrDefaultAsync(
                s => s.JobSeekerId == jobSeeker.Id && s.JobListingId == jobId && s.IsActive);
            
            if (existing != null)
            {
                return Ok(new { message = "İlan zaten kaydedilmiş." });
            }

            // Check if there's an inactive saved job to reactivate
            var inactiveSaved = await _db.SavedJobs.FirstOrDefaultAsync(
                s => s.JobSeekerId == jobSeeker.Id && s.JobListingId == jobId && !s.IsActive);

            if (inactiveSaved != null)
            {
                // Reactivate the existing record instead of creating a new one
                inactiveSaved.IsActive = true;
                await _db.SaveChangesAsync();
                return Ok(new { message = "İlan tekrar kaydedildi." });
            }

            // Create new saved job record
            var savedJob = new SavedJob
            {
                JobSeekerId = jobSeeker.Id,
                JobListingId = jobId
            };

            _db.SavedJobs.Add(savedJob);
            await _db.SaveChangesAsync();

            return Ok(new { message = "İlan kaydedildi." });
        }

        [HttpDelete("{jobId}")]
        public async Task<IActionResult> UnsaveJob(string jobId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _db.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);
            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            var savedJob = await _db.SavedJobs.FirstOrDefaultAsync(s => s.JobSeekerId == jobSeeker.Id && s.JobListingId == jobId && s.IsActive);
            if (savedJob == null)
            {
                return NotFound("Kaydedilmiş ilan bulunamadı.");
            }

            // Soft delete
            savedJob.IsActive = false;
            await _db.SaveChangesAsync();

            return Ok(new { message = "İlan kaydedilenlerden kaldırıldı." });
        }

        [HttpGet]
        public async Task<IActionResult> GetSavedJobs()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _db.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);
            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            var savedJobIds = await _db.SavedJobs
                .Where(s => s.JobSeekerId == jobSeeker.Id && s.IsActive)
                .Select(s => s.JobListingId)
                .ToListAsync();

            if (!savedJobIds.Any()) return Ok(new List<object>());

            var jobs = await _mongoService.GetJobsByIdsAsync(savedJobIds);
            
            // Filter out deleted jobs
            var result = jobs
                .Where(j => j != null && j.IsActive)
                .Select(j => new {
                    j.Id,
                    j.Title,
                    j.Company,
                    j.Location,
                    j.JobType,
                    j.CreatedAt,
                    j.MinAmount,
                    j.MaxAmount,
                    j.Currency,
                    Description = j.Description,
                    Skills = j.Skills
                });

            return Ok(result);
        }

        [HttpGet("ids")]
        public async Task<IActionResult> GetSavedJobIds()
        {
             var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
             var jobSeeker = await _db.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);
             if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

             var savedJobIds = await _db.SavedJobs
                 .Where(s => s.JobSeekerId == jobSeeker.Id && s.IsActive)
                 .Select(s => s.JobListingId)
                 .ToListAsync();

             return Ok(savedJobIds);
        }
    }
}

