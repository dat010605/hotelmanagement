using Cronos;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class AuditLogCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditLogCleanupService> _logger;
    private readonly CronExpression _cronExpression;

    public AuditLogCleanupService(IServiceProvider serviceProvider, ILogger<AuditLogCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _cronExpression = CronExpression.Parse("0 0 * * *"); // 12h đêm mỗi ngày
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var next = _cronExpression.GetNextOccurrence(DateTime.UtcNow);
            if (next.HasValue)
            {
                var delay = next.Value - DateTime.UtcNow;
                if (delay.TotalMilliseconds > 0)
                {
                    _logger.LogInformation($"[AuditLogCleanupService] Chờ {delay.TotalHours:F2} giờ để tới lần dọn dẹp tiếp theo vào 00:00 UTC.");
                    await Task.Delay(delay, stoppingToken);
                }
            }

            if (stoppingToken.IsCancellationRequested)
                break;

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

                var oldLogs = await dbContext.AuditLogs
                    .Where(log => log.CreatedAt < thirtyDaysAgo)
                    .ToListAsync(stoppingToken);

                if (oldLogs.Any())
                {
                    dbContext.AuditLogs.RemoveRange(oldLogs);
                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation($"[AuditLogCleanupService] Dọn dẹp thành công {oldLogs.Count} logs cũ hơn 30 ngày.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AuditLogCleanupService] Có lỗi xảy ra khi dọn dẹp log cũ.");
            }
        }
    }
}
