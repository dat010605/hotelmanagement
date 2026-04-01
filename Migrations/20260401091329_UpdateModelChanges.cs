using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Articles__author__6E01572D",
                table: "Articles");

            migrationBuilder.DropForeignKey(
                name: "FK__Articles__catego__6EF57B66",
                table: "Articles");

            migrationBuilder.DropForeignKey(
                name: "FK__Audit_Log__user___6FE99F9F",
                table: "Audit_Logs");

            migrationBuilder.DropForeignKey(
                name: "FK__Booking_D__booki__70DDC3D8",
                table: "Booking_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Booking_D__room___71D1E811",
                table: "Booking_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Booking_D__room___72C60C4A",
                table: "Booking_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Bookings__user_i__73BA3083",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK__Bookings__vouche__74AE54BC",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK__Invoices__bookin__75A278F5",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK__Loss_And___booki__76969D2E",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK__Loss_And___room___778AC167",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK__Order_Ser__order__787EE5A0",
                table: "Order_Service_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Order_Ser__servi__797309D9",
                table: "Order_Service_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Order_Ser__booki__7A672E12",
                table: "Order_Services");

            migrationBuilder.DropForeignKey(
                name: "FK__Payments__invoic__7B5B524B",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK__Reviews__room_ty__7C4F7684",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK__Reviews__user_id__7D439ABD",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK__Role_Perm__permi__7E37BEF6",
                table: "Role_Permissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Role_Perm__role___7F2BE32F",
                table: "Role_Permissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Room_Imag__room___00200768",
                table: "Room_Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Room_Inventory_Equipments_EquipmentId",
                table: "Room_Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK__Room_Inve__room___01142BA1",
                table: "Room_Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK__Rooms__room_type__02084FDA",
                table: "Rooms");

            migrationBuilder.DropForeignKey(
                name: "FK__RoomType___ameni__02FC7413",
                table: "RoomType_Amenities");

            migrationBuilder.DropForeignKey(
                name: "FK__RoomType___room___03F0984C",
                table: "RoomType_Amenities");

            migrationBuilder.DropForeignKey(
                name: "FK__Services__catego__04E4BC85",
                table: "Services");

            migrationBuilder.DropForeignKey(
                name: "FK__Users__membershi__05D8E0BE",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK__Users__role_id__06CD04F7",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Vouchers__3213E83F5F1D4433",
                table: "Vouchers");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Users__3213E83F74E9F69B",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Services__3213E83F7C8FA04E",
                table: "Services");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Service___3213E83F5E3BD593",
                table: "Service_Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK__RoomType__8CA9DAD69AA20238",
                table: "RoomType_Amenities");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Rooms__3213E83FB849AB02",
                table: "Rooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Room_Typ__3213E83FDC021DD2",
                table: "Room_Types");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Room_Inv__3213E83FA41F31EE",
                table: "Room_Inventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Room_Ima__3213E83F5BF62486",
                table: "Room_Images");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Roles__3213E83F1DD0E771",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Role_Per__C85A54638EDA7B05",
                table: "Role_Permissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Reviews__3213E83F5E38E515",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Permissi__3213E83F243B2DED",
                table: "Permissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Payments__3213E83F476B232E",
                table: "Payments");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Order_Se__3213E83FEDEFA398",
                table: "Order_Services");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Order_Se__3213E83FC00A5CD9",
                table: "Order_Service_Details");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Membersh__3213E83FBE8D8CF1",
                table: "Memberships");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Loss_And__3213E83FCBF9253B",
                table: "Loss_And_Damages");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Invoices__3213E83F0A0874E9",
                table: "Invoices");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Equipments",
                table: "Equipments");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Bookings__3213E83F28EECD7C",
                table: "Bookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Booking___3213E83F083F2040",
                table: "Booking_Details");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Audit_Lo__3213E83FB0B1B12D",
                table: "Audit_Logs");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Attracti__3213E83F82338BC3",
                table: "Attractions");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Articles__3213E83F6B0011FE",
                table: "Articles");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Article___3213E83F08583F66",
                table: "Article_Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Amenitie__3213E83F2C03CD82",
                table: "Amenities");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "item_name",
                table: "Room_Inventory");

            migrationBuilder.RenameIndex(
                name: "UQ__Vouchers__357D4CF9974EFB9B",
                table: "Vouchers",
                newName: "UQ__Vouchers__357D4CF98290E970");

            migrationBuilder.RenameIndex(
                name: "UQ__Users__AB6E616441B3DD1F",
                table: "Users",
                newName: "UQ__Users__AB6E6164EB721056");

            migrationBuilder.RenameIndex(
                name: "UQ__Bookings__FF29040FFC3B0ACA",
                table: "Bookings",
                newName: "UQ__Bookings__FF29040FE6D99FEF");

            migrationBuilder.RenameIndex(
                name: "UQ__Articles__32DD1E4C106E2D2E",
                table: "Articles",
                newName: "UQ__Articles__32DD1E4C62E939FC");

            migrationBuilder.AlterColumn<string>(
                name: "avatar_url",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Users",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "date_of_birth",
                table: "Users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cleaning_status",
                table: "Rooms",
                type: "varchar(50)",
                unicode: false,
                maxLength: 50,
                nullable: true,
                defaultValue: "Clean");

            migrationBuilder.AddColumn<string>(
                name: "extension_number",
                table: "Rooms",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "bed_type",
                table: "Room_Types",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "content",
                table: "Room_Types",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Room_Types",
                type: "bit",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "size_sqm",
                table: "Room_Types",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "slug",
                table: "Room_Types",
                type: "varchar(255)",
                unicode: false,
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "view_type",
                table: "Room_Types",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "note",
                table: "Room_Inventory",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "item_type",
                table: "Room_Inventory",
                type: "varchar(50)",
                unicode: false,
                maxLength: 50,
                nullable: true,
                defaultValue: "Asset",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "is_active",
                table: "Room_Inventory",
                type: "bit",
                nullable: true,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Room_Images",
                type: "bit",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Loss_And_Damages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                table: "Equipments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Supplier",
                table: "Equipments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Equipments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ItemCode",
                table: "Equipments",
                type: "varchar(50)",
                unicode: false,
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Equipments",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Equipments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Equipments",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getutcdate())");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Equipments",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "Attractions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Attractions",
                type: "bit",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "latitude",
                table: "Attractions",
                type: "decimal(10,8)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "longitude",
                table: "Attractions",
                type: "decimal(11,8)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Articles",
                type: "bit",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Article_Categories",
                type: "bit",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Amenities",
                type: "bit",
                nullable: true,
                defaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "InStockQuantity",
                table: "Equipments",
                type: "int",
                nullable: true,
                computedColumnSql: "((([TotalQuantity]-[InUseQuantity])-[DamagedQuantity])-[LiquidatedQuantity])",
                stored: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Vouchers__3213E83FC9D228F7",
                table: "Vouchers",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Users__3213E83F39EDA16F",
                table: "Users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Services__3213E83F47224E5A",
                table: "Services",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Service___3213E83FE9224A82",
                table: "Service_Categories",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__RoomType__8CA9DAD63F22BE2C",
                table: "RoomType_Amenities",
                columns: new[] { "room_type_id", "amenity_id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK__Rooms__3213E83FBA4CFDE9",
                table: "Rooms",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Room_Typ__3213E83FD935EF69",
                table: "Room_Types",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Room_Inv__3213E83FEBDF520A",
                table: "Room_Inventory",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Room_Ima__3213E83F045A6193",
                table: "Room_Images",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Roles__3213E83F3EC5F97C",
                table: "Roles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Role_Per__C85A5463E34CA258",
                table: "Role_Permissions",
                columns: new[] { "role_id", "permission_id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK__Reviews__3213E83F1867233A",
                table: "Reviews",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Permissi__3213E83F3E402695",
                table: "Permissions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Payments__3213E83FDBDA3941",
                table: "Payments",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Order_Se__3213E83FE0BCCD8D",
                table: "Order_Services",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Order_Se__3213E83FEB09D500",
                table: "Order_Service_Details",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Membersh__3213E83FB9758578",
                table: "Memberships",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Loss_And__3213E83FBB7A683B",
                table: "Loss_And_Damages",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Invoices__3213E83F7EFDBA3E",
                table: "Invoices",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Equipmen__3214EC078F8611FE",
                table: "Equipments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Bookings__3213E83FB9FFF2AF",
                table: "Bookings",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Booking___3213E83F162B8975",
                table: "Booking_Details",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Audit_Lo__3213E83F7099AC85",
                table: "Audit_Logs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Attracti__3213E83FE804037D",
                table: "Attractions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Articles__3213E83F5342ECB6",
                table: "Articles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Article___3213E83F3592C026",
                table: "Article_Categories",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Amenitie__3213E83F9F4AD4B8",
                table: "Amenities",
                column: "id");

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    type = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    reference_link = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    is_read = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "UQ__Equipmen__3ECC0FEAF6D602FB",
                table: "Equipments",
                column: "ItemCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead",
                table: "Notifications",
                columns: new[] { "user_id", "is_read" });

            migrationBuilder.AddForeignKey(
                name: "FK__Articles__author__17F790F9",
                table: "Articles",
                column: "author_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Articles__catego__18EBB532",
                table: "Articles",
                column: "category_id",
                principalTable: "Article_Categories",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Audit_Log__user___19DFD96B",
                table: "Audit_Logs",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Booking_D__booki__1AD3FDA4",
                table: "Booking_Details",
                column: "booking_id",
                principalTable: "Bookings",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Booking_D__room___1BC821DD",
                table: "Booking_Details",
                column: "room_id",
                principalTable: "Rooms",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Booking_D__room___1CBC4616",
                table: "Booking_Details",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Bookings__user_i__1DB06A4F",
                table: "Bookings",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Bookings__vouche__1EA48E88",
                table: "Bookings",
                column: "voucher_id",
                principalTable: "Vouchers",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Invoices__bookin__1F98B2C1",
                table: "Invoices",
                column: "booking_id",
                principalTable: "Bookings",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Loss_And___booki__208CD6FA",
                table: "Loss_And_Damages",
                column: "booking_detail_id",
                principalTable: "Booking_Details",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Loss_And___room___2180FB33",
                table: "Loss_And_Damages",
                column: "room_inventory_id",
                principalTable: "Room_Inventory",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Order_Ser__order__236943A5",
                table: "Order_Service_Details",
                column: "order_service_id",
                principalTable: "Order_Services",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Order_Ser__servi__245D67DE",
                table: "Order_Service_Details",
                column: "service_id",
                principalTable: "Services",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Order_Ser__booki__25518C17",
                table: "Order_Services",
                column: "booking_detail_id",
                principalTable: "Booking_Details",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Payments__invoic__2645B050",
                table: "Payments",
                column: "invoice_id",
                principalTable: "Invoices",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Reviews__room_ty__2739D489",
                table: "Reviews",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Reviews__user_id__282DF8C2",
                table: "Reviews",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Role_Perm__permi__29221CFB",
                table: "Role_Permissions",
                column: "permission_id",
                principalTable: "Permissions",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Role_Perm__role___2A164134",
                table: "Role_Permissions",
                column: "role_id",
                principalTable: "Roles",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Room_Imag__room___2B0A656D",
                table: "Room_Images",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_RoomInventory_Equipments",
                table: "Room_Inventory",
                column: "EquipmentId",
                principalTable: "Equipments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK__Room_Inve__room___2BFE89A6",
                table: "Room_Inventory",
                column: "room_id",
                principalTable: "Rooms",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Rooms__room_type__2DE6D218",
                table: "Rooms",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__RoomType___ameni__2EDAF651",
                table: "RoomType_Amenities",
                column: "amenity_id",
                principalTable: "Amenities",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__RoomType___room___2FCF1A8A",
                table: "RoomType_Amenities",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Services__catego__30C33EC3",
                table: "Services",
                column: "category_id",
                principalTable: "Service_Categories",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Users__membershi__31B762FC",
                table: "Users",
                column: "membership_id",
                principalTable: "Memberships",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Users__role_id__32AB8735",
                table: "Users",
                column: "role_id",
                principalTable: "Roles",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Articles__author__17F790F9",
                table: "Articles");

            migrationBuilder.DropForeignKey(
                name: "FK__Articles__catego__18EBB532",
                table: "Articles");

            migrationBuilder.DropForeignKey(
                name: "FK__Audit_Log__user___19DFD96B",
                table: "Audit_Logs");

            migrationBuilder.DropForeignKey(
                name: "FK__Booking_D__booki__1AD3FDA4",
                table: "Booking_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Booking_D__room___1BC821DD",
                table: "Booking_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Booking_D__room___1CBC4616",
                table: "Booking_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Bookings__user_i__1DB06A4F",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK__Bookings__vouche__1EA48E88",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK__Invoices__bookin__1F98B2C1",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK__Loss_And___booki__208CD6FA",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK__Loss_And___room___2180FB33",
                table: "Loss_And_Damages");

            migrationBuilder.DropForeignKey(
                name: "FK__Order_Ser__order__236943A5",
                table: "Order_Service_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Order_Ser__servi__245D67DE",
                table: "Order_Service_Details");

            migrationBuilder.DropForeignKey(
                name: "FK__Order_Ser__booki__25518C17",
                table: "Order_Services");

            migrationBuilder.DropForeignKey(
                name: "FK__Payments__invoic__2645B050",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK__Reviews__room_ty__2739D489",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK__Reviews__user_id__282DF8C2",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK__Role_Perm__permi__29221CFB",
                table: "Role_Permissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Role_Perm__role___2A164134",
                table: "Role_Permissions");

            migrationBuilder.DropForeignKey(
                name: "FK__Room_Imag__room___2B0A656D",
                table: "Room_Images");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomInventory_Equipments",
                table: "Room_Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK__Room_Inve__room___2BFE89A6",
                table: "Room_Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK__Rooms__room_type__2DE6D218",
                table: "Rooms");

            migrationBuilder.DropForeignKey(
                name: "FK__RoomType___ameni__2EDAF651",
                table: "RoomType_Amenities");

            migrationBuilder.DropForeignKey(
                name: "FK__RoomType___room___2FCF1A8A",
                table: "RoomType_Amenities");

            migrationBuilder.DropForeignKey(
                name: "FK__Services__catego__30C33EC3",
                table: "Services");

            migrationBuilder.DropForeignKey(
                name: "FK__Users__membershi__31B762FC",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK__Users__role_id__32AB8735",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Vouchers__3213E83FC9D228F7",
                table: "Vouchers");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Users__3213E83F39EDA16F",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Services__3213E83F47224E5A",
                table: "Services");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Service___3213E83FE9224A82",
                table: "Service_Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK__RoomType__8CA9DAD63F22BE2C",
                table: "RoomType_Amenities");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Rooms__3213E83FBA4CFDE9",
                table: "Rooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Room_Typ__3213E83FD935EF69",
                table: "Room_Types");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Room_Inv__3213E83FEBDF520A",
                table: "Room_Inventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Room_Ima__3213E83F045A6193",
                table: "Room_Images");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Roles__3213E83F3EC5F97C",
                table: "Roles");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Role_Per__C85A5463E34CA258",
                table: "Role_Permissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Reviews__3213E83F1867233A",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Permissi__3213E83F3E402695",
                table: "Permissions");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Payments__3213E83FDBDA3941",
                table: "Payments");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Order_Se__3213E83FE0BCCD8D",
                table: "Order_Services");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Order_Se__3213E83FEB09D500",
                table: "Order_Service_Details");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Membersh__3213E83FB9758578",
                table: "Memberships");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Loss_And__3213E83FBB7A683B",
                table: "Loss_And_Damages");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Invoices__3213E83F7EFDBA3E",
                table: "Invoices");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Equipmen__3214EC078F8611FE",
                table: "Equipments");

            migrationBuilder.DropIndex(
                name: "UQ__Equipmen__3ECC0FEAF6D602FB",
                table: "Equipments");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Bookings__3213E83FB9FFF2AF",
                table: "Bookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Booking___3213E83F162B8975",
                table: "Booking_Details");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Audit_Lo__3213E83F7099AC85",
                table: "Audit_Logs");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Attracti__3213E83FE804037D",
                table: "Attractions");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Articles__3213E83F5342ECB6",
                table: "Articles");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Article___3213E83F3592C026",
                table: "Article_Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Amenitie__3213E83F9F4AD4B8",
                table: "Amenities");

            migrationBuilder.DropColumn(
                name: "address",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "date_of_birth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "cleaning_status",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "extension_number",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "bed_type",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "content",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "size_sqm",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "slug",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "view_type",
                table: "Room_Types");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Room_Images");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Loss_And_Damages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Equipments");

            migrationBuilder.DropColumn(
                name: "address",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "latitude",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Article_Categories");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Amenities");

            migrationBuilder.RenameIndex(
                name: "UQ__Vouchers__357D4CF98290E970",
                table: "Vouchers",
                newName: "UQ__Vouchers__357D4CF9974EFB9B");

            migrationBuilder.RenameIndex(
                name: "UQ__Users__AB6E6164EB721056",
                table: "Users",
                newName: "UQ__Users__AB6E616441B3DD1F");

            migrationBuilder.RenameIndex(
                name: "UQ__Bookings__FF29040FE6D99FEF",
                table: "Bookings",
                newName: "UQ__Bookings__FF29040FFC3B0ACA");

            migrationBuilder.RenameIndex(
                name: "UQ__Articles__32DD1E4C62E939FC",
                table: "Articles",
                newName: "UQ__Articles__32DD1E4C106E2D2E");

            migrationBuilder.AlterColumn<string>(
                name: "avatar_url",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Rooms",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "note",
                table: "Room_Inventory",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "item_type",
                table: "Room_Inventory",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldUnicode: false,
                oldMaxLength: 50,
                oldNullable: true,
                oldDefaultValue: "Asset");

            migrationBuilder.AlterColumn<bool>(
                name: "is_active",
                table: "Room_Inventory",
                type: "bit",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "item_name",
                table: "Room_Inventory",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Unit",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Supplier",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "ItemCode",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldUnicode: false,
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Equipments",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "InStockQuantity",
                table: "Equipments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true,
                oldComputedColumnSql: "((([TotalQuantity]-[InUseQuantity])-[DamagedQuantity])-[LiquidatedQuantity])");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Equipments",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddPrimaryKey(
                name: "PK__Vouchers__3213E83F5F1D4433",
                table: "Vouchers",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Users__3213E83F74E9F69B",
                table: "Users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Services__3213E83F7C8FA04E",
                table: "Services",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Service___3213E83F5E3BD593",
                table: "Service_Categories",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__RoomType__8CA9DAD69AA20238",
                table: "RoomType_Amenities",
                columns: new[] { "room_type_id", "amenity_id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK__Rooms__3213E83FB849AB02",
                table: "Rooms",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Room_Typ__3213E83FDC021DD2",
                table: "Room_Types",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Room_Inv__3213E83FA41F31EE",
                table: "Room_Inventory",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Room_Ima__3213E83F5BF62486",
                table: "Room_Images",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Roles__3213E83F1DD0E771",
                table: "Roles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Role_Per__C85A54638EDA7B05",
                table: "Role_Permissions",
                columns: new[] { "role_id", "permission_id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK__Reviews__3213E83F5E38E515",
                table: "Reviews",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Permissi__3213E83F243B2DED",
                table: "Permissions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Payments__3213E83F476B232E",
                table: "Payments",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Order_Se__3213E83FEDEFA398",
                table: "Order_Services",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Order_Se__3213E83FC00A5CD9",
                table: "Order_Service_Details",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Membersh__3213E83FBE8D8CF1",
                table: "Memberships",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Loss_And__3213E83FCBF9253B",
                table: "Loss_And_Damages",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Invoices__3213E83F0A0874E9",
                table: "Invoices",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Equipments",
                table: "Equipments",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Bookings__3213E83F28EECD7C",
                table: "Bookings",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Booking___3213E83F083F2040",
                table: "Booking_Details",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Audit_Lo__3213E83FB0B1B12D",
                table: "Audit_Logs",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Attracti__3213E83F82338BC3",
                table: "Attractions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Articles__3213E83F6B0011FE",
                table: "Articles",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Article___3213E83F08583F66",
                table: "Article_Categories",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK__Amenitie__3213E83F2C03CD82",
                table: "Amenities",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Articles__author__6E01572D",
                table: "Articles",
                column: "author_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Articles__catego__6EF57B66",
                table: "Articles",
                column: "category_id",
                principalTable: "Article_Categories",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Audit_Log__user___6FE99F9F",
                table: "Audit_Logs",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Booking_D__booki__70DDC3D8",
                table: "Booking_Details",
                column: "booking_id",
                principalTable: "Bookings",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Booking_D__room___71D1E811",
                table: "Booking_Details",
                column: "room_id",
                principalTable: "Rooms",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Booking_D__room___72C60C4A",
                table: "Booking_Details",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Bookings__user_i__73BA3083",
                table: "Bookings",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Bookings__vouche__74AE54BC",
                table: "Bookings",
                column: "voucher_id",
                principalTable: "Vouchers",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Invoices__bookin__75A278F5",
                table: "Invoices",
                column: "booking_id",
                principalTable: "Bookings",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Loss_And___booki__76969D2E",
                table: "Loss_And_Damages",
                column: "booking_detail_id",
                principalTable: "Booking_Details",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Loss_And___room___778AC167",
                table: "Loss_And_Damages",
                column: "room_inventory_id",
                principalTable: "Room_Inventory",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Order_Ser__order__787EE5A0",
                table: "Order_Service_Details",
                column: "order_service_id",
                principalTable: "Order_Services",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Order_Ser__servi__797309D9",
                table: "Order_Service_Details",
                column: "service_id",
                principalTable: "Services",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Order_Ser__booki__7A672E12",
                table: "Order_Services",
                column: "booking_detail_id",
                principalTable: "Booking_Details",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Payments__invoic__7B5B524B",
                table: "Payments",
                column: "invoice_id",
                principalTable: "Invoices",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Reviews__room_ty__7C4F7684",
                table: "Reviews",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Reviews__user_id__7D439ABD",
                table: "Reviews",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Role_Perm__permi__7E37BEF6",
                table: "Role_Permissions",
                column: "permission_id",
                principalTable: "Permissions",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Role_Perm__role___7F2BE32F",
                table: "Role_Permissions",
                column: "role_id",
                principalTable: "Roles",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Room_Imag__room___00200768",
                table: "Room_Images",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Room_Inventory_Equipments_EquipmentId",
                table: "Room_Inventory",
                column: "EquipmentId",
                principalTable: "Equipments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK__Room_Inve__room___01142BA1",
                table: "Room_Inventory",
                column: "room_id",
                principalTable: "Rooms",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Rooms__room_type__02084FDA",
                table: "Rooms",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__RoomType___ameni__02FC7413",
                table: "RoomType_Amenities",
                column: "amenity_id",
                principalTable: "Amenities",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__RoomType___room___03F0984C",
                table: "RoomType_Amenities",
                column: "room_type_id",
                principalTable: "Room_Types",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Services__catego__04E4BC85",
                table: "Services",
                column: "category_id",
                principalTable: "Service_Categories",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Users__membershi__05D8E0BE",
                table: "Users",
                column: "membership_id",
                principalTable: "Memberships",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK__Users__role_id__06CD04F7",
                table: "Users",
                column: "role_id",
                principalTable: "Roles",
                principalColumn: "id");
        }
    }
}
