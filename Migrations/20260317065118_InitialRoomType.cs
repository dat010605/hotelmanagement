using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialRoomType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Amenities",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    icon_url = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Amenitie__3213E83F2C03CD82", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Article_Categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Article___3213E83F08583F66", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Attractions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    distance_km = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    map_embed_link = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Attracti__3213E83F82338BC3", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Memberships",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tier_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    min_points = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    discount_percent = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 0.00m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Membersh__3213E83FBE8D8CF1", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Permissi__3213E83F243B2DED", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__3213E83F1DD0E771", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Room_Types",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    base_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    capacity_adults = table.Column<int>(type: "int", nullable: false),
                    capacity_children = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Room_Typ__3213E83FDC021DD2", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Service_Categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Service___3213E83F5E3BD593", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    discount_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    discount_value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    min_booking_value = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    valid_from = table.Column<DateTime>(type: "datetime", nullable: true),
                    valid_to = table.Column<DateTime>(type: "datetime", nullable: true),
                    usage_limit = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Vouchers__3213E83F5F1D4433", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Role_Permissions",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false),
                    permission_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Role_Per__C85A54638EDA7B05", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "FK__Role_Perm__permi__7E37BEF6",
                        column: x => x.permission_id,
                        principalTable: "Permissions",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Role_Perm__role___7F2BE32F",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: true),
                    membership_id = table.Column<int>(type: "int", nullable: true),
                    full_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    password_hash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__3213E83F74E9F69B", x => x.id);
                    table.ForeignKey(
                        name: "FK__Users__membershi__05D8E0BE",
                        column: x => x.membership_id,
                        principalTable: "Memberships",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Users__role_id__06CD04F7",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Room_Images",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_primary = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Room_Ima__3213E83F5BF62486", x => x.id);
                    table.ForeignKey(
                        name: "FK__Room_Imag__room___00200768",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    room_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    floor = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Available")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Rooms__3213E83FB849AB02", x => x.id);
                    table.ForeignKey(
                        name: "FK__Rooms__room_type__02084FDA",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "RoomType_Amenities",
                columns: table => new
                {
                    room_type_id = table.Column<int>(type: "int", nullable: false),
                    amenity_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__RoomType__8CA9DAD69AA20238", x => new { x.room_type_id, x.amenity_id });
                    table.ForeignKey(
                        name: "FK__RoomType___ameni__02FC7413",
                        column: x => x.amenity_id,
                        principalTable: "Amenities",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__RoomType___room___03F0984C",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Services__3213E83F7C8FA04E", x => x.id);
                    table.ForeignKey(
                        name: "FK__Services__catego__04E4BC85",
                        column: x => x.category_id,
                        principalTable: "Service_Categories",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Articles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_id = table.Column<int>(type: "int", nullable: true),
                    author_id = table.Column<int>(type: "int", nullable: true),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    slug = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    thumbnail_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    published_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Articles__3213E83F6B0011FE", x => x.id);
                    table.ForeignKey(
                        name: "FK__Articles__author__6E01572D",
                        column: x => x.author_id,
                        principalTable: "Users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Articles__catego__6EF57B66",
                        column: x => x.category_id,
                        principalTable: "Article_Categories",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Audit_Logs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    table_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    record_id = table.Column<int>(type: "int", nullable: false),
                    old_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    new_value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Audit_Lo__3213E83FB0B1B12D", x => x.id);
                    table.ForeignKey(
                        name: "FK__Audit_Log__user___6FE99F9F",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    guest_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    guest_phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    guest_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    booking_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    voucher_id = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Bookings__3213E83F28EECD7C", x => x.id);
                    table.ForeignKey(
                        name: "FK__Bookings__user_i__73BA3083",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Bookings__vouche__74AE54BC",
                        column: x => x.voucher_id,
                        principalTable: "Vouchers",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    rating = table.Column<int>(type: "int", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Reviews__3213E83F5E38E515", x => x.id);
                    table.ForeignKey(
                        name: "FK__Reviews__room_ty__7C4F7684",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Reviews__user_id__7D439ABD",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Room_Inventory",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    room_id = table.Column<int>(type: "int", nullable: true),
                    item_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    price_if_lost = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Room_Inv__3213E83FA41F31EE", x => x.id);
                    table.ForeignKey(
                        name: "FK__Room_Inve__room___01142BA1",
                        column: x => x.room_id,
                        principalTable: "Rooms",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Booking_Details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_id = table.Column<int>(type: "int", nullable: true),
                    room_id = table.Column<int>(type: "int", nullable: true),
                    room_type_id = table.Column<int>(type: "int", nullable: true),
                    check_in_date = table.Column<DateTime>(type: "datetime", nullable: false),
                    check_out_date = table.Column<DateTime>(type: "datetime", nullable: false),
                    price_per_night = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Booking___3213E83F083F2040", x => x.id);
                    table.ForeignKey(
                        name: "FK__Booking_D__booki__70DDC3D8",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Booking_D__room___71D1E811",
                        column: x => x.room_id,
                        principalTable: "Rooms",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Booking_D__room___72C60C4A",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_id = table.Column<int>(type: "int", nullable: true),
                    total_room_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    total_service_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    discount_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    tax_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    final_total = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Unpaid")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Invoices__3213E83F0A0874E9", x => x.id);
                    table.ForeignKey(
                        name: "FK__Invoices__bookin__75A278F5",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Loss_And_Damages",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_detail_id = table.Column<int>(type: "int", nullable: true),
                    room_inventory_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    penalty_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Loss_And__3213E83FCBF9253B", x => x.id);
                    table.ForeignKey(
                        name: "FK__Loss_And___booki__76969D2E",
                        column: x => x.booking_detail_id,
                        principalTable: "Booking_Details",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Loss_And___room___778AC167",
                        column: x => x.room_inventory_id,
                        principalTable: "Room_Inventory",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Order_Services",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_detail_id = table.Column<int>(type: "int", nullable: true),
                    order_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_Se__3213E83FEDEFA398", x => x.id);
                    table.ForeignKey(
                        name: "FK__Order_Ser__booki__7A672E12",
                        column: x => x.booking_detail_id,
                        principalTable: "Booking_Details",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    invoice_id = table.Column<int>(type: "int", nullable: true),
                    payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    amount_paid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    transaction_code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    payment_date = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payments__3213E83F476B232E", x => x.id);
                    table.ForeignKey(
                        name: "FK__Payments__invoic__7B5B524B",
                        column: x => x.invoice_id,
                        principalTable: "Invoices",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Order_Service_Details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_service_id = table.Column<int>(type: "int", nullable: true),
                    service_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Order_Se__3213E83FC00A5CD9", x => x.id);
                    table.ForeignKey(
                        name: "FK__Order_Ser__order__787EE5A0",
                        column: x => x.order_service_id,
                        principalTable: "Order_Services",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__Order_Ser__servi__797309D9",
                        column: x => x.service_id,
                        principalTable: "Services",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Articles_author_id",
                table: "Articles",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_category_id",
                table: "Articles",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Articles__32DD1E4C106E2D2E",
                table: "Articles",
                column: "slug",
                unique: true,
                filter: "[slug] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Audit_Logs_user_id",
                table: "Audit_Logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_Details_booking_id",
                table: "Booking_Details",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_Details_room_id",
                table: "Booking_Details",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_Booking_Details_room_type_id",
                table: "Booking_Details",
                column: "room_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_user_id",
                table: "Bookings",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_voucher_id",
                table: "Bookings",
                column: "voucher_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Bookings__FF29040FFC3B0ACA",
                table: "Bookings",
                column: "booking_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_booking_id",
                table: "Invoices",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_Loss_And_Damages_booking_detail_id",
                table: "Loss_And_Damages",
                column: "booking_detail_id");

            migrationBuilder.CreateIndex(
                name: "IX_Loss_And_Damages_room_inventory_id",
                table: "Loss_And_Damages",
                column: "room_inventory_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Service_Details_order_service_id",
                table: "Order_Service_Details",
                column: "order_service_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Service_Details_service_id",
                table: "Order_Service_Details",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_Order_Services_booking_detail_id",
                table: "Order_Services",
                column: "booking_detail_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_invoice_id",
                table: "Payments",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_room_type_id",
                table: "Reviews",
                column: "room_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_user_id",
                table: "Reviews",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Role_Permissions_permission_id",
                table: "Role_Permissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "IX_Room_Images_room_type_id",
                table: "Room_Images",
                column: "room_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Room_Inventory_room_id",
                table: "Room_Inventory",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_room_type_id",
                table: "Rooms",
                column: "room_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoomType_Amenities_amenity_id",
                table: "RoomType_Amenities",
                column: "amenity_id");

            migrationBuilder.CreateIndex(
                name: "IX_Services_category_id",
                table: "Services",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_membership_id",
                table: "Users",
                column: "membership_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_role_id",
                table: "Users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__AB6E616441B3DD1F",
                table: "Users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Vouchers__357D4CF9974EFB9B",
                table: "Vouchers",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Articles");

            migrationBuilder.DropTable(
                name: "Attractions");

            migrationBuilder.DropTable(
                name: "Audit_Logs");

            migrationBuilder.DropTable(
                name: "Loss_And_Damages");

            migrationBuilder.DropTable(
                name: "Order_Service_Details");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Role_Permissions");

            migrationBuilder.DropTable(
                name: "Room_Images");

            migrationBuilder.DropTable(
                name: "RoomType_Amenities");

            migrationBuilder.DropTable(
                name: "Article_Categories");

            migrationBuilder.DropTable(
                name: "Room_Inventory");

            migrationBuilder.DropTable(
                name: "Order_Services");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Amenities");

            migrationBuilder.DropTable(
                name: "Booking_Details");

            migrationBuilder.DropTable(
                name: "Service_Categories");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "Room_Types");

            migrationBuilder.DropTable(
                name: "Memberships");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
