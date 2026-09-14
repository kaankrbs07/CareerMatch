namespace CareerMatch.Dtos
{
    public record UserDto
    {
        public int Id { get; init; }
        public required string Email { get; init; }
        public required string FirstName { get; init; }
        public required string LastName { get; init; }
        public required string RoleName { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
