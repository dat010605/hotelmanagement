using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServicesController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // 1. GET: Lấy danh sách tất cả dịch vụ
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetAllServices()
    {
        var services = await _context.Services
            .Include(s => s.Category)
            .Select(s => new {
                s.Id,
                s.Name,
                // ĐÃ SỬA: Xóa s.Description và s.Status vì bảng Service không có 2 cột này
                s.Price,
                s.Unit, // Bổ sung s.Unit (Đơn vị tính) cho đầy đủ
                CategoryId = s.CategoryId,
                CategoryName = s.Category != null ? s.Category.Name : "Khác"
            })
            .ToListAsync();

        return Ok(services);
    }

    // ==========================================
    // 2. GET: Lấy thông tin chi tiết 1 dịch vụ
    // ==========================================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetServiceById(int id)
    {
        var service = await _context.Services
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null) return NotFound("Không tìm thấy dịch vụ này.");

        return Ok(new {
            service.Id,
            service.Name,
            // ĐÃ SỬA: Xóa s.Description và s.Status
            service.Price,
            service.Unit,
            CategoryId = service.CategoryId,
            CategoryName = service.Category != null ? service.Category.Name : "Khác"
        });
    }

    // ==========================================
    // 3. POST: Thêm mới một dịch vụ
    // ==========================================
    [HttpPost]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            // ĐÃ SỬA: Xóa Description và Status
            Price = dto.Price,
            CategoryId = dto.CategoryId
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServiceById), new { id = service.Id }, new { Message = "Đã thêm dịch vụ thành công!", ServiceId = service.Id });
    }

    // ==========================================
    // 4. PUT: Cập nhật thông tin dịch vụ
    // ==========================================
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return NotFound("Không tìm thấy dịch vụ để cập nhật.");

        service.Name = dto.Name;
        // ĐÃ SỬA: Xóa update Description và Status
        service.Price = dto.Price;
        service.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Cập nhật dịch vụ thành công!" });
    }

    // ==========================================
    // 5. DELETE: Xóa dịch vụ
    // ==========================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null) return NotFound("Không tìm thấy dịch vụ để xóa.");

        // ĐÃ SỬA: Truy vấn qua bảng OrderServiceDetails (Vì bảng này lưu ServiceId)
        var isUsed = await _context.OrderServiceDetails.AnyAsync(osd => osd.ServiceId == id);
        if (isUsed)
        {
            // Vì bảng Service không có cột Status nên không thể xóa mềm (Soft Delete).
            // Bắt buộc phải trả về lỗi để ngăn việc xóa cứng (gây lỗi database).
            return BadRequest("Dịch vụ này đã được khách hàng sử dụng nên không thể xóa để bảo toàn dữ liệu lịch sử.");
        }

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Đã xóa dịch vụ thành công!" });
    }

    // ==========================================
    // 6. POST: Khách hàng gọi dịch vụ (Order Service)
    // ==========================================
    [HttpPost("order")]
    public async Task<IActionResult> OrderService([FromBody] OrderServiceRequestDto request)
    {
        var bookingDetail = await _context.BookingDetails.FindAsync(request.BookingDetailId);
        if (bookingDetail == null) return NotFound("Không tìm thấy thông tin phòng đang thuê.");

        var service = await _context.Services.FindAsync(request.ServiceId);
        if (service == null) return BadRequest("Dịch vụ không tồn tại.");

        decimal totalAmount = request.Quantity * service.Price;

        // ĐÃ SỬA: Cấu trúc lưu 2 bảng (OrderServices lưu Hóa đơn tổng, OrderServiceDetails lưu chi tiết món)
        var orderService = new OrderService
        {
            BookingDetailId = request.BookingDetailId,
            OrderDate = DateTime.Now,
            TotalAmount = totalAmount,
            Status = "Delivered"
        };

        _context.OrderServices.Add(orderService);
        await _context.SaveChangesAsync(); // Lưu để EF Core sinh ra Id

        var orderDetail = new OrderServiceDetail
        {
            OrderServiceId = orderService.Id,
            ServiceId = request.ServiceId,
            Quantity = request.Quantity,
            UnitPrice = service.Price
        };

        _context.OrderServiceDetails.Add(orderDetail);
        await _context.SaveChangesAsync();

        return Ok(new { 
            Message = "Gọi dịch vụ thành công!", 
            TotalAmount = totalAmount 
        });
    }

    // ==========================================
    // 7. PUT: Hủy dịch vụ khách đã gọi (Cancel Order)
    // ==========================================
    [HttpPut("order/{orderId}/cancel")]
    public async Task<IActionResult> CancelOrderService(int orderId)
    {
        var order = await _context.OrderServices.FindAsync(orderId);
        
        if (order == null) return NotFound("Không tìm thấy đơn gọi dịch vụ này.");

        if (order.Status == "Cancelled") 
            return BadRequest("Dịch vụ này đã được hủy từ trước.");

        order.Status = "Cancelled";
        order.TotalAmount = 0; 

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Đã hủy đơn gọi dịch vụ thành công, khách sẽ không bị tính tiền khoản này!" });
    }
}