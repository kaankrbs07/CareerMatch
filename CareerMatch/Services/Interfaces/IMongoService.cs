using CareerMatch.Models;
using MongoDB.Driver;

namespace CareerMatch.Services.Interfaces
{
    public interface IMongoService
    {
        Task<List<Models.MongoCv>> GetAllCvsAsync();
        Task<Models.MongoCv?> findCvAsync(string id);
        Task<Models.MongoCv?> GetCvByUserIdAsync(int userId);

        IMongoCollection<MongoCv> Cvs { get; }

        Task InsertCv(MongoCv cv);
        Task RemoveCv(MongoCv cv);
        
        Task<List<Models.JobListing>> GetAllJobsAsync();
        Task<(List<Models.JobListing> Jobs, long TotalCount)> SearchJobsAsync(string? keyword, string? location, string? jobType, string? currency, double? minSalary, double? maxSalary, int pageNumber = 1, int pageSize = 10);
        Task<List<Models.JobListing>> GetJobsByIdsAsync(List<string> ids);
        Task<Models.JobListing?> GetJobByIdAsync(string id);
        Task InsertJob(JobListing job);
        Task RemoveJob(JobListing job);
        Task SoftDeleteJobAsync(string id);


        // Messaging
        Task SaveMessageAsync(Message message);
        Task<List<Message>> GetConversationAsync(int userId1, int userId2);
        Task MarkMessagesAsReadAsync(int receiverId, int senderId);
        Task<long> GetUnreadMessageCountAsync(int userId);
        Task SoftDeleteMessageAsync(string messageId);
        Task<List<int>> GetContactsAsync(int userId);
        Task DeleteCvByUserIdAsync(int userId);
        Task MigrateLegacyDataAsync();
    }
}

