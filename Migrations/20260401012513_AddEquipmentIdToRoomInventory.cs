using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEquipmentIdToRoomInventory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "name",
                table: "Equipments",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "category",
                table: "Equipments",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "total_quantity",
                table: "Equipments",
                newName: "TotalQuantity");

            migrationBuilder.RenameColumn(
                name: "in_use_quantity",
                table: "Equipments",
                newName: "InUseQuantity");

            migrationBuilder.RenameColumn(
                name: "image_url",
                table: "Equipments",
                newName: "ImageUrl");

            migrationBuilder.RenameColumn(
                name: "default_price_if_lost",
                table: "Equipments",
                newName: "DefaultPriceIfLost");

            migrationBuilder.RenameColumn(
                name: "base_price",
                table: "Equipments",
                newName: "BasePrice");

            migrationBuilder.RenameColumn(
                name: "available_quantity",
                table: "Equipments",
                newName: "LiquidatedQuantity");

            migrationBuilder.AddColumn<int>(
                name: "EquipmentId",
                table: "Room_Inventory",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Room_Inventory",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "item_type",
                table: "Room_Inventory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "Room_Inventory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<int>(
                name: "DamagedQuantity",
                table: "Equipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "InStockQuantity",
                table: "Equipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Equipments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ItemCode",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Supplier",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Room_Inventory_EquipmentId",
                table: "Room_Inventory",
                column: "EquipmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Room_Inventory_Equipments_EquipmentId",
                table: "Room_Inventory",
                column: "EquipmentId",
                principalTable: "Equipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Room_Inventory_Equipments_EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Room_Inventory_EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "item_type",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "note",
                table: "Room_Inventory");

            migrationBuilder.DropColumn(
                name: "DamagedQuantity",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "InStockQuantity",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "ItemCode",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "Supplier",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "Equipments");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Equipments",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Equipments",
                newName: "category");

            migrationBuilder.RenameColumn(
                name: "TotalQuantity",
                table: "Equipments",
                newName: "total_quantity");

            migrationBuilder.RenameColumn(
                name: "InUseQuantity",
                table: "Equipments",
                newName: "in_use_quantity");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Equipments",
                newName: "image_url");

            migrationBuilder.RenameColumn(
                name: "DefaultPriceIfLost",
                table: "Equipments",
                newName: "default_price_if_lost");

            migrationBuilder.RenameColumn(
                name: "BasePrice",
                table: "Equipments",
                newName: "base_price");

            migrationBuilder.RenameColumn(
                name: "LiquidatedQuantity",
                table: "Equipments",
                newName: "available_quantity");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "Equipments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "category",
                table: "Equipments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
