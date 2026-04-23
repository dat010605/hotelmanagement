using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models;

public partial class AuditLog
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string? RoleName { get; set; }

    public DateTime? LogDate { get; set; }

    /// <summary>
    /// JSON format: {"TotalEvents": N, "Events": [{eventId, timestamp, actionType, tableName, entity}]}
    /// </summary>
    public string? LogData { get; set; }

    public virtual User? User { get; set; }
}
