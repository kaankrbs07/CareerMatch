using CareerMatch.Data;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "JobSeeker")]
public class CvController : ControllerBase {
  private readonly IMongoService _mongoService; // Changed from AppDbContext
  private readonly ITextExtractionService _extractor;

  public CvController(IMongoService mongoService, ITextExtractionService extractor) {
    _mongoService = mongoService; 
    _extractor = extractor;
  }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file) {
        if (file == null || file.Length == 0) return BadRequest("Dosya yok.");
        
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // 0. Check for existing CV and clean up
        var existingCv = await _mongoService.GetCvByUserIdAsync(userId);
        if (existingCv != null)
        {
            // Delete old file if exists
            if (!string.IsNullOrEmpty(existingCv.FilePath))
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", existingCv.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(oldFilePath))
                {
                    try { System.IO.File.Delete(oldFilePath); } catch {}
                }
            }
            // Delete old record
            await _mongoService.DeleteCvByUserIdAsync(userId);
        }

        // 1. Save new file to disk
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cvs");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        // Make unique filename
        var uniqueFileName = $"{userId}_{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 2. Extract text
        var text = await _extractor.ExtractTextAsync(file);

        // 3. Save to Mongo
        var cv = new MongoCv {
            UserId = userId,
            FileName = file.FileName,
            ContentType = file.ContentType ?? "application/octet-stream",
            ResumeText = text,
            FilePath = $"/uploads/cvs/{uniqueFileName}", // Store relative web path
            CreatedAt = DateTime.UtcNow
        };

        await _mongoService.InsertCv(cv);
        
        // Return URL for immediate display
        return Ok(new { cvId = cv.Id, chars = text.Length, url = cv.FilePath });
    }

    [HttpGet("my-latest")]
    public async Task<IActionResult> GetMyLatestCv()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var allCvs = await _mongoService.GetAllCvsAsync();
        var cv = allCvs
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefault();
        
        if (cv == null) return NotFound("Henüz CV yüklemediniz.");
        
        return Ok(new { 
            cvId = cv.Id, 
            fileName = cv.FileName, 
            uploadedAt = cv.CreatedAt,
            url = cv.FilePath // Return the stored URL
        });
    }
}
