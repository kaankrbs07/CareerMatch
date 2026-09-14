using CareerMatch.Data;
using CareerMatch.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CareerMatch.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20)
        {
            // Validate and sanitize parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 50) pageSize = 50; // Max 50 items per page

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var query = _context.Notifications
                .Where(n => n.UserId == userId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt);

            // Get total count for pagination metadata
            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Get paginated results
            var notifications = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                notifications,
                pagination = new
                {
                    currentPage = pageNumber,
                    pageSize,
                    totalCount,
                    totalPages,
                    hasNextPage = pageNumber < totalPages,
                    hasPreviousPage = pageNumber > 1
                }
            });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var count = await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead && n.IsActive);
            return Ok(new { count });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null) return NotFound();

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Marked as read" });
        }
        
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var unread = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (unread.Any())
            {
                foreach (var n in unread) n.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "All marked as read" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null) return NotFound();

            notification.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification deleted" });
        }

        [HttpGet("has-submitted-feedback")]
        [Authorize]
        public async Task<IActionResult> HasSubmittedFeedback()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var hasSubmitted = await _context.Feedbacks.AnyAsync(f => f.UserId == userId);
            return Ok(new { hasSubmitted });
        }

        [HttpPost("feedback")]
        [Authorize]
        public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null) return NotFound();

            // Check if user has already submitted feedback
            var existingFeedback = await _context.Feedbacks
                .AnyAsync(f => f.UserId == userId);
            
            if (existingFeedback)
            {
                return BadRequest(new { message = "Zaten geri bildirim gönderdiniz. Her kullanıcı yalnızca bir kez geri bildirim yapabilir." });
            }

            // ALWAYS save feedback to Feedbacks table
            var feedback = new Feedback
            {
                UserId = userId,
                Type = dto.Type,
                Message = dto.Message,
                Rating = dto.Rating,
                CreatedAt = DateTime.UtcNow
            };
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // OPTIONALLY also create notifications for admins (if any exist)
            try
            {
                var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
                if (adminRole != null)
                {
                    var admins = await _context.Admins
                        .Include(a => a.User)
                        .Where(a => a.User.RoleId == adminRole.Id)
                        .ToListAsync();

                    // Create notification for each admin
                    foreach (var admin in admins)
                    {
                        var notification = new Notification
                        {
                            UserId = admin.UserId,
                            Title = $"Yeni Geri Bildirim: {dto.Type}",
                            Message = $"{user.FirstName} {user.LastName} ({user.Email}): {dto.Message} | Puan: {dto.Rating}/5",
                            Type = "Feedback",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Notifications.Add(notification);
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                // Log but don't fail if notification creation fails
                Console.WriteLine($"Failed to create admin notifications: {ex.Message}");
            }

            return Ok(new { message = "Geri bildiriminiz kaydedildi." });
        }

        public record FeedbackDto(string Type, string Message, int Rating);
    }
}

