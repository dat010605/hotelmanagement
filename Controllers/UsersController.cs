using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using HotelManagement.API.Models;
using HotelManagement.DTOs;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    // 1. LẤY DANH SÁCH TÀI KHOẢN + TÌM KIẾM + LỌC
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAllUsers(
        [FromQuery] string? searchTerm, 
        [FromQuery] int? roleId, 
        [FromQuery] bool? status)
    {
        try 
        {
            // Bắt đầu xây dựng truy vấn (Chưa thực thi vào SQL)
            var query = _context.Users.Include(u => u.Role).AsQueryable();

            // A. Tìm kiếm theo Tên, Email hoặc SĐT
            if (!string.IsNullOrEmpty(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(u => 
                    u.FullName.ToLower().Contains(search) || 
                    u.Email.ToLower().Contains(search) || 
                    (u.Phone != null && u.Phone.Contains(search))
                );
            }

            // B. Lọc theo Vai trò (Role ID)
            if (roleId.HasValue && roleId.Value > 0)
            {
                query = query.Where(u => u.RoleId == roleId.Value);
            }

            // C. Lọc theo Trạng thái (Hoạt động/Khóa)
            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            // D. Thực thi và trả về dữ liệu chuẩn cho React
            var users = await query
                .Select(u => new { 
                    u.Id, 
                    u.FullName, 
                    u.Email, 
                    u.Phone, 
                    Role = u.Role.Name, // Hiện Admin, Manager...
                    u.Status,
                    u.RoleId // Trả về để React biết User thuộc Role nào khi bấm Sửa
                })
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            // Trả về lỗi để Frontend ngừng xoay vòng và hiển thị thông báo
            return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
        }
    }

    // 2. TẠO TÀI KHOẢN MỚI
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email đã tồn tại trong hệ thống.");

        string passwordToHash = string.IsNullOrEmpty(request.Password) ? "123456" : request.Password;

        var newUser = new User {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            RoleId = request.RoleId, 
            Status = true, 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToHash) 
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync(); 
        return Ok(new { Message = "Tạo tài khoản thành công", UserId = newUser.Id });
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

    // 6. KHÓA / MỞ KHÓA (Toggle Status)
    [HttpPatch("{id}/ToggleStatus")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.Status = !user.Status; 
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Cập nhật trạng thái thành công", Status = user.Status });
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