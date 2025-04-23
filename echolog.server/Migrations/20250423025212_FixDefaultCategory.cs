using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace echolog.server.Migrations
{
    /// <inheritdoc />
    public partial class FixDefaultCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 4, 23, 2, 52, 12, 591, DateTimeKind.Utc).AddTicks(3105));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 4, 23, 2, 35, 9, 28, DateTimeKind.Utc).AddTicks(6733));
        }
    }
}
