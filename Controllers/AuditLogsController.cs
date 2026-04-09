using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")] // Giả định chỉ Admin mới được xem
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();
        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id,
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
}
