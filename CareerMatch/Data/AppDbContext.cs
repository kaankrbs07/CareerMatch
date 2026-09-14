// Data/AppDbContext.cs

using CareerMatch.Models; 
using Microsoft.EntityFrameworkCore;

namespace CareerMatch.Data
{
    public class AppDbContext : DbContext
    {  
        
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        
        // DbSet, veritabanýnýzdaki bir tabloyu temsil eder.
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Employer> Employers { get; set; }
        public DbSet<JobSeeker> JobSeekers { get; set; }
        public DbSet<Industry> Industries { get; set; }
        public DbSet<Occupation> Occupations { get; set; }
        public DbSet<EducationLevel> EducationLevels { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<SavedJob> SavedJobs { get; set; }




        
        //  Veritabaný Kurallarýný (Constraints) Yapýlandýrma
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Users tablosu için kurallar
            modelBuilder.Entity<User>(entity =>
            {
                // Email sütunu 'UNIQUE' olmalý
                entity.HasIndex(u => u.Email).IsUnique();
                
                // Map RoleId property to 'Role' column
                entity.Property(u => u.RoleId).HasColumnName("Role");
            });

            // Roles tablosu için kurallar
            modelBuilder.Entity<Role>(entity =>
            {
                // Name sütunu 'UNIQUE' olmalý
                entity.HasIndex(r => r.Name).IsUnique();
            });

            // Employers tablosu için kurallar
            modelBuilder.Entity<Employer>(entity =>
            {
                // CompanyName sütunu 'UNIQUE' olmalý
                entity.HasIndex(e => e.CompanyName).IsUnique();
                
                // Email sütunu 'UNIQUE' olmalý
                entity.HasIndex(e => e.Email).IsUnique();
                
                // UserId (1-1 iliþki) 'UNIQUE' olmalý
                entity.HasIndex(e => e.UserId).IsUnique();
            });
            
            // JobSeekers tablosu için kurallar
            modelBuilder.Entity<JobSeeker>(entity =>
            {
                // UserId (1-1 iliþki) 'UNIQUE' olmalý
                entity.HasIndex(js => js.UserId).IsUnique();
            });

            // Admins tablosu için kurallar
            modelBuilder.Entity<Admin>(entity =>
            {
                // UserId (1-1 iliþki) 'UNIQUE' olmalý
                entity.HasIndex(a => a.UserId).IsUnique();
            });

            // Industries tablosu için kurallar
            modelBuilder.Entity<Industry>(entity =>
            {
                // Name sütunu 'UNIQUE' olmalý
                entity.HasIndex(i => i.Name).IsUnique();
            });
            
            // Occupations tablosu için kurallar
            modelBuilder.Entity<Occupation>(entity =>
            {
                // Name sütunu 'UNIQUE' olmalý
                entity.HasIndex(o => o.Name).IsUnique();
            });
            
            // EducationLevels tablosu için kurallar
            modelBuilder.Entity<EducationLevel>(entity =>
            {
                // Name sütunu 'UNIQUE' olmalý
                entity.HasIndex(el => el.Name).IsUnique();
            });

            // Notifications tablosu için kurallar
            modelBuilder.Entity<Notification>(entity =>
            {
                // UserId foreign key relationship
                entity.HasOne(n => n.User)
                    .WithMany()
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Global Query Filters for IsActive Deactivation
            // User filter removed to avoid navigation warnings - handle IsActive check manually where needed
            modelBuilder.Entity<Industry>().HasQueryFilter(e => e.IsActive);
            modelBuilder.Entity<Occupation>().HasQueryFilter(e => e.IsActive);
        }
    }
}
