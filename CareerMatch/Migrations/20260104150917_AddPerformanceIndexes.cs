using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareerMatch.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Notifications Table Indexes
            // Composite index for main query pattern (GetMyNotifications with pagination)
            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsActive_CreatedAt",
                table: "Notifications",
                columns: new[] { "UserId", "IsActive", "CreatedAt" });

            // Index for unread count query
            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead_IsActive",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "IsActive" });

            // Applications Table Indexes
            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobSeekerId_Status",
                table: "Applications",
                columns: new[] { "JobSeekerId", "Status" });

            // Note: JobListingId is a MongoDB ObjectId (string without max length)
            // Cannot create index on unlimited varchar. Skipping this index.

            // SavedJobs Table Indexes
            migrationBuilder.CreateIndex(
                name: "IX_SavedJobs_JobSeekerId_IsActive",
                table: "SavedJobs",
                columns: new[] { "JobSeekerId", "IsActive" });

            // Note: JobListingId is a MongoDB ObjectId (string without max length)
            // Cannot create index on unlimited varchar. Skipping this index.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop Notifications indexes
            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_IsActive_CreatedAt",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_IsRead_IsActive",
                table: "Notifications");

            // Drop Applications indexes
            migrationBuilder.DropIndex(
                name: "IX_Applications_JobSeekerId_Status",
                table: "Applications");

            // Drop SavedJobs indexes
            migrationBuilder.DropIndex(
                name: "IX_SavedJobs_JobSeekerId_IsActive",
                table: "SavedJobs");
        }
    }
}

