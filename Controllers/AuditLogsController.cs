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
    /// Lấy danh sách audit logs (map đúng schema: action, table_name, record_id, old_value, new_value, created_at).
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
            query = query.Where(a => a.CreatedAt.HasValue && a.CreatedAt.Value.Date == targetDate);
        }

        query = query.OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
                a.UserId,
                a.Action,
                a.TableName,
                a.RecordId,
                a.OldValue,
                a.NewValue,
                a.CreatedAt,
                UserFullName = a.User != null ? a.User.FullName : "System/Unknown"
            })
            .ToListAsync();

        return Ok(new { total = totalCount, data = logs });
    }

    /// <summary>
    /// Thống kê số sự kiện theo loại (Added/Modified/Deleted) — chỉ Admin/Manager.
    /// Đọc trực tiếp từ cột action.
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetLogStats()
    {
        var stats = await _context.AuditLogs
            .Where(a => a.Action != null)
            .GroupBy(a => a.Action!)
            .Select(g => new { Action = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(stats);
    }
}
