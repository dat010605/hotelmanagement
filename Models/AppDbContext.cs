using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Amenity> Amenities { get; set; }

    public virtual DbSet<Article> Articles { get; set; }

    public virtual DbSet<ArticleCategory> ArticleCategories { get; set; }

    public virtual DbSet<Attraction> Attractions { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<BookingDetail> BookingDetails { get; set; }

    public virtual DbSet<Equipment> Equipments { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<LossAndDamage> LossAndDamages { get; set; }

    public virtual DbSet<Membership> Memberships { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<OrderService> OrderServices { get; set; }

    public virtual DbSet<OrderServiceDetail> OrderServiceDetails { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<RoomImage> RoomImages { get; set; }

    public virtual DbSet<RoomInventory> RoomInventories { get; set; }

    public virtual DbSet<RoomType> RoomTypes { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<ServiceCategory> ServiceCategories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    // Trong file AppDbContext.cs
    public DbSet<RoomInventory> RoomInventory { get; set; } 
// Hoặc nếu Duy đặt tên model là Room_Inventory thì sửa lại cho đúng tên Model
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Đã comment để không bị đè cấu hình trong Program.cs và appsettings.json
        // #warning To protect potentially sensitive information in your connection string...
        // optionsBuilder.UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Amenity>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Amenitie__3213E83F9F4AD4B8");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IconUrl).HasColumnName("icon_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Articles__3213E83F5342ECB6");

            entity.HasIndex(e => e.Slug, "UQ__Articles__32DD1E4C62E939FC").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PublishedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("published_at");
            entity.Property(e => e.Slug)
                .HasMaxLength(255)
                .HasColumnName("slug");
            entity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url");
            entity.Property(e => e.Title).HasColumnName("title");

            entity.HasOne(d => d.Author).WithMany(p => p.Articles)
                .HasForeignKey(d => d.AuthorId)
                .HasConstraintName("FK__Articles__author__17F790F9");

            entity.HasOne(d => d.Category).WithMany(p => p.Articles)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Articles__catego__18EBB532");
        });

        modelBuilder.Entity<ArticleCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Article___3213E83F3592C026");

            entity.ToTable("Article_Categories");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Attraction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Attracti__3213E83FE804037D");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .HasColumnName("address");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DistanceKm)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("distance_km");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Latitude)
                .HasColumnType("decimal(10, 8)")
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasColumnType("decimal(11, 8)")
                .HasColumnName("longitude");
            entity.Property(e => e.MapEmbedLink).HasColumnName("map_embed_link");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Audit_Lo__3213E83F7099AC85");

            entity.ToTable("Audit_Logs", tb => tb.HasTrigger("TR_AuditLogs_PreventDelete"));

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.TableName)
                .HasMaxLength(255)
                .HasColumnName("table_name");
            entity.Property(e => e.RecordId).HasColumnName("record_id");
            entity.Property(e => e.OldValue).HasColumnName("old_value");
            entity.Property(e => e.NewValue).HasColumnName("new_value");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Audit_Log__user___19DFD96B");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Bookings__3213E83FB9FFF2AF");

            entity.HasIndex(e => e.BookingCode, "UQ__Bookings__FF29040FE6D99FEF").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BookingCode)
                .HasMaxLength(50)
                .HasColumnName("booking_code");
            entity.Property(e => e.GuestEmail)
                .HasMaxLength(255)
                .HasColumnName("guest_email");
            entity.Property(e => e.GuestName)
                .HasMaxLength(255)
                .HasColumnName("guest_name");
            entity.Property(e => e.GuestPhone)
                .HasMaxLength(50)
                .HasColumnName("guest_phone");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Bookings__user_i__1DB06A4F");

            entity.HasOne(d => d.Voucher).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__Bookings__vouche__1EA48E88");
        });

        modelBuilder.Entity<BookingDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Booking___3213E83F162B8975");

            entity.ToTable("Booking_Details");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BookingId).HasColumnName("booking_id");
            entity.Property(e => e.CheckInDate)
                .HasColumnType("datetime")
                .HasColumnName("check_in_date");
            entity.Property(e => e.CheckOutDate)
                .HasColumnType("datetime")
                .HasColumnName("check_out_date");
            entity.Property(e => e.PricePerNight)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price_per_night");
            entity.Property(e => e.RoomId).HasColumnName("room_id");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Booking_D__booki__1AD3FDA4");

            entity.HasOne(d => d.Room).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__Booking_D__room___1BC821DD");

            entity.HasOne(d => d.RoomType).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.RoomTypeId)
                .HasConstraintName("FK__Booking_D__room___1CBC4616");
        });

        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Equipmen__3214EC078F8611FE");

            entity.HasIndex(e => e.ItemCode, "UQ__Equipmen__3ECC0FEAF6D602FB").IsUnique();

            entity.Property(e => e.BasePrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getutcdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DefaultPriceIfLost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.InStockQuantity).HasComputedColumnSql("((([TotalQuantity]-[InUseQuantity])-[DamagedQuantity])-[LiquidatedQuantity])", false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ItemCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Supplier).HasMaxLength(255);
            entity.Property(e => e.Unit).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Invoices__3213E83F7EFDBA3E");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BookingId).HasColumnName("booking_id");
            entity.Property(e => e.DiscountAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("discount_amount");
            entity.Property(e => e.FinalTotal)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("final_total");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Unpaid")
                .HasColumnName("status");
            entity.Property(e => e.TaxAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("tax_amount");
            entity.Property(e => e.TotalRoomAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_room_amount");
            entity.Property(e => e.TotalServiceAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_service_amount");

            entity.HasOne(d => d.Booking).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Invoices__bookin__1F98B2C1");
        });

        modelBuilder.Entity<LossAndDamage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Loss_And__3213E83FBB7A683B");

            entity.ToTable("Loss_And_Damages");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BookingDetailId).HasColumnName("booking_detail_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.PenaltyAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("penalty_amount");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.RoomInventoryId).HasColumnName("room_inventory_id");

            entity.HasOne(d => d.BookingDetail).WithMany(p => p.LossAndDamages)
                .HasForeignKey(d => d.BookingDetailId)
                .HasConstraintName("FK__Loss_And___booki__208CD6FA");

            entity.HasOne(d => d.RoomInventory).WithMany(p => p.LossAndDamages)
                .HasForeignKey(d => d.RoomInventoryId)
                .HasConstraintName("FK__Loss_And___room___2180FB33");
        });

        modelBuilder.Entity<Membership>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Membersh__3213E83FB9758578");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DiscountPercent)
                .HasDefaultValue(0.00m)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("discount_percent");
            entity.Property(e => e.MinPoints)
                .HasDefaultValue(0)
                .HasColumnName("min_points");
            entity.Property(e => e.TierName)
                .HasMaxLength(100)
                .HasColumnName("tier_name");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.IsRead }, "IX_Notifications_UserId_IsRead");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            entity.Property(e => e.ReferenceLink)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("reference_link");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Notifications_Users");
        });

        modelBuilder.Entity<OrderService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Order_Se__3213E83FE0BCCD8D");

            entity.ToTable("Order_Services");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BookingDetailId).HasColumnName("booking_detail_id");
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("order_date");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_amount");

            entity.HasOne(d => d.BookingDetail).WithMany(p => p.OrderServices)
                .HasForeignKey(d => d.BookingDetailId)
                .HasConstraintName("FK__Order_Ser__booki__25518C17");
        });

        modelBuilder.Entity<OrderServiceDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Order_Se__3213E83FEB09D500");

            entity.ToTable("Order_Service_Details");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.OrderServiceId).HasColumnName("order_service_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.ServiceId).HasColumnName("service_id");
            entity.Property(e => e.UnitPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("unit_price");

            entity.HasOne(d => d.OrderService).WithMany(p => p.OrderServiceDetails)
                .HasForeignKey(d => d.OrderServiceId)
                .HasConstraintName("FK__Order_Ser__order__236943A5");

            entity.HasOne(d => d.Service).WithMany(p => p.OrderServiceDetails)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK__Order_Ser__servi__245D67DE");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Payments__3213E83FDBDA3941");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AmountPaid)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount_paid");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("payment_date");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50)
                .HasColumnName("payment_method");
            entity.Property(e => e.TransactionCode)
                .HasMaxLength(100)
                .HasColumnName("transaction_code");

            entity.HasOne(d => d.Invoice).WithMany(p => p.Payments)
                .HasForeignKey(d => d.InvoiceId)
                .HasConstraintName("FK__Payments__invoic__2645B050");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Permissi__3213E83F3E402695");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reviews__3213E83F1867233A");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.RoomTypeId)
                .HasConstraintName("FK__Reviews__room_ty__2739D489");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Reviews__user_id__282DF8C2");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3213E83F3EC5F97C");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__permi__29221CFB"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__role___2A164134"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__Role_Per__C85A5463E34CA258");
                        j.ToTable("Role_Permissions");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                        j.IndexerProperty<int>("PermissionId").HasColumnName("permission_id");
                    });
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rooms__3213E83FBA4CFDE9");
            entity.ToTable(tb => tb.HasTrigger("trg_Rooms_Audit"));

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CleaningStatus)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Clean")
                .HasColumnName("cleaning_status");
            entity.Property(e => e.ExtensionNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("extension_number");
            entity.Property(e => e.Floor).HasColumnName("floor");
            entity.Property(e => e.RoomNumber)
                .HasMaxLength(50)
                .HasColumnName("room_number");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Available")
                .HasColumnName("status");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.RoomTypeId)
                .HasConstraintName("FK__Rooms__room_type__2DE6D218");
        });

        modelBuilder.Entity<RoomImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room_Ima__3213E83F045A6193");

            entity.ToTable("Room_Images");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsPrimary)
                .HasDefaultValue(false)
                .HasColumnName("is_primary");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");

            entity.HasOne(d => d.RoomType).WithMany(p => p.RoomImages)
                .HasForeignKey(d => d.RoomTypeId)
                .HasConstraintName("FK__Room_Imag__room___2B0A656D");
        });

        modelBuilder.Entity<RoomInventory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room_Inv__3213E83FEBDF520A");

            entity.ToTable("Room_Inventory");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.ItemType)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Asset")
                .HasColumnName("item_type");
            entity.Property(e => e.Note)
                .HasMaxLength(255)
                .HasColumnName("note");
            entity.Property(e => e.PriceIfLost)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price_if_lost");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");
            entity.Property(e => e.RoomId).HasColumnName("room_id");

            entity.HasOne(d => d.Equipment).WithMany(p => p.RoomInventories)
                .HasForeignKey(d => d.EquipmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RoomInventory_Equipments");

            entity.HasOne(d => d.Room).WithMany(p => p.RoomInventories)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__Room_Inve__room___2BFE89A6");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room_Typ__3213E83FD935EF69");

            entity.ToTable("Room_Types");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BasePrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("base_price");
            entity.Property(e => e.BedType)
                .HasMaxLength(100)
                .HasColumnName("bed_type");
            entity.Property(e => e.CapacityAdults).HasColumnName("capacity_adults");
            entity.Property(e => e.CapacityChildren).HasColumnName("capacity_children");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.SizeSqm).HasColumnName("size_sqm");
            entity.Property(e => e.Slug)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("slug");
            entity.Property(e => e.ViewType)
                .HasMaxLength(100)
                .HasColumnName("view_type");

            entity.HasMany(d => d.Amenities).WithMany(p => p.RoomTypes)
                .UsingEntity<Dictionary<string, object>>(
                    "RoomTypeAmenity",
                    r => r.HasOne<Amenity>().WithMany()
                        .HasForeignKey("AmenityId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__RoomType___ameni__2EDAF651"),
                    l => l.HasOne<RoomType>().WithMany()
                        .HasForeignKey("RoomTypeId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__RoomType___room___2FCF1A8A"),
                    j =>
                    {
                        j.HasKey("RoomTypeId", "AmenityId").HasName("PK__RoomType__8CA9DAD63F22BE2C");
                        j.ToTable("RoomType_Amenities");
                        j.IndexerProperty<int>("RoomTypeId").HasColumnName("room_type_id");
                        j.IndexerProperty<int>("AmenityId").HasColumnName("amenity_id");
                    });
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Services__3213E83F47224E5A");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Unit)
                .HasMaxLength(50)
                .HasColumnName("unit");

            entity.HasOne(d => d.Category).WithMany(p => p.Services)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Services__catego__30C33EC3");
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Service___3213E83FE9224A82");

            entity.ToTable("Service_Categories");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3213E83F39EDA16F");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E6164EB721056").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Address)
                .HasMaxLength(500)
                .HasColumnName("address");
            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(255)
                .HasColumnName("avatar_url");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.MembershipId).HasColumnName("membership_id");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Phone)
                .HasMaxLength(50)
                .HasColumnName("phone");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Status)
                .HasDefaultValue(true)
                .HasColumnName("status");

            entity.HasOne(d => d.Membership).WithMany(p => p.Users)
                .HasForeignKey(d => d.MembershipId)
                .HasConstraintName("FK__Users__membershi__31B762FC");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__Users__role_id__32AB8735");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vouchers__3213E83FC9D228F7");

            entity.HasIndex(e => e.Code, "UQ__Vouchers__357D4CF98290E970").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.DiscountType)
                .HasMaxLength(50)
                .HasColumnName("discount_type");
            entity.Property(e => e.DiscountValue)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("discount_value");
            entity.Property(e => e.MinBookingValue)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("min_booking_value");
            entity.Property(e => e.UsageLimit).HasColumnName("usage_limit");
            entity.Property(e => e.ValidFrom)
                .HasColumnType("datetime")
                .HasColumnName("valid_from");
            entity.Property(e => e.ValidTo)
                .HasColumnType("datetime")
                .HasColumnName("valid_to");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}