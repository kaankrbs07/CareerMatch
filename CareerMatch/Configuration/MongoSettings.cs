namespace CareerMatch.Configuration
{
    public class MongoSettings
    {
        public required string ConnectionString { get; init; }
        public required string DatabaseName { get; init; }
    }
}
