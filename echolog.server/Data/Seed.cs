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
                PasswordHash = "$2a$12$Uohw69joY3ac1DWKqD.wEuTp00Z4Y3a78HtEqYHraAwLPKdzcmHwm",
                RoleId = 1,
                CreatedAt = DateTime.UtcNow
            });

            modelBuilder.Entity<AppSetting>().HasData(
                new AppSetting
                {
                    Id = 1,
                    Key = "BackendPort",
                    Value = "5000"
                },
                new AppSetting
                {
                    Id = 2,
                    Key = "DatabasePath",
                    Value = Path.Combine(AppContext.BaseDirectory, "echolog.db").Replace("\\", "/")
                }
            );


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
                new ProjectStatus { Id = 4, Value = "Frozen" },
                new ProjectStatus { Id = 5, Value = "Completed" }
            );

            modelBuilder.Entity<ProjectFileCategory>().HasData(
                new ProjectFileCategory { Id = 1, Name = "Documentation" },
                new ProjectFileCategory { Id = 2, Name = "Screenshots" },
                new ProjectFileCategory { Id = 3, Name = "Source" },
                new ProjectFileCategory { Id = 4, Name = "Builds" },
                new ProjectFileCategory { Id = 5, Name = "Other" }
            );

            modelBuilder.Entity<Project>().HasData(
            new Project
            {
                Id = 1,
                Title = "E-Ink Dashboard",
                ShortDescription = "Low-power ESP32 weather + stats panel",
                TypeId = 3,        // Device
                StatusId = 1,      // Active
                OwnerId = 1,       // admin
                CreatedAt = new DateTime(2024, 01, 10, 12, 0, 0),
                UpdatedAt = null
            },

            new Project
            {
                Id = 2,
                Title = "XJR ECU Hack",
                ShortDescription = "CAN-bus spoofing for vintage Yamaha",
                TypeId = 2,        // Module
                StatusId = 2,      // Abandoned
                OwnerId = 1,
                CreatedAt = new DateTime(2024, 02, 20, 8, 30, 0),
                UpdatedAt = null
            },

            new Project
            {
                Id = 3,
                Title = "VeronicaX Frontend",
                ShortDescription = "RBAC + dashboard + detail view (React)",
                TypeId = 1,        // System
                StatusId = 1,
                OwnerId = 1,
                CreatedAt = new DateTime(2024, 04, 01, 17, 45, 0),
                UpdatedAt = null
            }
            );

        }
    }
}
