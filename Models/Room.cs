using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models;

public partial class Room
{
    public int Id { get; set; }

    public int? RoomTypeId { get; set; }

    public string RoomNumber { get; set; } = null!;
    public int? ParentRoomId { get; set; }

    public int? Floor { get; set; }

    public string? Status { get; set; }

    public string? CleaningStatus { get; set; }

    public string? ExtensionNumber { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ICollection<RoomInventory> RoomInventories { get; set; } = new List<RoomInventory>();

    public virtual RoomType? RoomType { get; set; }
}
