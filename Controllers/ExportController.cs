using ClosedXML.Excel;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Ionic.Zip; 

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("audit-log")]
        public async Task<IActionResult> ExportAuditLog()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("Vui lòng đăng nhập");

            int currentUserId = int.Parse(userIdClaim);
            bool isAdmin = roleClaim == "Admin" || roleClaim == "Manager";

            var query = _context.AuditLogs.AsQueryable();
            if (!isAdmin) query = query.Where(x => x.UserId == currentUserId);

            var data = await query.OrderByDescending(x => x.CreatedAt).ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("AuditLogs");
                var headerRow = worksheet.Row(1);
                headerRow.Cell(1).Value = "ID";
                headerRow.Cell(2).Value = "Thao tác";
                headerRow.Cell(3).Value = "Bảng dữ liệu";
                headerRow.Cell(4).Value = "ID Bản ghi";
                headerRow.Cell(5).Value = "Thời gian";
                headerRow.Style.Font.Bold = true;
                headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

                for (int i = 0; i < data.Count; i++)
                {
                    var row = i + 2;
                    worksheet.Cell(row, 1).Value = data[i].Id;
                    worksheet.Cell(row, 2).Value = data[i].Action;
                    worksheet.Cell(row, 3).Value = data[i].TableName;
                    worksheet.Cell(row, 4).Value = data[i].RecordId;
                    worksheet.Cell(row, 5).Value = data[i].CreatedAt?.ToString("dd/MM/yyyy HH:mm:ss");
                }
                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", isAdmin ? "Full_AuditLog.xlsx" : $"My_AuditLog_{currentUserId}.xlsx");
                }
            }
        }

        // 2. API Xuất Excel Vật tư (Duy đã có, mình tối ưu lại cho chuẩn cột)
        [HttpGet("inventory-report")]
        public async Task<IActionResult> ExportInventory()
        {
            var equipments = await _context.Equipments.ToListAsync();
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Kho Vat Tu");
                worksheet.Cell(1, 1).Value = "Mã Vật Tư";
                worksheet.Cell(1, 2).Value = "Tên Vật Tư";
                worksheet.Cell(1, 3).Value = "Giá Nhập (C)";
                worksheet.Cell(1, 4).Value = "SL Hỏng (D)";
                worksheet.Cell(1, 5).Value = "Thành Tiền Đền Bù (E)";
                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Row(1).Style.Fill.BackgroundColor = XLColor.Cyan;

                for (int i = 0; i < equipments.Count; i++)
                {
                    var row = i + 2;
                    var item = equipments[i];
                    worksheet.Cell(row, 1).Value = item.ItemCode;
                    worksheet.Cell(row, 2).Value = item.Name;
                    worksheet.Cell(row, 3).Value = item.BasePrice;
                    worksheet.Cell(row, 4).Value = item.DamagedQuantity;
                    worksheet.Cell(row, 5).FormulaA1 = $"=C{row}*D{row}"; 
                    worksheet.Cell(row, 3).Style.NumberFormat.Format = "#,##0\" VND\"";
                    worksheet.Cell(row, 5).Style.NumberFormat.Format = "#,##0\" VND\"";
                }
                worksheet.Columns().AdjustToContents();
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Bao_Cao_Vat_Tu.xlsx");
                }
            }
        }
       [HttpGet("export-inventory-zip")]
public async Task<IActionResult> ExportInventoryZip()
{
    
    var equipments = await _context.Equipments.ToListAsync();
    using (var httpClient = new HttpClient()) // Thêm cái này để tải ảnh từ Web
    using (var zip = new Ionic.Zip.ZipFile())
    {
        using (var workbook = new ClosedXML.Excel.XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("VatTu");
            worksheet.Cell(1, 1).Value = "Mã Vật Tư";
            worksheet.Cell(1, 2).Value = "Tên Vật Tư";

            for (int i = 0; i < equipments.Count; i++)
            {
                var row = i + 2;
                var item = equipments[i];
                worksheet.Cell(row, 1).Value = item.ItemCode;
                worksheet.Cell(row, 2).Value = item.Name;

                // XỬ LÝ ẢNH TỪ CLOUDINARY
                if (!string.IsNullOrEmpty(item.ImageUrl))
                {
                    try 
                    {
                        // Tải dữ liệu ảnh từ URL Cloudinary về bộ nhớ
                        var imageBytes = await httpClient.GetByteArrayAsync(item.ImageUrl);
                        var extension = Path.GetExtension(item.ImageUrl).Split('?')[0]; // Lấy đuôi file (.jpg, .png)
                        
                        // Đổi tên ảnh theo mã vật tư và cho vào folder Images trong ZIP
                        zip.AddEntry($"Images/{item.ItemCode}{extension}", imageBytes);
                    }
                    catch { /* Nếu ảnh lỗi thì bỏ qua, vẫn xuất Excel tiếp */ }
                }
            }

            using (var ms = new MemoryStream())
            {
                workbook.SaveAs(ms);
                zip.AddEntry("DanhSachVatTu.xlsx", ms.ToArray());
            }
        }

        using (var zipStream = new MemoryStream())
        {
            zip.Save(zipStream);
            return File(zipStream.ToArray(), "application/zip", "Inventory_Full_Data.zip");
        }
    }
}
    }
}