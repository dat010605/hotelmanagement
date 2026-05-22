using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using System.Net.Mail;
using System.Net;

namespace HotelManagement.API.Services
{
    /// <summary>
    /// Background worker chạy mỗi 24 giờ, quét user có sinh nhật trong 7 ngày tới
    /// và gửi voucher sinh nhật. Đảm bảo mỗi user chỉ nhận 1 voucher/năm.
    /// </summary>
    public class BirthdayVoucherWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BirthdayVoucherWorker> _logger;

        // Múi giờ Việt Nam (UTC+7)
        private static readonly TimeZoneInfo VnTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        public BirthdayVoucherWorker(IServiceProvider serviceProvider, ILogger<BirthdayVoucherWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("BirthdayVoucherWorker đã khởi động.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBirthdayVouchersAsync();
                }
                catch (Exception ex)
                {
                    // Không để exception crash worker — chỉ log và tiếp tục chu kỳ sau
                    _logger.LogError(ex, "Lỗi trong BirthdayVoucherWorker.ProcessBirthdayVouchers");
                }

                // Chờ 24 giờ rồi quét lại
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task ProcessBirthdayVouchersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Lấy thời gian hiện tại theo múi giờ Việt Nam
            var nowVn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VnTimeZone);
            var today = DateOnly.FromDateTime(nowVn);
            var currentYear = today.Year;

            // Quét trước 7 ngày — ngày mục tiêu để gửi voucher
            var targetDate = today.AddDays(7);

            _logger.LogInformation("Quét voucher sinh nhật: hôm nay={Today}, targetDate={Target}", today, targetDate);

            // ✅ GUARD 1: Chỉ lấy user có DOB, sinh nhật đúng tháng/ngày targetDate
            // ✅ GUARD 2: LastVoucherYear < currentYear → chưa gửi năm nay
            var eligibleUsers = await db.Users
                .Where(u =>
                    u.DateOfBirth.HasValue &&
                    u.DateOfBirth.Value.Month == targetDate.Month &&
                    u.DateOfBirth.Value.Day == targetDate.Day &&
                    // Chưa gửi năm nay (null = chưa bao giờ gửi, hoặc gửi năm trước)
                    (u.LastVoucherYear == null || u.LastVoucherYear < currentYear)
                )
                .ToListAsync();

            _logger.LogInformation("Tìm thấy {Count} user đủ điều kiện nhận voucher sinh nhật.", eligibleUsers.Count);

            foreach (var user in eligibleUsers)
            {
                // Tạo mã voucher duy nhất
                string namePart = new string(
                    (user.FullName ?? "USER")
                    .Where(char.IsLetter)
                    .Take(4)
                    .ToArray()
                ).ToUpperInvariant();

                string voucherCode = $"HPBD-{namePart}-{currentYear}-{new Random().Next(1000, 9999)}";

                try
                {
                    var newVoucher = new Voucher
                    {
                        Code = voucherCode,
                        DiscountType = "Amount",         // Giảm cố định theo VNĐ
                        DiscountValue = 200000,           // Tặng 200.000₫
                        ValidFrom = targetDate.ToDateTime(TimeOnly.MinValue),
                        ValidTo = targetDate.AddDays(14).ToDateTime(TimeOnly.MaxValue), // Hạn dùng 14 ngày
                        UsageLimit = 1                    // Mỗi khách chỉ dùng 1 lần
                    };
                    db.Vouchers.Add(newVoucher);

                    // ✅ Cập nhật LastVoucherYear CÙNG transaction → chống gửi trùng
                    user.LastVoucherYear = currentYear;

                    await db.SaveChangesAsync();

                    // Gửi email bất đồng bộ, không block transaction
                    _ = Task.Run(() => SendBirthdayEmail(user.Email, user.FullName ?? "Khách", voucherCode, targetDate));

                    _logger.LogInformation("Đã tạo voucher {Code} cho user {UserId} ({Email})", voucherCode, user.Id, user.Email);
                }
                catch (Exception ex)
                {
                    // Nếu 1 user lỗi không ảnh hưởng user khác
                    _logger.LogError(ex, "Lỗi tạo voucher cho user {UserId}", user.Id);
                }
            }
        }

        private void SendBirthdayEmail(string toEmail, string name, string code, DateOnly bday)
        {
            try
            {
                string fromEmail = "hotelnhungnguoiban@gmail.com";
                string appPassword = "uigpxqvgkoyjkctb";

                var smtp = new SmtpClient
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
                    Credentials = new NetworkCredential(fromEmail, appPassword)
                };

                string subject = "🎉 Chúc mừng sinh nhật sớm từ The Royal Citadel!";
                string body = $@"
                    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
                      <h2 style='color:#c9a961'>Chào {System.Net.WebUtility.HtmlEncode(name)},</h2>
                      <p>Chỉ còn 7 ngày nữa là đến sinh nhật của bạn (<b>{bday:dd/MM}</b>) rồi!</p>
                      <p>Khách sạn <b>The Royal Citadel</b> xin tặng bạn voucher giảm giá <b>200.000₫</b> cho lần đặt phòng tiếp theo.</p>
                      <p style='font-size:22px;font-weight:bold;color:#c9a961;text-align:center;
                                padding:16px;background:#fffbf0;border-radius:8px;border:2px dashed #c9a961'>
                        {System.Net.WebUtility.HtmlEncode(code)}
                      </p>
                      <p><i>Voucher có hiệu lực từ ngày sinh nhật và hết hạn sau 14 ngày.</i></p>
                      <p>Mong sớm được đón tiếp bạn! 🏨</p>
                    </div>";

                using var msg = new MailMessage(fromEmail, toEmail)
                {
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                smtp.Send(msg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi gửi email sinh nhật tới {Email}", toEmail);
            }
        }
    }
}