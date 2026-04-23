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

        // Lấy UserId và RoleName từ JWT token
        int? currentUserId = null;
        var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdString, out int uid)) currentUserId = uid;
        string? currentRoleName = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;

        var jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
            WriteIndented = false
        };

        // Tạo danh sách sự kiện mới từ các Entity thay đổi
        var newEvents = new List<object>();
        foreach (var entry in entries)
        {
            object? entitySnapshot = null;
            if (entry.State == EntityState.Added)
                entitySnapshot = entry.CurrentValues.ToObject();
            else if (entry.State == EntityState.Deleted)
                entitySnapshot = entry.OriginalValues.ToObject();
            else // Modified
                entitySnapshot = new
                {
                    Before = entry.OriginalValues.ToObject(),
                    After = entry.CurrentValues.ToObject()
                };

            newEvents.Add(new
            {
                eventId = Guid.NewGuid().ToString(),
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fffffff"),
                actionType = entry.State == EntityState.Added ? "CREATE"
                           : entry.State == EntityState.Deleted ? "DELETE"
                           : "UPDATE",
                tableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                entity = entitySnapshot
            });
        }

        // Tìm log hiện tại của user trong ngày hôm nay (UTC)
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        // Kiểm tra Local cache trước (đã load trong session này)
        var existingLog = context.Set<AuditLog>()
            .Local
            .FirstOrDefault(a => a.UserId == currentUserId
                              && a.LogDate.HasValue
                              && a.LogDate.Value >= today
                              && a.LogDate.Value < tomorrow);

        // Nếu không có trong cache thì truy vấn DB
        if (existingLog == null)
        {
            existingLog = context.Set<AuditLog>()
                .FirstOrDefault(a => a.UserId == currentUserId
                                  && a.LogDate.HasValue
                                  && a.LogDate.Value >= today
                                  && a.LogDate.Value < tomorrow);
        }

        if (existingLog != null)
        {
            // Merge: đọc Events cũ và thêm Events mới vào
            try
            {
                var existingDoc = JsonSerializer.Deserialize<JsonElement>(existingLog.LogData ?? "{}");
                var existingEvents = new List<JsonElement>();
                if (existingDoc.TryGetProperty("Events", out var evArr))
                    existingEvents = JsonSerializer.Deserialize<List<JsonElement>>(evArr.GetRawText()) ?? new();

                var allEvents = existingEvents.Cast<object>().Concat(newEvents).ToList();
                existingLog.LogData = JsonSerializer.Serialize(new
                {
                    TotalEvents = allEvents.Count,
                    Events = allEvents
                }, jsonOptions);
            }
            catch
            {
                // Nếu parse lỗi thì ghi đè
                existingLog.LogData = JsonSerializer.Serialize(new
                {
                    TotalEvents = newEvents.Count,
                    Events = newEvents
                }, jsonOptions);
            }
            // existingLog đã được EF Core track, sẽ tự động UPDATE khi SaveChanges
        }
        else
        {
            // Tạo dòng mới cho ngày hôm nay
            context.Set<AuditLog>().Add(new AuditLog
            {
                UserId = currentUserId,
                RoleName = currentRoleName,
                LogDate = DateTime.UtcNow,
                LogData = JsonSerializer.Serialize(new
                {
                    TotalEvents = newEvents.Count,
                    Events = newEvents
                }, jsonOptions)
            });
        }
    }
}
