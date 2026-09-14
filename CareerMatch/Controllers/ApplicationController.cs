
using CareerMatch.Data;
using CareerMatch.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CareerMatch.Controllers
{
using CareerMatch.Services.Interfaces; // Added namespace

    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMongoService _mongoService;
        private readonly IEmailService _emailService;
        private readonly ILogger<ApplicationController> _logger;

        public ApplicationController(
            AppDbContext context, 
            IMongoService mongoService, 
            IEmailService emailService,
            ILogger<ApplicationController> logger)
        {
            _context = context;
            _mongoService = mongoService;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("apply/{jobId}")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> Apply(string jobId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _context.JobSeekers
                .Include(js => js.User)
                .FirstOrDefaultAsync(js => js.UserId == userId);

            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            // Check if already applied
            var existingApplication = await _context.Applications
                .FirstOrDefaultAsync(a => a.JobSeekerId == jobSeeker.Id && a.JobListingId == jobId);

            if (existingApplication != null)
                return BadRequest("Bu ilana zaten başvurdunuz.");

            var application = new Application
            {
                JobSeekerId = jobSeeker.Id,
                JobListingId = jobId,
                AppliedAt = DateTime.UtcNow,
                Status = ApplicationStatus.Applied
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            // Notify Employer
            try 
            {
                var allJobs = await _mongoService.GetAllJobsAsync();
                var job = allJobs.FirstOrDefault(j => j.Id == jobId);
                
                if (job != null && job.EmployerId.HasValue)
                {
                    // FIXED: Get Employer record first, then User via Employer.UserId
                    var employer = await _context.Employers
                        .Include(e => e.User)
                        .FirstOrDefaultAsync(e => e.Id == job.EmployerId.Value);
                        
                    if (employer != null && employer.User != null && !string.IsNullOrEmpty(employer.User.Email))
                    {
                         var subject = $"Yeni Başvuru: {job.Title}";
                         var applicantName = $"{jobSeeker.User.FirstName} {jobSeeker.User.LastName}";
                         var body = $@"
                            <p>Sayın {employer.User.FirstName} {employer.User.LastName},</p>
                            <p><b>{job.Title}</b> ilanınıza <b>{applicantName}</b> tarafından yeni bir başvuru yapıldı.</p>
                            <p>Detayları görmek için panelinize giriş yapabilirsiniz.</p>
                            <p>CareerMatch Ekibi</p>
                         ";
                         await _emailService.SendEmailAsync(employer.User.Email, subject, body);

                         // Create In-App Notification
                         var notification = new Notification
                         {
                             UserId = employer.UserId, // Use employer's UserId, not EmployerId
                             Title = "Yeni Başvuru",
                             Message = $"{applicantName} ilanınıza başvurdu: {job.Title}",
                             Link = $"/dashboard/jobs/{job.Id}/applications",
                             Type = "Application",
                             CreatedAt = DateTime.UtcNow
                         };
                         _context.Notifications.Add(notification);
                         await _context.SaveChangesAsync();
                    }
                }
            } 
            catch (Exception ex)
            { 
                _logger.LogWarning(ex, "Failed to send notification for application to JobId: {JobId}", jobId);
            }

            return Ok(new { message = "Başvurunuz alındı." });
        }
        
        [HttpGet("stats")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> GetStats()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);

            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            // Get all applications
            var applications = await _context.Applications
                .Where(a => a.JobSeekerId == jobSeeker.Id)
                .ToListAsync();

            // Filter to only count applications for active jobs
            var allJobs = await _mongoService.GetAllJobsAsync();
            var activeApplications = applications.Count(app => 
            {
                var job = allJobs.FirstOrDefault(j => j.Id == app.JobListingId);
                return job != null && job.IsActive;
            });

            return Ok(new
            {
                ActiveApplications = activeApplications
            });
        }

        [HttpGet("my-applications")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> GetMyApplications()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId);

            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            var applications = await _context.Applications
                .Where(a => a.JobSeekerId == jobSeeker.Id)
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            var result = new List<object>();
            var allJobs = await _mongoService.GetAllJobsAsync();

            foreach (var app in applications)
            {
                var job = allJobs.FirstOrDefault(j => j.Id == app.JobListingId);
                
                // Show application even if job is deleted
                result.Add(new
                {
                    ApplicationId = app.Id,
                    JobId = app.JobListingId,
                    JobTitle = job?.Title ?? "[İlan Kaldırıldı]",
                    Company = job?.Company ?? "-",
                    Location = job?.Location ?? "-",
                    AppliedAt = app.AppliedAt,
                    Status = app.Status.ToString(),
                    IsJobDeleted = job == null
                });
            }

            return Ok(result);
        }
        
        [HttpGet("job/{jobId}")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> GetApplicants(string jobId)
        {
            // Security Check: Ensure Employer owns this job
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var job = await _mongoService.GetJobByIdAsync(jobId);
            if (job == null) return NotFound("İlan bulunamadı.");

            if (userRole == "Employer")
            {
               // 1. Get the Employer record for this User
               var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
               if (employer == null) return Forbid(); 

               // 2. Check if this Employer owns the job
               if (!job.EmployerId.HasValue || job.EmployerId.Value != employer.Id)
               {
                   return Forbid(); 
               }
            }

            var applications = await _context.Applications
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js.User)
                .Where(a => a.JobListingId == jobId)
                .ToListAsync();

            if (!applications.Any()) return Ok(new List<object>());

            var result = new List<object>();

            foreach (var app in applications)
            {
                var cv = await _mongoService.GetCvByUserIdAsync(app.JobSeeker.UserId);
                result.Add(new
                {
                    ApplicationId = app.Id,
                    AppliedAt = app.AppliedAt,
                    Status = app.Status.ToString(),
                    User = new {
                        Id = app.JobSeeker.User.Id,
                        app.JobSeeker.User.FirstName,
                        app.JobSeeker.User.LastName,
                        app.JobSeeker.User.Email
                    },
                    CvUrl = cv?.FilePath,
                    CvId = cv?.Id
                });
            }

            return Ok(result);
        }

        [HttpPost("{id}/mark-viewed")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> MarkViewed(int id)
        {
            var application = await _context.Applications
                .Include(a => a.JobSeeker).ThenInclude(js => js.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound("Başvuru bulunamadı.");

            // Update status to Viewed
            application.Status = ApplicationStatus.Viewed;

            // Fetch Job from Mongo to get Company/Title
            var allJobs = await _mongoService.GetAllJobsAsync();
            var job = allJobs.FirstOrDefault(j => j.Id == application.JobListingId);
            
            var jobTitle = job?.Title ?? "İş İlanı";
            var company = job?.Company ?? "CareerMatch";

            // Send Email
            var toEmail = application.JobSeeker.User.Email;
            var userName = $"{application.JobSeeker.User.FirstName} {application.JobSeeker.User.LastName}";
            
            var subject = $"CV'niz görüntülendi: {jobTitle}";
            var body = $@"
                <p>Sayın {userName},</p>
                <p><b>{company}</b> firması <b>{jobTitle}</b> pozisyonu için yaptığınız başvuruda CV'nizi görüntüledi.</p>
                <p>Başarılar dileriz,<br/>CareerMatch Ekibi</p>
            ";

            try {
                await _emailService.SendEmailAsync(toEmail, subject, body);
                
                // Create In-App Notification
                var notification = new Notification
                {
                    UserId = application.JobSeeker.UserId, // JobSeeker's User Id
                    Title = "CV Görüntülendi",
                    Message = $"{company} firması {jobTitle} başvurunuzu inceledi.",
                    Link = "/dashboard/jobs", // Or specific application detail if exists
                    Type = "Viewed",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

            } 
            catch (Exception ex)
            { 
                _logger.LogWarning(ex, "Failed to send 'viewed' notification for ApplicationId: {ApplicationId}", id);
            }

            return Ok(new { message = "Görüntülendi olarak işaretlendi." });
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> ApproveApplication(int id)
        {
            var application = await _context.Applications
                .Include(a => a.JobSeeker).ThenInclude(js => js.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound("Başvuru bulunamadı.");

            // Update status
            application.Status = ApplicationStatus.Accepted;
            
            // Get job details
            var allJobs = await _mongoService.GetAllJobsAsync();
            var job = allJobs.FirstOrDefault(j => j.Id == application.JobListingId);
            var jobTitle = job?.Title ?? "İş İlanı";
            var company = job?.Company ?? "CareerMatch";

            // Close the job posting (soft delete)
            if (job != null)
            {
                await _mongoService.SoftDeleteJobAsync(job.Id!);
            }

            // Reject all other applications for this job
            var otherApplications = await _context.Applications
                .Include(a => a.JobSeeker).ThenInclude(js => js.User)
                .Where(a => a.JobListingId == application.JobListingId && a.Id != id && a.Status == ApplicationStatus.Applied)
                .ToListAsync();

            foreach (var otherApp in otherApplications)
            {
                otherApp.Status = ApplicationStatus.Rejected;
                
                // Send rejection notification
                try
                {
                    var rejectionSubject = $"Başvuru Durumu: {jobTitle}";
                    var rejectionBody = $@"
                        <p>Merhaba {otherApp.JobSeeker.User.FirstName},</p>
                        <p><b>{company}</b> firmasının <b>{jobTitle}</b> pozisyonu için yaptığınız başvuru değerlendirilmiştir.</p>
                        <p>Maalesef bu pozisyon için başka bir aday ile devam edilmesine karar verilmiştir.</p>
                        <p>Başvurunuz için teşekkür ederiz. Başka fırsatlar için platformumuzu takip etmeye devam edin.</p>
                        <p>Saygılarımızla,<br/>CareerMatch Ekibi</p>
                    ";
                    await _emailService.SendEmailAsync(otherApp.JobSeeker.User.Email, rejectionSubject, rejectionBody);
                    
                    // In-app notification for rejection
                    var rejectionNotification = new Notification
                    {
                        UserId = otherApp.JobSeeker.UserId,
                        Title = "Başvuru Değerlendirildi",
                        Message = $"{company} - {jobTitle} pozisyonu için başka bir aday ile devam edilmiştir.",
                        Link = "/dashboard/my-applications",
                        Type = "Rejected",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Notifications.Add(rejectionNotification);
                }
                catch { /* Ignore notification errors */ }
            }

            await _context.SaveChangesAsync();

            // Send approval notification
            try
            {
                var toEmail = application.JobSeeker.User.Email;
                var userName = $"{application.JobSeeker.User.FirstName} {application.JobSeeker.User.LastName}";
                
                var subject = $"🎉 Başvurunuz Onaylandı: {jobTitle}";
                var body = $@"
                    <p>Tebrikler {userName},</p>
                    <p><b>{company}</b> firması <b>{jobTitle}</b> pozisyonu için yaptığınız başvurunuz onaylandı!</p>
                    <p>Firma sizinle iletişime geçecektir.</p>
                    <p>Başarılar dileriz,<br/>CareerMatch Ekibi</p>
                ";

                await _emailService.SendEmailAsync(toEmail, subject, body);
                
                // In-app notification
                var notification = new Notification
                {
                    UserId = application.JobSeeker.UserId,
                    Title = "Başvuru Onaylandı",
                    Message = $"🎉 {company} - {jobTitle} başvurunuz onaylandı!",
                    Link = "/dashboard/my-applications",
                    Type = "Approved",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            { 
                _logger.LogWarning(ex, "Failed to send approval/rejection notifications for ApplicationId: {ApplicationId}", id);
            }

            return Ok(new { message = "Başvuru onaylandı, ilan kapatıldı ve diğer başvurular reddedildi." });
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> RejectApplication(int id)
        {
            var application = await _context.Applications
                .Include(a => a.JobSeeker).ThenInclude(js => js.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound("Başvuru bulunamadı.");

            // Update status
            application.Status = ApplicationStatus.Rejected;
            await _context.SaveChangesAsync();

            // Get job details
            var allJobs = await _mongoService.GetAllJobsAsync();
            var job = allJobs.FirstOrDefault(j => j.Id == application.JobListingId);
            var jobTitle = job?.Title ?? "İş İlanı";
            var company = job?.Company ?? "CareerMatch";

            // Send notification
            try
            {
                var toEmail = application.JobSeeker.User.Email;
                var userName = $"{application.JobSeeker.User.FirstName} {application.JobSeeker.User.LastName}";
                
                var subject = $"Başvuru Durumu: {jobTitle}";
                var body = $@"
                    <p>Sayın {userName},</p>
                    <p><b>{company}</b> firması <b>{jobTitle}</b> pozisyonu için yaptığınız başvuru değerlendirilmiştir.</p>
                    <p>Ne yazık ki bu pozisyon için profiliniz uygun bulunmamıştır. Ancak sistemdeki diğer fırsatları incelemeye devam edebilirsiniz.</p>
                    <p>Başarılar dileriz,<br/>CareerMatch Ekibi</p>
                ";

                await _emailService.SendEmailAsync(toEmail, subject, body);
                
                // In-app notification
                var notification = new Notification
                {
                    UserId = application.JobSeeker.UserId,
                    Title = "Başvuru Durumu",
                    Message = $"{company} - {jobTitle} başvurunuz değerlendirildi.",
                    Link = "/dashboard/my-applications",
                    Type = "Rejected",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            { 
                _logger.LogWarning(ex, "Failed to send rejection notification for ApplicationId: {ApplicationId}", id);
            }

            return Ok(new { message = "Başvuru reddedildi." });
        }

        [HttpPut("{id}/withdraw")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> WithdrawApplication(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var jobSeeker = await _context.JobSeekers
                .Include(js => js.User)
                .FirstOrDefaultAsync(js => js.UserId == userId);

            if (jobSeeker == null) return NotFound("İş arayan profili bulunamadı.");

            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null) return NotFound("Başvuru bulunamadı.");
            
            // Validate ownership
            if (application.JobSeekerId != jobSeeker.Id) 
                return Forbid("Bu başvuruyu geri çekme yetkiniz yok.");
            
            // Can only withdraw pending applications
            if (application.Status != ApplicationStatus.Applied)
                return BadRequest("Sadece beklemedeki başvurular geri çekilebilir.");

            // Update status
            application.Status = ApplicationStatus.Withdrawn;
            await _context.SaveChangesAsync();

            // Get job details for notification
            var allJobs = await _mongoService.GetAllJobsAsync();
            var job = allJobs.FirstOrDefault(j => j.Id == application.JobListingId);
            var jobTitle = job?.Title ?? "İş İlanı";
            var company = job?.Company ?? "Firma";

            // Notify employer
            try
            {
                if (job != null && job.EmployerId.HasValue)
                {
                    var employer = await _context.Employers
                        .Include(e => e.User)
                        .FirstOrDefaultAsync(e => e.Id == job.EmployerId.Value);

                    if (employer != null && employer.User != null)
                    {
                        var applicantName = $"{jobSeeker.User.FirstName} {jobSeeker.User.LastName}";
                        
                        // Email to employer
                        var subject = $"Başvuru Geri Çekildi: {jobTitle}";
                        var body = $@"
                            <p>Sayın {employer.User.FirstName} {employer.User.LastName},</p>
                            <p><b>{jobTitle}</b> ilanınıza başvuru yapmış olan <b>{applicantName}</b> başvurusunu geri çekmiştir.</p>
                            <p>CareerMatch Ekibi</p>
                        ";
                        await _emailService.SendEmailAsync(employer.User.Email, subject, body);

                        // In-app notification for employer
                        var notification = new Notification
                        {
                            UserId = employer.UserId,
                            Title = "Başvuru Geri Çekildi",
                            Message = $"{applicantName} - {jobTitle} başvurusunu geri çekti.",
                            Link = $"/dashboard/jobs/{job.Id}/applications",
                            Type = "Application",
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            { 
                _logger.LogWarning(ex, "Failed to send withdrawal notification for ApplicationId: {ApplicationId}", id);
            }

            return Ok(new { message = "Başvuru geri çekildi." });
        }
    }
}

