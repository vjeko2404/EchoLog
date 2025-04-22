using echolog.server.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace echolog.server.Data
{
    public static class Seed
    {
        public static void ApplyInitialSeed(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole { Id = 1, Name = "Admin" },
                new UserRole { Id = 2, Name = "User" },
                new UserRole { Id = 3, Name = "Observer" }
            );

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "admin",
                PasswordHash = "M3qgYDEQ1OmdTA3/24TK54YyFEiGizGtq5KTYdgvptQ=",
                RoleId = 1,
                CreatedAt = DateTime.UtcNow
            });

            modelBuilder.Entity<AppSetting>().HasData(new AppSetting
            {
                Id = 1,
                Key = "BackendPort",
                Value = "5000"
            });

            modelBuilder.Entity<ProjectType>().HasData(
                new ProjectType { Id = 1, Value = "System" },
                new ProjectType { Id = 2, Value = "Module" },
                new ProjectType { Id = 3, Value = "Device" },
                new ProjectType { Id = 4, Value = "Experiment" },
                new ProjectType { Id = 5, Value = "Rewrite" }
);

            modelBuilder.Entity<ProjectStatus>().HasData(
                new ProjectStatus { Id = 1, Value = "Active" },
                new ProjectStatus { Id = 2, Value = "Abandoned" },
                new ProjectStatus { Id = 3, Value = "Rewritten" },
                new ProjectStatus { Id = 4, Value = "Frozen" }
            );

        }
    }
}
