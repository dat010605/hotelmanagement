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

        // Chỉ track những Entity bị thay đổi, BỎ QUA bảng AuditLog để tránh lặp vô tận
        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog &&
                        (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
            .ToList();

        if (!entries.Any()) return;

        // Lấy UserId từ JWT token
        int? currentUserId = null;
        var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdString, out int uid)) currentUserId = uid;

        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
            WriteIndented = false
        };

        // Tạo 1 AuditLog row cho MỖI entity thay đổi (map đúng schema SQL thực tế)
        foreach (var entry in entries)
        {
            string actionType = entry.State switch
            {
                EntityState.Added => "Added",
                EntityState.Deleted => "Deleted",
                EntityState.Modified => "Modified",
                _ => "Unknown"
            };

            string? oldValue = null;
            string? newValue = null;

            try
            {
                if (entry.State == EntityState.Deleted || entry.State == EntityState.Modified)
                {
                    oldValue = JsonSerializer.Serialize(entry.OriginalValues.ToObject(), jsonOptions);
                }

                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    newValue = JsonSerializer.Serialize(entry.CurrentValues.ToObject(), jsonOptions);
                }
            }
            catch
            {
                // Bỏ qua nếu serialize thất bại
            }

            // Lấy ID của entity (nếu có property Id)
            int? recordId = null;
            var idProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Id");
            if (idProp?.CurrentValue is int idVal)
            {
                recordId = idVal;
            }

            context.Set<AuditLog>().Add(new AuditLog
            {
                UserId = currentUserId,
                Action = actionType,
                TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                RecordId = recordId,
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}
