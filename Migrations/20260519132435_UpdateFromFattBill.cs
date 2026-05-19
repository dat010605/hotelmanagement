using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFromFattBill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<int>(
                name: "room_type_id",
                table: "Vouchers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "Loss_And_Damages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "action",
                table: "Audit_Logs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "new_value",
                table: "Audit_Logs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "record_id",
                table: "Audit_Logs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "table_name",
                table: "Audit_Logs",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_room_type_id",
                table: "Vouchers",
                column: "room_type_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Vouchers_RoomTypes",
                table: "Vouchers",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vouchers_RoomTypes",
                table: "Vouchers");

            migrationBuilder.DropIndex(
                name: "IX_Vouchers_room_type_id",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "room_type_id",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "status",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "action",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "new_value",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "record_id",
                table: "Audit_Logs");

            migrationBuilder.DropColumn(
                name: "table_name",
                table: "Audit_Logs");

            migrationBuilder.RenameColumn(
                name: "old_value",
                table: "Audit_Logs",
                newName: "log_data");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Audit_Logs",
                newName: "log_date");

            migrationBuilder.AddColumn<string>(
                name: "role_name",
                table: "Audit_Logs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
