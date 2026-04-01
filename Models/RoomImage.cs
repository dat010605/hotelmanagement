using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models;

public partial class RoomImage
{
    public int Id { get; set; }

    public int? RoomTypeId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public bool? IsPrimary { get; set; }

    public bool? IsActive { get; set; }

    public virtual RoomType? RoomType { get; set; }
}
