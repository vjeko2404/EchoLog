using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace echolog.server.Migrations
{
    /// <inheritdoc />
    public partial class SeedProjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "CreatedAt", "OwnerId", "ShortDescription", "StatusId", "Title", "TypeId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 10, 12, 0, 0, 0, DateTimeKind.Unspecified), 1, "Low-power ESP32 weather + stats panel", 1, "E-Ink Dashboard", 3, null },
                    { 2, new DateTime(2024, 2, 20, 8, 30, 0, 0, DateTimeKind.Unspecified), 1, "CAN-bus spoofing for vintage Yamaha", 2, "XJR ECU Hack", 2, null },
                    { 3, new DateTime(2024, 4, 1, 17, 45, 0, 0, DateTimeKind.Unspecified), 1, "RBAC + dashboard + detail view (React)", 1, "VeronicaX Frontend", 1, null }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 4, 22, 22, 56, 13, 176, DateTimeKind.Utc).AddTicks(1141), "$2a$12$Uohw69joY3ac1DWKqD.wEuTp00Z4Y3a78HtEqYHraAwLPKdzcmHwm" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Projects",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 4, 22, 20, 1, 35, 185, DateTimeKind.Utc).AddTicks(4375), "$2a$11$TMy8JX.Lh7Weh1nRZMdDDubpoDLe3N7O06pCk0yFcYWRdKlV3aTfK" });
        }
    }
}
