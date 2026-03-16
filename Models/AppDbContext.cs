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

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<LossAndDamage> LossAndDamages { get; set; }

    public virtual DbSet<Membership> Memberships { get; set; }

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

   
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Amenity>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Amenitie__3213E83F2C03CD82");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IconUrl).HasColumnName("icon_url");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Articles__3213E83F6B0011FE");

            entity.HasIndex(e => e.Slug, "UQ__Articles__32DD1E4C106E2D2E").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Content).HasColumnName("content");
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
                .HasConstraintName("FK__Articles__author__6E01572D");

            entity.HasOne(d => d.Category).WithMany(p => p.Articles)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Articles__catego__6EF57B66");
        });

        modelBuilder.Entity<ArticleCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Article___3213E83F08583F66");

            entity.ToTable("Article_Categories");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Attraction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Attracti__3213E83F82338BC3");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DistanceKm)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("distance_km");
            entity.Property(e => e.MapEmbedLink).HasColumnName("map_embed_link");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Audit_Lo__3213E83FB0B1B12D");

            entity.ToTable("Audit_Logs");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.NewValue).HasColumnName("new_value");
            entity.Property(e => e.OldValue).HasColumnName("old_value");
            entity.Property(e => e.RecordId).HasColumnName("record_id");
            entity.Property(e => e.TableName)
                .HasMaxLength(100)
                .HasColumnName("table_name");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Audit_Log__user___6FE99F9F");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Bookings__3213E83F28EECD7C");

            entity.HasIndex(e => e.BookingCode, "UQ__Bookings__FF29040FFC3B0ACA").IsUnique();

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
                .HasConstraintName("FK__Bookings__user_i__73BA3083");

            entity.HasOne(d => d.Voucher).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__Bookings__vouche__74AE54BC");
        });

        modelBuilder.Entity<BookingDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Booking___3213E83F083F2040");

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
                .HasConstraintName("FK__Booking_D__booki__70DDC3D8");

            entity.HasOne(d => d.Room).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__Booking_D__room___71D1E811");

            entity.HasOne(d => d.RoomType).WithMany(p => p.BookingDetails)
                .HasForeignKey(d => d.RoomTypeId)
                .HasConstraintName("FK__Booking_D__room___72C60C4A");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Invoices__3213E83F0A0874E9");

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
                .HasConstraintName("FK__Invoices__bookin__75A278F5");
        });

        modelBuilder.Entity<LossAndDamage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Loss_And__3213E83FCBF9253B");

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
                .HasConstraintName("FK__Loss_And___booki__76969D2E");

            entity.HasOne(d => d.RoomInventory).WithMany(p => p.LossAndDamages)
                .HasForeignKey(d => d.RoomInventoryId)
                .HasConstraintName("FK__Loss_And___room___778AC167");
        });

        modelBuilder.Entity<Membership>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Membersh__3213E83FBE8D8CF1");

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

        modelBuilder.Entity<OrderService>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Order_Se__3213E83FEDEFA398");

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
                .HasConstraintName("FK__Order_Ser__booki__7A672E12");
        });

        modelBuilder.Entity<OrderServiceDetail>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Order_Se__3213E83FC00A5CD9");

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
                .HasConstraintName("FK__Order_Ser__order__787EE5A0");

            entity.HasOne(d => d.Service).WithMany(p => p.OrderServiceDetails)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK__Order_Ser__servi__797309D9");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Payments__3213E83F476B232E");

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
                .HasConstraintName("FK__Payments__invoic__7B5B524B");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Permissi__3213E83F243B2DED");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Reviews__3213E83F5E38E515");

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
                .HasConstraintName("FK__Reviews__room_ty__7C4F7684");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Reviews__user_id__7D439ABD");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3213E83F1DD0E771");

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
                        .HasConstraintName("FK__Role_Perm__permi__7E37BEF6"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Role_Perm__role___7F2BE32F"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__Role_Per__C85A54638EDA7B05");
                        j.ToTable("Role_Permissions");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                        j.IndexerProperty<int>("PermissionId").HasColumnName("permission_id");
                    });
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rooms__3213E83FB849AB02");

            entity.Property(e => e.Id).HasColumnName("id");
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
                .HasConstraintName("FK__Rooms__room_type__02084FDA");
        });

        modelBuilder.Entity<RoomImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room_Ima__3213E83F5BF62486");

            entity.ToTable("Room_Images");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ImageUrl).HasColumnName("image_url");
            entity.Property(e => e.IsPrimary)
                .HasDefaultValue(false)
                .HasColumnName("is_primary");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");

            entity.HasOne(d => d.RoomType).WithMany(p => p.RoomImages)
                .HasForeignKey(d => d.RoomTypeId)
                .HasConstraintName("FK__Room_Imag__room___00200768");
        });

        modelBuilder.Entity<RoomInventory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room_Inv__3213E83FA41F31EE");

            entity.ToTable("Room_Inventory");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ItemName)
                .HasMaxLength(255)
                .HasColumnName("item_name");
            entity.Property(e => e.PriceIfLost)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("price_if_lost");
            entity.Property(e => e.Quantity)
                .HasDefaultValue(1)
                .HasColumnName("quantity");
            entity.Property(e => e.RoomId).HasColumnName("room_id");

            entity.HasOne(d => d.Room).WithMany(p => p.RoomInventories)
                .HasForeignKey(d => d.RoomId)
                .HasConstraintName("FK__Room_Inve__room___01142BA1");
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Room_Typ__3213E83FDC021DD2");

            entity.ToTable("Room_Types");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BasePrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("base_price");
            entity.Property(e => e.CapacityAdults).HasColumnName("capacity_adults");
            entity.Property(e => e.CapacityChildren).HasColumnName("capacity_children");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");

            entity.HasMany(d => d.Amenities).WithMany(p => p.RoomTypes)
                .UsingEntity<Dictionary<string, object>>(
                    "RoomTypeAmenity",
                    r => r.HasOne<Amenity>().WithMany()
                        .HasForeignKey("AmenityId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__RoomType___ameni__02FC7413"),
                    l => l.HasOne<RoomType>().WithMany()
                        .HasForeignKey("RoomTypeId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__RoomType___room___03F0984C"),
                    j =>
                    {
                        j.HasKey("RoomTypeId", "AmenityId").HasName("PK__RoomType__8CA9DAD69AA20238");
                        j.ToTable("RoomType_Amenities");
                        j.IndexerProperty<int>("RoomTypeId").HasColumnName("room_type_id");
                        j.IndexerProperty<int>("AmenityId").HasColumnName("amenity_id");
                    });
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Services__3213E83F7C8FA04E");

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
                .HasConstraintName("FK__Services__catego__04E4BC85");
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Service___3213E83F5E3BD593");

            entity.ToTable("Service_Categories");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3213E83F74E9F69B");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E616441B3DD1F").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
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
                .HasConstraintName("FK__Users__membershi__05D8E0BE");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__Users__role_id__06CD04F7");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vouchers__3213E83F5F1D4433");

            entity.HasIndex(e => e.Code, "UQ__Vouchers__357D4CF9974EFB9B").IsUnique();

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
