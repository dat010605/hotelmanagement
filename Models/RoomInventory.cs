using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // 1. Đã thêm dòng này

namespace HotelManagement.API.Models;

public partial class RoomInventory
{
    public int Id { get; set; }

    public int? RoomId { get; set; }

    public int? Quantity { get; set; }

    public decimal? PriceIfLost { get; set; }

    public string? Note { get; set; }

    public bool? IsActive { get; set; }

    public string? ItemType { get; set; }

    public int EquipmentId { get; set; }

    public virtual Equipment Equipment { get; set; } = null!;

    public virtual ICollection<LossAndDamage> LossAndDamages { get; set; } = new List<LossAndDamage>();

    public virtual Room? Room { get; set; }
    
    // 2. Đã dán bùa chú [NotMapped] vào đây để C# tha cho Database
    [NotMapped]
    public string? ItemName { get; internal set; }
}