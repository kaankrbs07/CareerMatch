using MongoDB.Driver;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;

namespace CareerMatch.Services.Implementations
{
    public class MongoService : IMongoService
    {
        private readonly IMongoDatabase _database;
        private readonly ILogger<MongoService> _logger;
        private readonly IMongoCollection<MongoCv> _collectionCv;
        private readonly IMongoCollection<JobListing> _collectionJob;
        private readonly IMongoCollection<Models.Message> _collectionMessage;

        public MongoService(IMongoDatabase database, ILogger<MongoService> logger)
        {
            _database = database ?? throw new ArgumentNullException(nameof(database));
            _logger = logger;
            _collectionCv = _database.GetCollection<MongoCv>("cv");
            _collectionJob = _database.GetCollection<JobListing>("jobs");
            _collectionMessage = _database.GetCollection<Models.Message>("Messages");

            CreateIndexes();
        }





        private void CreateIndexes()
        {
            var jobIndexKeys = Builders<JobListing>.IndexKeys
                .Ascending(j => j.Title)
                .Ascending(j => j.Company)
                .Ascending(j => j.Location);
            _collectionJob.Indexes.CreateOne(new CreateIndexModel<JobListing>(jobIndexKeys));

            var messageIndexKeys = Builders<Models.Message>.IndexKeys
                .Ascending(m => m.SenderId)
                .Ascending(m => m.ReceiverId)
                .Ascending(m => m.Timestamp);
            _collectionMessage.Indexes.CreateOne(new CreateIndexModel<Models.Message>(messageIndexKeys));
        }

        public IMongoCollection<MongoCv> Cvs => _collectionCv;

        public async Task<MongoCv?> GetCvByUserIdAsync(int userId)
        {
             return await _collectionCv.Find(x => x.UserId == userId).FirstOrDefaultAsync();
        }

        // Finds a CV by its Id
        public async Task<MongoCv?> findCvAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentNullException(nameof(id), "Id must be provided.");
            }

            try
            {
                var byId = await _collectionCv.Find(x => x.Id == id).FirstOrDefaultAsync();
                if (byId != null)
                {
                    _logger?.LogDebug("Found document by Id property.");
                    return byId;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while searching by Id.");
            }

            _logger?.LogInformation("No CV found matching provided identifiers.");
            return null;
        }

        public async Task<List<MongoCv>> GetAllCvsAsync()
        {
            return await _collectionCv.Find(_ => true).ToListAsync();
        }

        public async Task InsertCv(MongoCv cv)
        {
            if (cv == null) throw new ArgumentNullException(nameof(cv));
            await _collectionCv.InsertOneAsync(cv);
        }

        public async Task RemoveCv(MongoCv cv)
        {
            if (cv == null) throw new ArgumentNullException(nameof(cv));
            if (string.IsNullOrEmpty(cv.Id))
                throw new ArgumentException("Id is required to remove a document", nameof(cv));

            await _collectionCv.DeleteOneAsync(x => x.Id == cv.Id);
        }

        public async Task<List<JobListing>> GetAllJobsAsync() => await _collectionJob.Find(j => j.IsActive == true).ToListAsync();

        public async Task<(List<JobListing> Jobs, long TotalCount)> SearchJobsAsync(string? keyword, string? location, string? jobType, string? currency, double? minSalary, double? maxSalary, int pageNumber = 1, int pageSize = 10)
        {
            var builder = Builders<JobListing>.Filter;
            // Filter by IsActive = true
            var filter = builder.Eq(x => x.IsActive, true);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var keywordFilter = builder.Regex(x => x.Title, new MongoDB.Bson.BsonRegularExpression(keyword, "i")) |
                                    builder.Regex(x => x.Description, new MongoDB.Bson.BsonRegularExpression(keyword, "i")) |
                                    builder.Regex(x => x.Skills, new MongoDB.Bson.BsonRegularExpression(keyword, "i")) |
                                    builder.Regex(x => x.Company, new MongoDB.Bson.BsonRegularExpression(keyword, "i"));
                filter &= keywordFilter;
            }

            if (!string.IsNullOrWhiteSpace(location))
            {
                filter &= builder.Regex(x => x.Location, new MongoDB.Bson.BsonRegularExpression(location, "i"));
            }

            if (!string.IsNullOrWhiteSpace(jobType))
            {
                filter &= builder.Eq(x => x.JobType, jobType); // Exact match for job type
            }

            if (!string.IsNullOrWhiteSpace(currency))
            {
                filter &= builder.Eq(x => x.Currency, currency);
            }

            if (minSalary.HasValue)
            {
                filter &= builder.Gte(x => x.MaxAmount, minSalary.Value); // Or checks if salary range overlaps
            }
             
            if (maxSalary.HasValue)
            {
                 filter &= builder.Lte(x => x.MinAmount, maxSalary.Value);
            }

            // Turkish collation for case-insensitive search with Turkish characters
            var collation = new Collation("tr", strength: CollationStrength.Secondary);

            var totalCount = await _collectionJob.CountDocumentsAsync(filter, new CountOptions { Collation = collation });
            
            var findOptions = new FindOptions
            {
                Collation = collation
            };

            var jobs = await _collectionJob.Find(filter, findOptions)
                .Skip((pageNumber - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (jobs, totalCount);
        }

        public async Task<List<JobListing>> GetJobsByIdsAsync(List<string> ids)
        {
            if (ids == null || !ids.Any()) return new List<JobListing>();
            var filter = Builders<JobListing>.Filter.In(x => x.Id, ids);
            return await _collectionJob.Find(filter).ToListAsync();
        }

        public async Task<JobListing?> GetJobByIdAsync(string id) => 
            await _collectionJob.Find(j => j.Id == id).FirstOrDefaultAsync();

        public async Task InsertJob(JobListing job)
        {
            if (job == null) throw new ArgumentNullException(nameof(job));
            job.IsActive = true; // Ensure active on insert
            await _collectionJob.InsertOneAsync(job);
        }

        public async Task RemoveJob(JobListing job)
        {
            if (job == null) throw new ArgumentNullException(nameof(job));
            if (string.IsNullOrEmpty(job.Id))
                throw new ArgumentException("Id is required to remove a job", nameof(job));
            
            // Physical delete if needed, but usually we use SoftDelete now. 
            // Keeping this for admin "Hard Delete" scenarios if any.
            await _collectionJob.DeleteOneAsync(j => j.Id == job.Id);
        }

        public async Task SoftDeleteJobAsync(string id)
        {
            var filter = Builders<JobListing>.Filter.Eq(j => j.Id, id);
            var update = Builders<JobListing>.Update
                .Set(j => j.IsActive, false); // Deactivate
            await _collectionJob.UpdateOneAsync(filter, update);
        }

        public async Task DeleteCvByUserIdAsync(int userId)
        {
             await _collectionCv.DeleteManyAsync(x => x.UserId == userId);
        }

        public async Task SaveMessageAsync(Message message)
        {
            message.IsActive = true;
            await _collectionMessage.InsertOneAsync(message);
        }

        public async Task<List<Message>> GetConversationAsync(int userId1, int userId2)
        {
            var filter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Or(
                    Builders<Message>.Filter.And(
                        Builders<Message>.Filter.Eq(m => m.SenderId, userId1),
                        Builders<Message>.Filter.Eq(m => m.ReceiverId, userId2)
                    ),
                    Builders<Message>.Filter.And(
                        Builders<Message>.Filter.Eq(m => m.SenderId, userId2),
                        Builders<Message>.Filter.Eq(m => m.ReceiverId, userId1)
                    )
                ),
                Builders<Message>.Filter.Eq(m => m.IsActive, true) // Filter active messages
            );
            return await _collectionMessage.Find(filter).SortBy(m => m.Timestamp).ToListAsync();
        }

        public async Task SoftDeleteMessageAsync(string messageId)
        {
             var filter = Builders<Message>.Filter.Eq(m => m.Id, messageId);
             var update = Builders<Message>.Update.Set(m => m.IsActive, false); // Deactivate
             await _collectionMessage.UpdateOneAsync(filter, update);
        }

        public async Task MarkMessagesAsReadAsync(int receiverId, int senderId)
        {
            var filter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Eq(m => m.ReceiverId, receiverId),
                Builders<Message>.Filter.Eq(m => m.SenderId, senderId),
                Builders<Message>.Filter.Eq(m => m.IsRead, false)
            );

            var update = Builders<Message>.Update.Set(m => m.IsRead, true);

            await _collectionMessage.UpdateManyAsync(filter, update);
        }

        public async Task<long> GetUnreadMessageCountAsync(int userId)
        {
            var filter = Builders<Message>.Filter.And(
                Builders<Message>.Filter.Eq(m => m.ReceiverId, userId),
                Builders<Message>.Filter.Eq(m => m.IsRead, false),
                Builders<Message>.Filter.Eq(m => m.IsActive, true) // Only count active messages
            );
            return await _collectionMessage.CountDocumentsAsync(filter);
        }

        public async Task<List<int>> GetContactsAsync(int userId)
        {
            var filter = Builders<Message>.Filter.Or(
                Builders<Message>.Filter.Eq(m => m.SenderId, userId),
                Builders<Message>.Filter.Eq(m => m.ReceiverId, userId)
            );

            var messages = await _collectionMessage.Find(filter).ToListAsync();
            
            var sentTo = messages.Where(m => m.SenderId == userId).Select(m => m.ReceiverId);
            var receivedFrom = messages.Where(m => m.ReceiverId == userId).Select(m => m.SenderId);
            
            return sentTo.Concat(receivedFrom).Distinct().ToList();
        }
        public async Task MigrateLegacyDataAsync()
        {
            // 1. JobListing Migration
            // First: Mark IsDeleted=true as IsActive=false
            var jobDeletedFilter = Builders<JobListing>.Filter.Eq("IsDeleted", true);
            var jobDeletedUpdate = Builders<JobListing>.Update
                .Set(j => j.IsActive, false)
                .Unset("IsDeleted")
                .Unset("DeletedAt");
            await _collectionJob.UpdateManyAsync(jobDeletedFilter, jobDeletedUpdate);

            // Second: Ensure all documents without IsActive field get IsActive=true
            var jobMissingActiveFilter = Builders<JobListing>.Filter.Exists("IsActive", false);
            var jobActiveUpdate = Builders<JobListing>.Update
                .Set(j => j.IsActive, true)
                .Unset("IsDeleted")
                .Unset("DeletedAt");
            await _collectionJob.UpdateManyAsync(jobMissingActiveFilter, jobActiveUpdate);
            
            // 2. Message Migration
            // First: Mark IsDeleted=true as IsActive=false
            var msgDeletedFilter = Builders<Message>.Filter.Eq("IsDeleted", true);
            var msgDeletedUpdate = Builders<Message>.Update
                .Set(m => m.IsActive, false)
                .Unset("IsDeleted");
            await _collectionMessage.UpdateManyAsync(msgDeletedFilter, msgDeletedUpdate);

            // Second: Ensure all messages without IsActive field get IsActive=true
            var msgMissingActiveFilter = Builders<Message>.Filter.Exists("IsActive", false);
            var msgActiveUpdate = Builders<Message>.Update
                .Set(m => m.IsActive, true)
                .Unset("IsDeleted");
            await _collectionMessage.UpdateManyAsync(msgMissingActiveFilter, msgActiveUpdate);

            // 3. CV Migration (ensure all CVs have IsActive=true)
            var cvMissingActiveFilter = Builders<MongoCv>.Filter.Exists("IsActive", false);
            var cvActiveUpdate = Builders<MongoCv>.Update.Set(cv => cv.IsActive, true);
            await _collectionCv.UpdateManyAsync(cvMissingActiveFilter, cvActiveUpdate);
        }
    }
}

