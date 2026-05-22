using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; // Đổi lại namespace Model của ngài
using System.Net.Mail;
using System.Net;

namespace HotelManagement.API.Services
{
    // Kế thừa BackgroundService để hệ thống tự động chạy ngầm
    public class BirthdayVoucherWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public BirthdayVoucherWorker(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Vòng lặp vô hạn chạy ngầm chừng nào Server còn mở
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBirthdayVouchers();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error in BirthdayVoucherWorker: {ex.Message}");
                }

                // Chờ 24 tiếng (1 ngày) rồi mới quét lại
                // (Khi test ngài có thể đổi thành TimeSpan.FromMinutes(1) để xem nó chạy)
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task ProcessBirthdayVouchers()
        {
            // Vì chạy ngầm nên phải tạo Scope riêng để gọi Database
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var today = DateTime.Today;
            var targetDate = today.AddDays(7); // Quét trước 7 ngày

            // Tìm các khách hàng có ngày sinh nhật (tháng và ngày) khớp với targetDate
            // LƯU Ý: Giả sử bảng Users của ngài có trường DateOfBirth và RoleId = 4 (Guest)
            // Nếu ngài để khách hàng ở bảng khác (Guests), hãy đổi lại _context.Guests nhé!
            var upcomingBirthdays = await dbContext.Users
                .Where(u => u.DateOfBirth.HasValue &&
                            u.DateOfBirth.Value.Month == targetDate.Month &&
                            u.DateOfBirth.Value.Day == targetDate.Day)
                .ToListAsync();

            foreach (var user in upcomingBirthdays)
            {
                // 1. Tự động sinh mã Voucher (VD: HPBD-HOAI-8374)
                string voucherCode = $"HPBD-{user.FullName.Substring(0, Math.Min(4, user.FullName.Length)).ToUpper()}-{new Random().Next(1000, 9999)}";

                // 2. Lưu vào Database (Giả sử bảng Vouchers)
                var newVoucher = new Voucher
                {
                    Code = voucherCode,
                    DiscountType = "Fixed", // Giảm giá cố định
                    DiscountValue = 200000, // Tặng voucher 200.000đ
                    ValidFrom = targetDate,
                    ValidTo = targetDate.AddDays(14), // Hạn dùng 14 ngày
                    UsageLimit = 1 // Mỗi khách chỉ dùng được 1 lần
                };
                dbContext.Vouchers.Add(newVoucher);
                await dbContext.SaveChangesAsync();

                // 3. Gọi tính năng gửi Email (Dùng chung SmtpClient ngài đã setup ở UserController)
                SendBirthdayEmail(user.Email, user.FullName, voucherCode, targetDate);
            }
        }

        private void SendBirthdayEmail(string toEmail, string name, string code, DateTime bday)
        {
            try
            {
                string fromEmail = "hotelnhungnguoiban@gmail.com";
                string appPassword = "uigpxqvgkoyjkctb"; // Pass ứng dụng

                var fromAddress = new MailAddress(fromEmail, "Hotel ERP");
                var toAddress = new MailAddress(toEmail);
                string subject = "🎉 Chúc mừng sinh nhật sớm từ Hotel ERP!";
                string body = $@"
                    <h2>Chào {name},</h2>
                    <p>Chỉ còn 7 ngày nữa là đến sinh nhật của bạn ({bday:dd/MM}) rồi!</p>
                    <p>Khách sạn chúng tôi xin tặng bạn một mã Voucher giảm giá <b>200.000đ</b> cho lần đặt phòng tiếp theo.</p>
                    <p>Mã của bạn là: <span style='color:red;font-size:20px;font-weight:bold'>{code}</span></p>
                    <p>Mong sớm được đón tiếp bạn!</p>";

                var smtp = new SmtpClient {
                    Host = "smtp.gmail.com", Port = 587, EnableSsl = true,
                    Credentials = new NetworkCredential(fromAddress.Address, appPassword)
                };

                using var message = new MailMessage(fromAddress, toAddress) { Subject = subject, Body = body, IsBodyHtml = true };
                smtp.Send(message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi mail sinh nhật: {ex.Message}");
            }
        }
    }
}