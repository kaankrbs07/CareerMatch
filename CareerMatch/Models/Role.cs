//Models/Role.cs

namespace CareerMatch.Models;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
