using MongoDB.Bson.Serialization.Attributes;

namespace CareerMatch.Models
{
    public class MongoCv
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }

        public int UserId { get; set; } // Link to MSSQL User
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        
        // Extracted text from the resume
        public string? ResumeText { get; set; } 
        
        // Use this if you want to store the HTML representation or the raw file location
        public string? ResumeHtml { get; set; }
        public string? FilePath { get; set; } 

        public string? Category { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}

