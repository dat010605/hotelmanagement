using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models;

public partial class Room
{
    public int Id { get; set; }

    public int? RoomTypeId { get; set; }

    // Đã thêm thuộc tính Name vào đây để khớp với cơ sở dữ liệu
    public string Name { get; set; } = null!;

    public string RoomNumber { get; set; } = null!;

    public int? Floor { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ICollection<RoomInventory> RoomInventories { get; set; } = new List<RoomInventory>();

    public virtual RoomType? RoomType { get; set; } 
}