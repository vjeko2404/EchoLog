using Microsoft.EntityFrameworkCore;
using echolog.server.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace echolog.server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectDetail> ProjectDetails { get; set; }
        public DbSet<ProjectNote> ProjectNotes { get; set; }
        public DbSet<ProjectFile> ProjectFiles { get; set; }
        public DbSet<AppSetting> AppSettings { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ProjectType> ProjectTypes { get; set; }
        public DbSet<ProjectStatus> ProjectStatuses { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ProjectDetail 1:1
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Detail)
                .WithOne(d => d.Project)
                .HasForeignKey<ProjectDetail>(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProjectNotes 1:N
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Notes)
                .WithOne(n => n.Project)
                .HasForeignKey(n => n.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProjectFiles 1:N
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Files)
                .WithOne(f => f.Project)
                .HasForeignKey(f => f.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique Username
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Defer all seeding to external class
            Seed.ApplyInitialSeed(modelBuilder);
        }
    }
}
