using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameDataService.Migrations
{
    /// <inheritdoc />
    public partial class addadmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash" },
                values: new object[] { 1234, "admin@gmail.com", "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1234);
        }
    }
}
