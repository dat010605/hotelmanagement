using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAuditLogSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "new_value",
                table: "Audit_Logs");

            migrationBuilder.RenameColumn(
                name: "old_value",
                table: "Audit_Logs",
                newName: "log_data");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Audit_Logs",
                newName: "log_date");

            migrationBuilder.AddColumn<int>(
                name: "ParentRoomId",
                table: "Rooms",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoomId",
                table: "Room_Images",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "role_name",
                table: "Audit_Logs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentRoomId",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "Room_Images");

            migrationBuilder.DropColumn(
                name: "role_name",
                table: "Audit_Logs");

            migrationBuilder.RenameColumn(
                name: "log_date",
                table: "Audit_Logs",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "log_data",
                table: "Audit_Logs",
                newName: "old_value");

            migrationBuilder.AddColumn<string>(
                name: "new_value",
                table: "Audit_Logs",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
