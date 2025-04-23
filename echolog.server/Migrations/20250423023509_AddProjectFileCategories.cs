using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace echolog.server.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectFileCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "ProjectFiles",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ProjectFileCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectFileCategories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ProjectFileCategories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Documentation" },
                    { 2, "Screenshots" },
                    { 3, "Source" },
                    { 4, "Builds" },
                    { 5, "Other" }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 4, 23, 2, 35, 9, 28, DateTimeKind.Utc).AddTicks(6733));

            migrationBuilder.CreateIndex(
                name: "IX_ProjectFiles_CategoryId",
                table: "ProjectFiles",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectFileCategories_Name",
                table: "ProjectFileCategories",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectFiles_ProjectFileCategories_CategoryId",
                table: "ProjectFiles",
                column: "CategoryId",
                principalTable: "ProjectFileCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectFiles_ProjectFileCategories_CategoryId",
                table: "ProjectFiles");

            migrationBuilder.DropTable(
                name: "ProjectFileCategories");

            migrationBuilder.DropIndex(
                name: "IX_ProjectFiles_CategoryId",
                table: "ProjectFiles");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "ProjectFiles");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 4, 22, 22, 56, 13, 176, DateTimeKind.Utc).AddTicks(1141));
        }
    }
}
