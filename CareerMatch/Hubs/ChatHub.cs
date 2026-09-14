using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace CareerMatch.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMongoService _mongoService;
        // Map UserId to ConnectionId
        private static readonly ConcurrentDictionary<int, string> _userConnections = new();

        public ChatHub(IMongoService mongoService)
        {
            _mongoService = mongoService;
        }

        public override Task OnConnectedAsync()
        {
            if (Context.User != null)
            {
                var userIdStr = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdStr != null && int.TryParse(userIdStr, out int userId))
                {
                    _userConnections[userId] = Context.ConnectionId;
                }
            }
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            if (Context.User != null)
            {
                var userIdStr = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdStr != null && int.TryParse(userIdStr, out int userId))
                {
                    _userConnections.TryRemove(userId, out _);
                }
            }
            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(int receiverId, string content)
        {
            if (Context.User == null) return;
            var senderIdStr = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (senderIdStr == null || !int.TryParse(senderIdStr, out int senderId)) return;

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                Timestamp = DateTime.UtcNow
            };

            // Save to DB
            await _mongoService.SaveMessageAsync(message);

            // Send to receiver if connected
            if (_userConnections.TryGetValue(receiverId, out string? connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
            }
            
            // Also send back to sender so their UI updates cleanly (or they can just append locally)
            await Clients.Caller.SendAsync("ReceiveMessage", message);
        }
    }
}

