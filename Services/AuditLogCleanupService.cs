using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class AuditLogCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditLogCleanupService> _logger;

    public AuditLogCleanupService(IServiceProvider serviceProvider, ILogger<AuditLogCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
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

            // Chạy mỗi ngày 1 lần
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }
}
