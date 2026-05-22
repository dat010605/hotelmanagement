using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HotelManagement.API.Models;

public partial class Permission
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
