using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using HotelManagement.API.Models;
using HotelManagement.API.Hubs;
using HotelManagement.API.DTOs;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu có Token
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public EmployeesController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // 1. LẤY DANH SÁCH NHÂN VIÊN (Lọc bỏ khách hàng)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
           var query = _context.Users.Include(u => u.Role).AsQueryable();

            // Chỉ lấy những người có Role không phải là 'Guest' (Khách hàng)
            var employees = query.Where(u => u.Role.Name != "Guest");

            if (!string.IsNullOrEmpty(search))
            {
                employees = employees.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));
            }

            var result = await employees.Select(u => new EmployeeResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                RoleName = u.Role != null ? u.Role.Name : "N/A",
                Status = u.Status
            }).ToListAsync();

            return Ok(result);
        }

        // 2. XEM CHI TIẾT NHÂN VIÊN
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users.Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.Id == id);
            
            if (user == null) return NotFound("Không tìm thấy nhân viên.");

            return Ok(user);
        }
        // API: Thêm mới nhân viên
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email này đã được sử dụng.");

            var newEmployee = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password), // Mã hóa mật khẩu
                RoleId = request.RoleId,
                Status = true, // Mặc định là đang hoạt động
                MembershipId = 1 // Giá trị mặc định tùy DB của bạn
            };

            _context.Users.Add(newEmployee);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Nhân sự mới gia nhập: {request.FullName}!");

            return Ok(new { message = "Thêm nhân viên mới thành công!" });
        }
        // 3. CẬP NHẬT THÔNG TIN NHÂN VIÊN (Dành cho Quản trị viên)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.FullName = request.FullName;
            user.Phone = request.Phone;
            user.RoleId = request.RoleId;
            user.Status = request.Status;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Cập nhật hồ sơ nhân viên: {user.FullName}");
            return Ok(new { message = "Cập nhật hồ sơ nhân sự thành công." });
        }

        // 4. XÓA MỀM (SOFT DELETE)
        // Chuyển Status về false thay vì xóa hẳn khỏi SQL
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Status = false; // Đánh dấu nghỉ việc/khóa tài khoản
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Nhân sự {user.FullName} đã chuyển trạng thái ngừng hoạt động.");

            return Ok(new { message = "Đã chuyển trạng thái nhân viên sang Soft Delete (Status = false)." });
        }
    }
}