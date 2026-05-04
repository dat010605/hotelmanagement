using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

/// <summary>
/// Entity map đúng với bảng [Audit_Logs] trong SQL Server.
/// Cột thực tế: id, user_id, action, table_name, record_id, old_value, new_value, created_at
/// </summary>
[Table("Audit_Logs")]
public partial class AuditLog
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("action")]
    [MaxLength(50)]
    public string? Action { get; set; }

    [Column("table_name")]
    [MaxLength(255)]
    public string? TableName { get; set; }

    [Column("record_id")]
    public int? RecordId { get; set; }

    [Column("old_value")]
    public string? OldValue { get; set; }

    [Column("new_value")]
    public string? NewValue { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    public virtual User? User { get; set; }
}
