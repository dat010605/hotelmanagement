using HotelManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace HotelManagement.API.Models;

public class AuditLogInterceptor : SaveChangesInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogInterceptor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        HandleAuditLogs(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        HandleAuditLogs(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void HandleAuditLogs(DbContext? context)
    {
        if (context == null) return;

        // Chỉ track những Entity bị thay đổi (Added, Modified, Deleted) và BỎ QUA bảng AuditLog để tránh lặp vô tận
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog && 
                        (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
            .ToList();

        if (!entries.Any()) return;

        // Lấy User Id từ HttpContext (nếu có đăng nhập JWT)
        int? currentUserId = null;
        var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdString, out int uid))
        {
            currentUserId = uid;
        }

        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
            WriteIndented = false
        };

        foreach (var entry in entries)
        {
            var auditLog = new AuditLog
            {
                TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                Action = entry.State.ToString(),
                CreatedAt = DateTime.UtcNow,
                UserId = currentUserId
            };

            // Tìm khóa chính (Id)
            var primaryKey = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
            if (primaryKey != null && primaryKey.CurrentValue != null)
            {
                if (int.TryParse(primaryKey.CurrentValue.ToString(), out int recId))
                    auditLog.RecordId = recId;
            }

            if (entry.State == EntityState.Added)
            {
                auditLog.NewValue = JsonSerializer.Serialize(entry.CurrentValues.ToObject(), jsonOptions);
            }
            else if (entry.State == EntityState.Deleted)
            {
                auditLog.OldValue = JsonSerializer.Serialize(entry.OriginalValues.ToObject(), jsonOptions);
            }
            else if (entry.State == EntityState.Modified)
            {
                // Chỉ lấy những property thay đổi hoặc lấy cả dòng
                auditLog.OldValue = JsonSerializer.Serialize(entry.OriginalValues.ToObject(), jsonOptions);
                auditLog.NewValue = JsonSerializer.Serialize(entry.CurrentValues.ToObject(), jsonOptions);
            }

            context.Set<AuditLog>().Add(auditLog);
        }
    }
}
