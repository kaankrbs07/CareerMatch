using CareerMatch.Data;
using CareerMatch.Models;
using CareerMatch.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerMatch.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var mongoService = scope.ServiceProvider.GetRequiredService<IMongoService>();

            // Ensure database is created
            await context.Database.EnsureCreatedAsync();
            
            // Run MongoDB Data Migration for Legacy Fields
            await mongoService.MigrateLegacyDataAsync();

            // Seed Roles
            if (!await context.Roles.AnyAsync())
            {
                using (var transaction = context.Database.BeginTransaction())
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Roles ON");
                    
                    var roles = new List<Role>
                    {
                        new Role { Id = 1, Name = "Admin", Users = new List<User>() },
                        new Role { Id = 2, Name = "Employer", Users = new List<User>() },
                        new Role { Id = 3, Name = "JobSeeker", Users = new List<User>() }
                    };
                    context.Roles.AddRange(roles);
                    await context.SaveChangesAsync();

                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Roles OFF");
                    await transaction.CommitAsync();
                }
            }



            // Seed Default Admin User
            if (!await context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == "admin@CareerMatch.com"))
            {
                var adminUser = new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@CareerMatch.com",
                    Password = "AdminPassword123!", 
                    RoleId = 1, // Admin Role
                    IsActive = true,
                    IsVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();

                var adminEntity = new Admin
                {
                    UserId = adminUser.Id,
                    Description = "Default System Administrator",
                    CreatedAt = DateTime.UtcNow
                };

                context.Admins.Add(adminEntity);
                await context.SaveChangesAsync();
            }
        }
    }
}

