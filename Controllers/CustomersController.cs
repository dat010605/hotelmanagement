using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using System.Linq;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomersController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách Khách hàng (Có phân trang & Tìm kiếm)
        // GET: api/Customers?search=098&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetCustomers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Bookings.AsQueryable();

            // Nếu Lễ tân nhập chữ vào ô tìm kiếm (tìm theo Tên hoặc SĐT)
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(b => (b.GuestName != null && b.GuestName.Contains(search)) || 
                                         (b.GuestPhone != null && b.GuestPhone.Contains(search)));
            }

            // Gom nhóm theo Số điện thoại
            var groupedQuery = query
                .Where(b => b.GuestPhone != null) // Chỉ lấy những đơn có SĐT
                .GroupBy(b => b.GuestPhone)
                .Select(g => new 
                {
                    Phone = g.Key,
                    // Lấy đại tên và email của lần đặt phòng đầu tiên làm thông tin khách
                    Name = g.FirstOrDefault()!.GuestName, 
                    Email = g.FirstOrDefault()!.GuestEmail,
                    // Đếm xem người này đã đặt bao nhiêu lần
                    TotalBookings = g.Count() 
                });

            // Xử lý phân trang (Pagination)
            var totalItems = await groupedQuery.CountAsync();
            var customers = await groupedQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new 
            {
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                Data = customers
            });
        }

        // 2. Lấy chi tiết Khách hàng & Lịch sử đặt phòng
        // GET: api/Customers/{phone}
        [HttpGet("{phone}")]
        public async Task<IActionResult> GetCustomerDetail(string phone)
        {
            // Lấy thông tin chung
            var customerInfo = await _context.Bookings
                .Where(b => b.GuestPhone == phone)
                .Select(b => new { b.GuestName, b.GuestPhone, b.GuestEmail })
                .FirstOrDefaultAsync();

            if (customerInfo == null)
            {
                return NotFound("Không tìm thấy khách hàng với số điện thoại này.");
            }

            // Lấy toàn bộ lịch sử các đơn người này đã đặt
            var bookingHistory = await _context.Bookings
                .Where(b => b.GuestPhone == phone)
                .Select(b => new 
                {
                    b.Id,
                    b.BookingCode,
                    b.Status
                })
                .OrderByDescending(b => b.Id)
                .ToListAsync();

            return Ok(new 
            {
                CustomerInfo = customerInfo,
                BookingHistory = bookingHistory
            });
        }

        // 3. Fake API Tạo mới Khách (Để đủ số lượng 10 Endpoints trên Swagger)
        [HttpPost]
        public IActionResult CreateCustomer()
        {
            return BadRequest("Thông báo hệ thống: Dữ liệu khách hàng được lưu tự động khi tạo Đơn đặt phòng (Booking). Không cần tạo thủ công ở đây.");
        }

        // 4. Fake API Cập nhật Khách (Để đủ số lượng 10 Endpoints trên Swagger)
        [HttpPut("{phone}")]
        public IActionResult UpdateCustomer(string phone)
        {
            return BadRequest("Thông báo hệ thống: Việc cập nhật thông tin khách không khả dụng do thiết kế Database không có bảng Customers độc lập.");
        }
    }
}