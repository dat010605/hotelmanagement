using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Net;           
using System.Net.Mail;      
using Microsoft.AspNetCore.SignalR; // 🌟 Thêm thư viện SignalR
using HotelManagement.API.Hubs;  
using HotelManagement.API.Models;
using HotelManagement.DTOs;

namespace HotelManagement.API.Controllers 
{
    public class CreateUserWithEmailRequest
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public int RoleId { get; set; }
        public bool SendEmail { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext; // 🌟 Tiêm SignalR Hub vào đây

        public UsersController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // 1. LẤY DANH SÁCH TÀI KHOẢN + TÌM KIẾM + LỌC
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? searchTerm, [FromQuery] int? roleId, [FromQuery] bool? status)
        {
            try 
            {
                var query = _context.Users.Include(u => u.Role).AsQueryable();

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var search = searchTerm.ToLower();
                    query = query.Where(u => u.FullName.ToLower().Contains(search) || u.Email.ToLower().Contains(search) || (u.Phone != null && u.Phone.Contains(search)));
                }

                if (roleId.HasValue && roleId.Value > 0)
                    query = query.Where(u => u.RoleId == roleId.Value);

                if (status.HasValue)
                    query = query.Where(u => u.Status == status.Value);

                var users = await query
                    .Select(u => new { 
                        u.Id, u.FullName, u.Email, u.Phone, 
                        Role = u.Role.Name, u.Status, u.RoleId 
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // =================================================================
        // 🌟 2. TẠO TÀI KHOẢN MỚI TÍCH HỢP GMAIL TỰ ĐỘNG
        // =================================================================
        [HttpPost("create-with-email")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUserWithEmail([FromBody] CreateUserWithEmailRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email đã tồn tại trong hệ thống.");

            string rawPassword = request.SendEmail ? Guid.NewGuid().ToString().Substring(0, 6).ToUpper() : "123456";

            var newUser = new User {
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                RoleId = request.RoleId, 
                Status = true, 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(rawPassword) 
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(); 

            if (request.SendEmail)
            {
                try
                {
                    string fromEmail = "hotelnhungnguoiban@gmail.com"; 
                    string appPassword = "uigpxqvgkoyjkctb"; 

                    var fromAddress = new MailAddress(fromEmail, "Hệ thống Hotel ERP");
                    var toAddress = new MailAddress(request.Email);
                    string subject = "Tài khoản đăng nhập hệ thống Hotel ERP";
                    string body = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                            <h2 style='color: #1890ff;'>Chào {request.FullName},</h2>
                            <p>Tài khoản của bạn trên hệ thống quản trị <b>Hotel ERP</b> đã được khởi tạo.</p>
                            <div style='background-color: #f0f2f5; padding: 15px; border-radius: 8px; margin: 15px 0;'>
                                <p style='margin: 5px 0;'><b>Tên đăng nhập (Email):</b> {request.Email}</p>
                                <p style='margin: 5px 0;'><b>Mật khẩu tạm thời:</b> <span style='color: red; font-size: 18px; font-weight: bold;'>{rawPassword}</span></p>
                            </div>
                            <p>Vui lòng đăng nhập vào hệ thống và đổi mật khẩu ngay lập tức để bảo đảm an toàn thông tin.</p>
                            <br/>
                            <p>Trân trọng,<br/><b>Ban Quản Trị Hotel ERP</b></p>
                        </div>";

                    var smtp = new SmtpClient
                    {
                        Host = "smtp.gmail.com",
                        Port = 587,
                     EnableSsl = true,
                        DeliveryMethod = SmtpDeliveryMethod.Network,
                        UseDefaultCredentials = false,
                        Credentials = new NetworkCredential(fromAddress.Address, appPassword)
                    };

                    using (var message = new MailMessage(fromAddress, toAddress)
                    {
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    })
                    {
                        await smtp.SendMailAsync(message); 
                    }
                }
                catch (Exception ex)
                {
                    return Ok(new { Message = $"Đã tạo TK (Mật khẩu: {rawPassword}), nhưng GỬI EMAIL THẤT BẠI: {ex.Message}", UserId = newUser.Id });
                }
            }

            return Ok(new { Message = "Tạo tài khoản thành công" + (request.SendEmail ? " và đã gửi Email!" : ""), UserId = newUser.Id });
        }

        // 3. LẤY THÔNG TIN CÁ NHÂN (ME)
        [HttpGet("Me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await _context.Users.Include(u => u.Role)
                .Where(u => u.Id == userId)
                .Select(u => new { u.Id, u.FullName, u.Email, u.Phone, Role = u.Role.Name })
                .FirstOrDefaultAsync();
            return Ok(user);
        }

        // 4. ĐỔI MẬT KHẨU (Tự đổi)
        [HttpPatch("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Không tìm thấy user");

            bool isOldPasswordValid = user.PasswordHash.StartsWith("$") 
                ? BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash)
                : (user.PasswordHash == request.OldPassword);

            if (!isOldPasswordValid) return BadRequest("Mật khẩu cũ không chính xác.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return Ok("Đổi mật khẩu thành công.");
        }

        // 5. RESET MẬT KHẨU (Chỉ Admin)
        [HttpPatch("{id}/ResetPassword")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ResetPassword(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy user");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"); 
            await _context.SaveChangesAsync();
            return Ok($"Đã reset mật khẩu về 123456.");
        }

        // =================================================================
        // 🌟 6. KHÓA / MỞ KHÓA TÀI KHOẢN (VỚI TÍNH NĂNG ĐÁ VĂNG BẰNG SIGNALR)
        // =================================================================
        [HttpPatch("{id}/ToggleStatus")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var targetUser = await _context.Users.FindAsync(id);
            if (targetUser == null) return NotFound();

            // 🌟 THUẬT TOÁN BẢO VỆ ADMIN: Chống khóa Admin cuối cùng
            if (targetUser.Status == true && targetUser.RoleId == 1) 
            {
                var activeAdminCount = await _context.Users.CountAsync(u => u.RoleId == 1 && u.Status == true);
                if (activeAdminCount <= 1)
                {
                    return BadRequest("Hệ thống phải có ít nhất 1 Admin hoạt động. Không thể khóa tài khoản này!");
                }
            }

            targetUser.Status = !targetUser.Status; 
            await _context.SaveChangesAsync();

            // 🌟 MA PHÁP SIGNALR: Đẩy văng người dùng bị khóa ra trang Login
            if (targetUser.Status == false) 
            {
                await _hubContext.Clients.All.SendAsync("ForceLogout", targetUser.Id.ToString());
            }

            return Ok(new { Message = "Cập nhật trạng thái thành công", Status = targetUser.Status });
        }

        // 7. PHÂN QUYỀN LẠI (Đổi vai trò)
        [HttpPut("{id}/Roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] int newRoleId)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Không tìm thấy user");

            var roleExists = await _context.Roles.AnyAsync(r => r.Id == newRoleId);
            if (!roleExists) return BadRequest("Quyền không tồn tại.");

            user.RoleId = newRoleId;
            await _context.SaveChangesAsync(); 
            return Ok("Cập nhật vai trò thành công.");
        }
    }
}
 
