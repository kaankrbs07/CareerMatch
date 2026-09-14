using CareerMatch.Data;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MongoDB.Driver;

namespace CareerMatch.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IMongoService _mongoService;
        private readonly AppDbContext _db;

        public ChatController(IMongoService mongoService, AppDbContext db)
        {
            _mongoService = mongoService;
            _db = db;
        }

        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts()
        {
             var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
             if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

             var contactIds = await _mongoService.GetContactsAsync(userId);

             // Retrieve user details from SQL to display names
             var contacts = new List<object>();

             // Ideally, do a bulk fetch or optimize this. For now, loop or filter is okay for small scale.
             // We have Employers and JobSeekers. We don't know which ID belongs to whom solely by ID (unless we check both tables).
             // However, User IDs are unique if they come from the 'Users' table. 
             // We need to fetch from Users table.
             
             var users = await _db.Users
                 .Where(u => contactIds.Contains(u.Id))
                 .Select(u => new { 
                     u.Id, 
                     u.FirstName, 
                     u.LastName, 
                     Role = u.Role.Name 
                 })
                 .ToListAsync();

             return Ok(users);
        }

        [HttpGet("messages/{otherUserId}")]
        public async Task<IActionResult> GetMessages(int otherUserId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var messages = await _mongoService.GetConversationAsync(userId, otherUserId);
            
            // Mark messages as read where current user is the receiver
            await _mongoService.MarkMessagesAsReadAsync(userId, otherUserId);
            
            return Ok(messages);
        }

        [HttpPost("mark-read/{senderId}")]
        public async Task<IActionResult> MarkAsRead(int senderId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            await _mongoService.MarkMessagesAsReadAsync(userId, senderId);
            return Ok();
        }

        [HttpDelete("messages/{messageId}")]
        public async Task<IActionResult> DeleteMessage(string messageId)
        {
            // Ideally check ownership here. For simplicity, we assume logged in user can delete (or check later).
            // A more robust check would fetch message first, check SenderId == userId.
            
            // To be safe, let's just delete by ID for now. 
            // IMPROVEMENT: Fetch message and verify SenderId == userId before deleting.
            
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();
            
            var msg = await _mongoService.Cvs.Database.GetCollection<Models.Message>("Messages").Find(m => m.Id == messageId).FirstOrDefaultAsync();

            // Only allow deleting own messages? Or receiver too? Usually own.
            if (msg != null && msg.SenderId != userId) 
            {
                return Forbid();
            }

            await _mongoService.SoftDeleteMessageAsync(messageId);
            return Ok();
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var count = await _mongoService.GetUnreadMessageCountAsync(userId);
            return Ok(new { count });
        }
    }
}

