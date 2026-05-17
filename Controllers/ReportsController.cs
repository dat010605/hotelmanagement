using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin,Manager")] // Tạm tắt để test Dashboard
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        // 36. Dashboard Summary
        [HttpGet("Dashboard/Summary")]
        public async Task<IActionResult> GetSummary()
        {
            var today = DateTime.Today;

            // Lấy doanh thu từ cột FinalTotal của Duy
            var revenueTotal = await _context.Invoices
                .Where(i => i.Status == "Paid")
                .SumAsync(i => i.FinalTotal ?? 0);

            var guestsStaying = await _context.BookingDetails.CountAsync();

            var emptyRooms = await _context.Rooms.CountAsync(r => r.Status == "Available");

            var newBookings = await _context.Bookings.CountAsync();

            return Ok(new {
                RevenueTotal = revenueTotal, // Đổi thành tổng doanh thu vì Invoice ko có ngày
                GuestsStaying = guestsStaying,
                EmptyRooms = emptyRooms,
                NewBookings = newBookings
            });
        }

        // 37. Doanh thu (Tạm lấy theo Id vì ko có cột ngày trong Invoice)
        [HttpGet("RevenueByMonth")]
        public async Task<IActionResult> GetRevenueByMonth()
        {
            var revenue = await _context.Invoices
                .Where(i => i.Status == "Paid")
                .Select(i => new { 
                    InvoiceId = i.Id, 
                    Amount = i.FinalTotal ?? 0 
                })
                .ToListAsync();

            return Ok(revenue);
        }

        // 38. Công suất phòng (Sửa lỗi RoomType Name)
        [HttpGet("RoomOccupancy")]
        public async Task<IActionResult> GetRoomOccupancy()
        {
            var occupancy = await _context.Rooms
                .Include(r => r.RoomType)
                .GroupBy(r => r.RoomType!.Name) 
                .Select(g => new { RoomType = g.Key ?? "Standard", Count = g.Count(r => r.Status == "Occupied") })
                .ToListAsync();

            return Ok(occupancy);
        }

        // 39. Top dịch vụ (Để tránh lỗi Price/Quantity, mình lấy theo TotalServiceAmount trong Invoice)
        [HttpGet("TopServices")]
        public async Task<IActionResult> GetTopServices()
        {
            var topInvoices = await _context.Invoices
                .Where(i => i.TotalServiceAmount > 0)
                .OrderByDescending(i => i.TotalServiceAmount)
                .Take(5)
                .Select(i => new { BookingId = i.BookingId, ServiceRevenue = i.TotalServiceAmount })
                .ToListAsync();

            return Ok(topInvoices);
        }

        // ==========================================
        // THỐNG KÊ DOANH THU THEO NGÀY (14 ngày gần nhất)
        // ==========================================
        [HttpGet("RevenueByDay")]
        public async Task<IActionResult> GetRevenueByDay()
        {
            var fromDate = DateTime.Today.AddDays(-13);

            var payments = await _context.Payments
                .Where(p => p.PaymentDate >= fromDate)
                .ToListAsync();

            var grouped = payments
                .GroupBy(p => p.PaymentDate!.Value.Date)
                .Select(g => new { Date = g.Key.ToString("dd/MM"), Amount = g.Sum(p => p.AmountPaid) })
                .OrderBy(g => g.Date)
                .ToList();

            // Điền 0 cho các ngày không có doanh thu
            var result = new List<object>();
            for (int i = 0; i < 14; i++)
            {
                var date = fromDate.AddDays(i);
                var dateStr = date.ToString("dd/MM");
                var found = grouped.FirstOrDefault(g => g.Date == dateStr);
                result.Add(new { Date = dateStr, Amount = found?.Amount ?? 0m });
            }

            return Ok(result);
        }

        // ==========================================
        // THỐNG KÊ DOANH THU THEO TUẦN (12 tuần gần nhất)
        // ==========================================
        [HttpGet("RevenueByWeek")]
        public async Task<IActionResult> GetRevenueByWeek()
        {
            var fromDate = DateTime.Today.AddDays(-83); // ~12 tuần

            var payments = await _context.Payments
                .Where(p => p.PaymentDate >= fromDate)
                .ToListAsync();

            var result = new List<object>();
            for (int i = 11; i >= 0; i--)
            {
                var weekStart = DateTime.Today.AddDays(-i * 7 - (int)DateTime.Today.DayOfWeek + 1);
                var weekEnd = weekStart.AddDays(7);
                var weekLabel = $"T{12 - i} ({weekStart:dd/MM})";
                var amount = payments
                    .Where(p => p.PaymentDate >= weekStart && p.PaymentDate < weekEnd)
                    .Sum(p => p.AmountPaid);
                result.Add(new { Week = weekLabel, Amount = amount });
            }

            return Ok(result);
        }

        // ==========================================
        // THỐNG KÊ DOANH THU THEO THÁNG (12 tháng gần nhất)
        // ==========================================
        [HttpGet("RevenueByMonth2")]
        public async Task<IActionResult> GetRevenueByMonth2()
        {
            var fromDate = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-11);

            var payments = await _context.Payments
                .Where(p => p.PaymentDate >= fromDate)
                .ToListAsync();

            var result = new List<object>();
            for (int i = 0; i < 12; i++)
            {
                var monthStart = fromDate.AddMonths(i);
                var monthEnd = monthStart.AddMonths(1);
                var monthLabel = monthStart.ToString("MM/yyyy");
                var amount = payments
                    .Where(p => p.PaymentDate >= monthStart && p.PaymentDate < monthEnd)
                    .Sum(p => p.AmountPaid);
                result.Add(new { Month = monthLabel, Amount = amount });
            }

            return Ok(result);
        }

        // ==========================================
        // THỐNG KÊ TỔNG QUAN NÂNG CAO
        // ==========================================
        [HttpGet("Dashboard/AdvancedSummary")]
        public async Task<IActionResult> GetAdvancedSummary()
        {
            var today = DateTime.Today;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // Doanh thu hôm nay
            var revenueToday = await _context.Payments
                .Where(p => p.PaymentDate >= today && p.PaymentDate < today.AddDays(1))
                .SumAsync(p => (decimal?)p.AmountPaid ?? 0);

            // Doanh thu tháng này
            var revenueMonth = await _context.Payments
                .Where(p => p.PaymentDate >= startOfMonth)
                .SumAsync(p => (decimal?)p.AmountPaid ?? 0);

            // Tổng doanh thu
            var revenueTotal = await _context.Invoices
                .SumAsync(i => (decimal?)i.FinalTotal ?? 0);

            // Tổng phòng
            var totalRooms = await _context.Rooms.CountAsync();
            var occupiedRooms = await _context.Rooms.CountAsync(r => r.Status == "Occupied");
            var availableRooms = await _context.Rooms.CountAsync(r => r.Status == "Available");
            var maintenanceRooms = await _context.Rooms.CountAsync(r => r.Status == "Maintenance" || r.Status == "Cleaning");

            // Booking hôm nay
            var checkedInToday = await _context.Bookings.CountAsync(b => b.Status == "CheckedIn");
            var totalBookings = await _context.Bookings.CountAsync();
            var completedBookings = await _context.Bookings.CountAsync(b => b.Status == "Completed");

            // Doanh thu tháng trước (để so sánh)
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var revenueLastMonth = await _context.Payments
                .Where(p => p.PaymentDate >= startOfLastMonth && p.PaymentDate < startOfMonth)
                .SumAsync(p => (decimal?)p.AmountPaid ?? 0);

            decimal growthPercent = revenueLastMonth > 0 
                ? Math.Round((revenueMonth - revenueLastMonth) / revenueLastMonth * 100, 1) 
                : 0;

            return Ok(new {
                RevenueToday = revenueToday,
                RevenueMonth = revenueMonth,
                RevenueTotal = revenueTotal,
                RevenueLastMonth = revenueLastMonth,
                GrowthPercent = growthPercent,
                TotalRooms = totalRooms,
                OccupiedRooms = occupiedRooms,
                AvailableRooms = availableRooms,
                MaintenanceRooms = maintenanceRooms,
                OccupancyRate = totalRooms > 0 ? Math.Round((decimal)occupiedRooms / totalRooms * 100, 1) : 0,
                CheckedInToday = checkedInToday,
                TotalBookings = totalBookings,
                CompletedBookings = completedBookings
            });
        }
            [HttpGet("ExportExcel")]
        public async Task<IActionResult> ExportExcel()
        {
            // 1. Lấy dữ liệu doanh thu từ bảng Invoice (dùng FinalTotal Duy vừa tìm thấy)
            var data = await _context.Invoices
                .Where(i => i.Status == "Paid")
                .Select(i => new { i.Id, i.FinalTotal })
                .ToListAsync();

            using (var workbook = new ClosedXML.Excel.XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("BaoCaoDoanhThu");

                // 2. Tạo tiêu đề cột
                worksheet.Cell(1, 1).Value = "Mã Hóa Đơn (Invoice ID)";
                worksheet.Cell(1, 2).Value = "Tổng Tiền (Final Total)";

                // Định dạng tiêu đề cho đẹp
                var headerRow = worksheet.Row(1);
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.AliceBlue;

                // 3. Đổ dữ liệu vào các dòng
                for (int i = 0; i < data.Count; i++)
                {
                    worksheet.Cell(i + 2, 1).Value = data[i].Id;
                    worksheet.Cell(i + 2, 2).Value = data[i].FinalTotal ?? 0;
                    // Định dạng tiền tệ
                    worksheet.Cell(i + 2, 2).Style.NumberFormat.Format = "#,##0";
                }

                worksheet.Columns().AdjustToContents(); // Tự động căn chỉnh độ rộng cột

                // 4. Xuất file về trình duyệt
                using (var stream = new System.IO.MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(
                        content, 
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                        "BaoCaoDoanhThu_Hotel.xlsx"
                    );
                }
            }
        }
    }
}