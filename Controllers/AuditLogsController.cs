using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách audit logs (1 dòng = 1 ngày hoạt động của 1 user).
    /// Admin/Manager xem tất cả. Staff chỉ xem của mình.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? date = null)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        bool isAdminOrManager = User.IsInRole("Admin") || User.IsInRole("Manager");
        if (!isAdminOrManager)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int currentUserId))
                query = query.Where(a => a.UserId == currentUserId);
        }
        else if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (date.HasValue)
        {
            var targetDate = date.Value.Date;
            query = query.Where(a => a.LogDate.HasValue && a.LogDate.Value.Date == targetDate);
        }

        query = query.OrderByDescending(a => a.LogDate);

        var totalCount = await query.CountAsync();
        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.RoleName,
                a.LogDate,
                a.LogData,
                UserFullName = a.User != null ? a.User.FullName : "System/Unknown"
            })
            .ToListAsync();

        return Ok(new { total = totalCount, data = logs });
    }

    /// <summary>
    /// Thống kê số sự kiện theo loại (CREATE/UPDATE/DELETE) — chỉ Admin/Manager.
    /// Parse từ JSON của log_data.
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetLogStats()
    {
        var logs = await _context.AuditLogs
            .Select(a => a.LogData)
            .ToListAsync();

        var stats = new Dictionary<string, int>
        {
            { "CREATE", 0 },
            { "UPDATE", 0 },
            { "DELETE", 0 }
        };

        foreach (var logData in logs)
        {
            if (string.IsNullOrEmpty(logData)) continue;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(logData);
                if (doc.RootElement.TryGetProperty("Events", out var events))
                {
                    foreach (var ev in events.EnumerateArray())
                    {
                        if (ev.TryGetProperty("actionType", out var actionProp))
                        {
                            var action = actionProp.GetString() ?? "";
                            if (stats.ContainsKey(action))
                                stats[action]++;
                        }
                    }
                }
            }
            catch { /* bỏ qua log lỗi parse */ }
        }

        return Ok(stats.Select(kv => new { Action = kv.Key, Count = kv.Value }));
    }
}
