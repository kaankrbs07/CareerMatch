using CareerMatch.Data;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using System.Security.Claims;

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MatchesController : ControllerBase
    {
        private readonly IAiClient _aiClient;
        private readonly IMongoService _mongoService;
        private readonly AppDbContext _dbContext;
        private readonly IUserService _userService;
        private readonly ILogger<MatchesController> _logger;

        public MatchesController(
            IAiClient aiClient,
            IMongoService mongoService,
            AppDbContext dbContext,
            IUserService userService,
            ILogger<MatchesController> logger)
        {
            _aiClient = aiClient;
            _mongoService = mongoService;
            _dbContext = dbContext;
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Adayın (Logon User) CV'sine uygun iş ilanlarını önerir.
        /// </summary>
        [HttpGet("recommend-jobs")]
        [Authorize(Roles = "JobSeeker,Admin")]
        public async Task<IActionResult> RecommendJobs([FromQuery] int topK = 10)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                // 1. Adayın CV verisini al (Mongo)
                var cv = await _mongoService.GetCvByUserIdAsync(userId);
                if (cv == null || string.IsNullOrWhiteSpace(cv.ResumeText))
                {
                    return BadRequest("CV bulunamadı veya işlenebilir metin içermiyor.");
                }

                // 2. Aktif iş ilanlarını al (Mongo)
                var allJobs = await _mongoService.GetAllJobsAsync();
                
                // Filtreleme: ExpirationDate
                var activeJobs = allJobs
                    .Where(j => j.ExpirationDate == null || j.ExpirationDate > DateTime.UtcNow)
                    .Take(500)
                    .ToList();
                
                if (!activeJobs.Any())
                {
                    return Ok(new List<object>()); // İş ilanı yok
                }

                // 3. AI eşleştirme için verileri hazırla
                var candidates = activeJobs.Select(j => new AiMatchCandidate(
                    id: j.Id?.ToString() ?? "",
                    text: $"{j.Title} {j.Description} {j.Skills} {j.Company}",
                    tags: !string.IsNullOrEmpty(j.Skills)
                        ? j.Skills.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(s => s.Trim())
                                .Where(s => s.Length > 0)
                                .ToList()
                        : new List<string>()
                )).ToList();

                // 4. AI Servisine gönder
                var matchResult = await _aiClient.MatchAsync(cv.ResumeText, candidates, topK);

                // 5. Sonuçları zenginleştir (Job detaylarını ekle)
                var enrichedResults = matchResult.results.Select(m =>
                {
                    var job = activeJobs.FirstOrDefault(j => j.Id == m.id);
                    return new
                    {
                        Job = job,
                        Score = m.score,
                        Details = m 
                    };
                }).ToList();

                return Ok(enrichedResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RecommendJobs hatası");
                return StatusCode(500, "Eşleştirme sırasında bir hata oluştu.");
            }
        }

        /// <summary>
        /// Belirli bir iş ilanı için en uygun adayları bulur.
        /// </summary>
        [HttpGet("find-candidates/{jobId}")]
        [Authorize(Roles = "Employer,Admin")]
        public async Task<IActionResult> FindCandidates(string jobId, [FromQuery] int topK = 10) // ObjectId string
        {
            try
            {
                // 1. İş ilanını bul (Mongo)
                // MongoService'de tek job getirme metodu yok ama GetAllJobsAsync'ten filtreleyebiliriz veya yeni metot ekleyebiliriz.
                // Şimdilik GetAllJobsAsync kullanıp bellek içinde filtreleyelim (Daha sonra optimize edilebilir).
                // VEYA MongoService'e GetJobById ekleyebiliriz. Şimdilik hızlı çözüm:
                var allJobs = await _mongoService.GetAllJobsAsync();
                var job = allJobs.FirstOrDefault(j => j.Id == jobId);
                
                if (job == null)
                {
                    return NotFound("İş ilanı bulunamadı.");
                }

                var jobText = $"{job.Title} {job.Description} {job.JobFunction} {job.Skills}";

                // 2. Tüm CV'leri getir (Mongo)
                var allCvs = await _mongoService.GetAllCvsAsync();
                
                // Enforce one CV per User (latest)
                var validCvs = allCvs
                    .Where(c => !string.IsNullOrWhiteSpace(c.ResumeText))
                    .GroupBy(c => c.UserId)
                    .Select(g => g.OrderByDescending(c => c.CreatedAt).First())
                    .ToList();

                if (!validCvs.Any())
                {
                    return Ok(new List<object>());
                }

                // 3. AI eşleştirme için verileri hazırla
                var candidateDocs = validCvs.Select(c => new AiMatchCandidate(
                    id: c.UserId.ToString(), 
                    text: c.ResumeText!,
                    tags: new List<string>() 
                )).ToList();

                // 4. AI Servisine gönder
                var matchResult = await _aiClient.MatchAsync(jobText, candidateDocs, topK);

                // 5. User detaylarını SQL'den çekip zenginleştir
                var userIds = matchResult.results.Select(r => int.Parse(r.id)).Distinct().ToList();
                var users = await _dbContext.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id);

                // Create Dictionary for CV lookup
                var cvsByUserId = validCvs.ToDictionary(c => c.UserId);

                var enrichedResults = matchResult.results.Select(m =>
                {
                    int.TryParse(m.id, out int uid);
                    var user = users.ContainsKey(uid) ? users[uid] : null;
                    var cv = cvsByUserId.ContainsKey(uid) ? cvsByUserId[uid] : null;

                    return new
                    {
                        User = user, 
                        Score = m.score,
                        Details = m,
                        CvUrl = cv?.FilePath,
                        CvId = cv?.Id
                    };
                }).ToList();

                return Ok(enrichedResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FindCandidates hatası");
                return StatusCode(500, "Eşleştirme sırasında bir hata oluştu.");
            }
        }
    }
}

