using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Manager")]
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