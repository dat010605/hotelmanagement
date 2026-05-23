using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models;

public partial class User
{
    public int Id { get; set; }

    public int? RoleId { get; set; }

    public int? MembershipId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string PasswordHash { get; set; } = null!;

    public bool? Status { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Năm đã gửi voucher sinh nhật lần cuối. Dùng để chống bào mã (mỗi năm chỉ gửi 1 lần).
    /// </summary>
    public int? LastVoucherYear { get; set; }

    public string? Address { get; set; }

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual Membership? Membership { get; set; }

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Role? Role { get; set; }
}
