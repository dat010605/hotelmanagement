using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BCrypt.Net;
using HotelManagement.API.Models;
[Route("api/[controller]")]
[ApiController]
[Authorize] // Bắt buộc phải có JWT Token mới vào được controller này
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    // 43. LẤY DANH SÁCH TÀI KHOẢN (Chỉ Admin hoặc Manager mới được xem)
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users.Include(u => u.Role)
            .Select(u => new { u.Id, u.FullName, u.Email, u.Phone, Role = u.Role.Name, u.Status })
            .ToListAsync();
        return Ok(users);
    }

    // 44. TẠO TÀI KHOẢN MỚI CHO NHÂN VIÊN
    [HttpPost]
    [Authorize(Roles = "Admin")] // Chỉ Admin được tạo tài khoản
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (_context.Users.Any(u => u.Email == request.Email))
            return BadRequest("Email đã tồn tại trong hệ thống.");

        var newUser = new User {
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            RoleId = request.RoleId,
            Status = true, // Mặc định Active
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password) // Mã hóa Pass
        };
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Tạo tài khoản thành công", UserId = newUser.Id });
    }

    // 45. LẤY THÔNG TIN CÁ NHÂN (ME) - Lấy ID từ Token giải mã
    [HttpGet("Me")]
    public async Task<IActionResult> GetMyProfile()
    {
        // Lấy UserID từ JWT Token của người đang Request
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var user = await _context.Users.Include(u => u.Role)
            .Where(u => u.Id == userId)
            .Select(u => new { u.Id, u.FullName, u.Email, u.Phone, Role = u.Role.Name })
            .FirstOrDefaultAsync();
            
        return Ok(user);
    }

    // 46. ĐỔI MẬT KHẨU (Tự đổi cho bản thân)
   // 46. ĐỔI MẬT KHẨU (Tự đổi cho bản thân)
    [HttpPatch("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await _context.Users.FindAsync(userId);

        if (user == null) return NotFound("Không tìm thấy user");

        bool isOldPasswordValid = false;

        // Xử lý dữ liệu: Phân biệt mật khẩu mẫu và mật khẩu đã mã hóa BCrypt
        if (user.PasswordHash != null && user.PasswordHash.StartsWith("$"))
        {
            // Nếu là mật khẩu chuẩn (đã đổi trước đó)
            isOldPasswordValid = BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash);
        }
        else
        {
            // Nếu là mật khẩu từ dữ liệu mẫu ("hash1", "hash2"...)
            isOldPasswordValid = (user.PasswordHash == request.OldPassword);
        }

        if (!isOldPasswordValid)
            return BadRequest("Mật khẩu cũ không chính xác.");

        // Mã hóa mật khẩu mới theo chuẩn BCrypt và lưu lại
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        
        await _context.SaveChangesAsync();
        return Ok("Đổi mật khẩu thành công.");
    }

    // 47. RESET MẬT KHẨU VỀ MẶC ĐỊNH (Chỉ Admin)
    [HttpPatch("{id}/ResetPassword")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResetPassword(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy user");

        // Đặt pass mặc định là 123456 (Hoặc số điện thoại của họ)
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"); 
        await _context.SaveChangesAsync();
        return Ok($"Đã reset mật khẩu của {user.FullName} về mặc định (123456).");
    }

    // 48. KHÓA / MỞ KHÓA TÀI KHOẢN (Toggle Status)
    [HttpPatch("{id}/ToggleStatus")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy user");

        user.Status = !user.Status; // Đảo ngược trạng thái
        await _context.SaveChangesAsync();
        var statusMsg = user.Status == true ? "mở khóa" : "bị khóa";
        return Ok($"Tài khoản {user.FullName} đã {statusMsg}.");
    }

    // 49. LẤY DANH SÁCH QUYỀN (Roles)
    [HttpGet("api/Users/roles-list")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles.Select(r => new { r.Id, r.Name, r.Description }).ToListAsync();
        return Ok(roles);
    }

    // 50. PHÂN QUYỀN LẠI CHO TÀI KHOẢN
    [HttpPut("{id}/Roles")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] int newRoleId)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound("Không tìm thấy user");

        var roleExists = await _context.Roles.AnyAsync(r => r.Id == newRoleId);
        if (!roleExists) return BadRequest("Quyền không tồn tại trong hệ thống.");

        user.RoleId = newRoleId;
        await _context.SaveChangesAsync();
        return Ok($"Đã cập nhật quyền thành công cho {user.FullName}.");
    }
}