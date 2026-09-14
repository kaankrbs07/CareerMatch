using CareerMatch.Data;
using CareerMatch.Dtos;
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
    public class JobPostingController : ControllerBase
    {
        private readonly IMongoService _mongoService;
        private readonly AppDbContext _db;
        private readonly IEmailService _emailService;

        public JobPostingController(IMongoService mongoService, AppDbContext db, IEmailService emailService)
        {
            _mongoService = mongoService;
            _db = db;
            _emailService = emailService;
        }

        [HttpPost]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> Create(CreateJobDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
            
            if (employer == null && !User.IsInRole("Admin")) 
                return Unauthorized("Only employers can post jobs.");

            // Validate duration (1-15 days)
            if (dto.DurationDays < 1 || dto.DurationDays > 15)
                return BadRequest("Duration must be between 1 and 15 days.");

            // Calculate expiration date
            var expirationDate = DateTime.UtcNow.AddDays(dto.DurationDays);

            // Map DTO fields to JobListing model
            var job = new JobListing
            {
                EmployerId = employer?.Id ?? 0,
                CreatedAt = DateTime.UtcNow,
                ExpirationDate = expirationDate,
                Company = employer?.CompanyName,
                Title = dto.Title,
                Description = dto.DescriptionText,      // descriptionText → Description
                Skills = dto.TagsCsv,                   // tagsCsv → Skills
                Location = dto.Location,
                JobType = dto.JobType,
                MinAmount = dto.SalaryMin,              // salaryMin → MinAmount
                MaxAmount = dto.SalaryMax,              // salaryMax → MaxAmount
                Currency = dto.Currency,
                JobFunction = dto.Occupation,           // occupation → JobFunction
                IsActive = true
            };

            await _mongoService.InsertJob(job);
            return Ok(new { message = "Job listing created successfully", id = job.Id, expiresAt = expirationDate });
        }

        [HttpGet("my-jobs")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> GetMyJobs()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null && !User.IsInRole("Admin"))
                return Unauthorized();

            var allJobs = await _mongoService.GetAllJobsAsync();
            
            // If admin, maybe see all? Or just their own if they have an employer profile?
            // For now let's assume filtering by EmployerId in memory (since we don't have GetByEmployerId in MongoService yet)
            // Ideally should be a DB query.
            var myJobs = allJobs.Where(j => j.EmployerId == employer?.Id).OrderByDescending(j => j.CreatedAt).ToList();

            var result = myJobs.Select(j => new {
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

        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] string? location,
            [FromQuery] string? jobType,
            [FromQuery] string? currency,
            [FromQuery] double? minSalary,
            [FromQuery] double? maxSalary,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10
            ) {
            // Fetch from Mongo with filters and pagination
            var (jobs, totalCount) = await _mongoService.SearchJobsAsync(keyword, location, jobType, currency, minSalary, maxSalary, pageNumber, pageSize);
            
            var items = jobs.OrderByDescending(j => j.CreatedAt)
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
                
            var result = new
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
                
            return Ok(result);
        }

        [HttpGet("employer-stats")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> GetEmployerStats()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
            if (employer == null) return NotFound();

            var allJobs = await _mongoService.GetAllJobsAsync();
            var myJobs = allJobs.Where(j => j.EmployerId == employer.Id).ToList();

            return Ok(new
            {
                activeJobs = myJobs.Count,
                totalApplications = 0, // Placeholder
                newCandidates = 0 // Placeholder
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> UpdateJob(string id, JobListing updatedJob)
        {
            var existingJob = await _mongoService.GetJobByIdAsync(id);
            if (existingJob == null) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null && !User.IsInRole("Admin")) return Unauthorized();
            if (employer != null && existingJob.EmployerId != employer.Id) return Forbid();

            updatedJob.Id = existingJob.Id;
            updatedJob.EmployerId = existingJob.EmployerId;
            updatedJob.CreatedAt = existingJob.CreatedAt; 
            
            // Should properly implement Update in MongoService, but for now we can Delete + Insert or just have an Update method
            // Since IMongoService doesn't have Update, let's assume we might need to add it or do a workaround.
            // But MongoService usually has ReplaceOne. 
            // Let's implement Delete + Insert for simplicity if Update isn't available, 
            // OR check if MongoService has Replace/Update. 
            // Looking at IMongoService, we have InsertJob and RemoveJob. 
            // We should add Update to IMongoService ideally. 
            // For now, let's assume we can't easily change IMongoService without breaking other things or just Replace is better.
            
            // ACTUALLY, let's add UpdateJobAsync to IMongoService in future tasks if needed.
            // For now, let's just do Remove then Insert to simulate update, keeping ID.
            
            await _mongoService.RemoveJob(existingJob);
            await _mongoService.InsertJob(updatedJob);

            return Ok(new { message = "Job updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> DeleteJob(string id)
        {
            var job = await _mongoService.GetJobByIdAsync(id);
            if (job == null) return NotFound();

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var employer = await _db.Employers.FirstOrDefaultAsync(e => e.UserId == userId);

            if (employer == null && !User.IsInRole("Admin")) return Unauthorized();
            if (employer != null && job.EmployerId != employer.Id) return Forbid();

            await _mongoService.SoftDeleteJobAsync(job.Id!);

            // Handle applications
            var applications = await _db.Applications
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js.User)
                .Where(a => a.JobListingId == id)
                .ToListAsync();

            foreach (var app in applications)
            {
                app.Status = ApplicationStatus.Removed;
                
                // Send email
                var emailBody = $@"
                    <h3>Başvurduğunuz İlan Kaldırıldı</h3>
                    <p>Merhaba {app.JobSeeker.User.FirstName},</p>
                    <p>Başvuru yaptığınız <strong>{job.Title}</strong> başlıklı ilan işveren tarafından yayından kaldırılmıştır.</p>
                    <p>Başvurunuzun durumu 'Kaldırıldı' olarak güncellenmiştir.</p>
                    <br>
                    <p>Saygılarımızla,<br>CareerMatch Ekibi</p>";

                try 
                {
                    await _emailService.SendEmailAsync(app.JobSeeker.User.Email, "Başvurduğunuz İlan Hakkında Bilgilendirme", emailBody);
                }
                catch 
                {
                    // Log email failure but don't stop the process
                    // _logger.LogError(...) if logger was available
                }
            }

            // Soft delete saved jobs
            var savedJobs = await _db.SavedJobs
                .Where(sj => sj.JobListingId == id)
                .ToListAsync();
            
            foreach (var savedJob in savedJobs)
            {
                savedJob.IsActive = false;
            }
            
            await _db.SaveChangesAsync();

            return Ok(new { message = "Job deleted successfully and applicants notified." });
        }

        [HttpPost("expire-jobs")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExpireJobs()
        {
            var expiredJobs = await _mongoService.GetAllJobsAsync();
            var jobsToExpire = expiredJobs
                .Where(j => j.IsActive && j.ExpirationDate.HasValue && j.ExpirationDate.Value < DateTime.UtcNow)
                .ToList();

            int expiredCount = 0;
            foreach (var job in jobsToExpire)
            {
                await _mongoService.SoftDeleteJobAsync(job.Id!);
                expiredCount++;
            }

            return Ok(new { 
                message = $"Expired {expiredCount} job(s)",
                expiredCount,
                jobIds = jobsToExpire.Select(j => j.Id).ToList()
            });
        }
    }
}
