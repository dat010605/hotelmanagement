using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Cloudinary _cloudinary;

        public UserProfileController(AppDbContext context, IConfiguration config)
        {
            _context = context;

            // Khởi tạo Cloudinary từ cấu hình appsettings
            var account = new Account(
                config["CloudinarySettings:CloudName"],
                config["CloudinarySettings:ApiKey"],
                config["CloudinarySettings:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
        }

        // Helper lấy UserId từ Token
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        // 1. LẤY THÔNG TIN CÁ NHÂN
        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetUserId();
            var user = await _context.Users
                .Select(u => new { u.Id, u.FullName, u.Email, u.Phone, u.AvatarUrl })
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("Không tìm thấy người dùng");
            return Ok(user);
        }

        // 2. CẬP NHẬT THÔNG TIN (Họ tên, SĐT)
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            user.FullName = dto.FullName;
            user.Phone = dto.Phone;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công", fullName = user.FullName });
        }

        // 3. ĐỔI MẬT KHẨU (Dùng BCrypt)
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
                return BadRequest("Mật khẩu cũ không chính xác");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đổi mật khẩu thành công" });
        }

        // 4. UPLOAD AVATAR LÊN CLOUDINARY
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File không hợp lệ");

            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Thực hiện upload lên Cloudinary
            var uploadResult = new ImageUploadResult();
            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "hotel_management/avatars", // Tạo thư mục riêng trên Cloudinary
                    Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face") // Tự cắt ảnh vuông lấy khuôn mặt
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null) 
                return BadRequest(uploadResult.Error.Message);

            // Lưu URL tuyệt đối của Cloudinary vào Database
            user.AvatarUrl = uploadResult.SecureUrl.AbsoluteUri; 
            await _context.SaveChangesAsync();

            return Ok(new { avatarUrl = user.AvatarUrl });
        }
    }
}