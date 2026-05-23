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

        // Múi giờ Việt Nam (UTC+7) — dùng nhất quán cho mọi DateTime
        private static readonly TimeZoneInfo VnTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        public UserProfileController(AppDbContext context, IConfiguration config)
        {
            _context = context;

            var account = new Account(
                config["CloudinarySettings:CloudName"],
                config["CloudinarySettings:ApiKey"],
                config["CloudinarySettings:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
        }

        // Helper lấy UserId từ Token — trả 0 nếu không parse được
        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                return 0;
            return id;
        }

        // ─────────────────────────────────────────────────────────────
        // 1. LẤY THÔNG TIN CÁ NHÂN
        //    Trả thêm dateOfBirthLocked = true nếu đã có DOB
        //    → Frontend dùng để disable ô nhập DOB, ngăn user sửa trên UI
        // ─────────────────────────────────────────────────────────────
        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var user = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Phone,
                    u.AvatarUrl,
                    u.DateOfBirth,
                    u.LastVoucherYear,
                    // Cờ để Frontend disable DatePicker nếu DOB đã được đặt
                    DateOfBirthLocked = u.DateOfBirth.HasValue
                })
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("Không tìm thấy người dùng");
            return Ok(user);
        }

        // ─────────────────────────────────────────────────────────────
        // 2. CẬP NHẬT THÔNG TIN
        //    🔒 GUARD CHỐNG BÀO MÃ: Nếu user đã có DateOfBirth → 400 NGAY LẬP TỨC
        //    Bảo vệ ở tầng API, hoạt động kể cả khi bypass UI bằng Postman/cURL
        // ─────────────────────────────────────────────────────────────
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Cập nhật tên + phone luôn được phép
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName.Trim();

            user.Phone = dto.Phone?.Trim();

            // ── GUARD: Chặn đổi ngày sinh để bào mã voucher ──────────
            if (!string.IsNullOrWhiteSpace(dto.DateOfBirth))
            {
                // ❌ Đã có DOB → từ chối tuyệt đối (kể cả qua Postman)
                if (user.DateOfBirth.HasValue)
                {
                    return BadRequest(new
                    {
                        message = "Ngày sinh đã được xác nhận và không thể thay đổi. Nếu cần hỗ trợ, vui lòng liên hệ quầy lễ tân.",
                        code = "DOB_LOCKED"
                    });
                }

                // Validate format
                if (!DateOnly.TryParse(dto.DateOfBirth, out var dob))
                {
                    return BadRequest(new { message = "Định dạng ngày sinh không hợp lệ. Vui lòng dùng YYYY-MM-DD." });
                }

                // Múi giờ Việt Nam để so sánh chính xác
                var nowVn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VnTimeZone);
                var todayVn = DateOnly.FromDateTime(nowVn);

                if (dob >= todayVn)
                    return BadRequest(new { message = "Ngày sinh phải là ngày trong quá khứ." });

                if (dob.Year < 1900)
                    return BadRequest(new { message = "Năm sinh không hợp lệ (phải từ 1900 trở đi)." });

                // Tính tuổi chuẩn, tránh lỗi năm nhuận
                int age = todayVn.Year - dob.Year;
                if (todayVn < new DateOnly(todayVn.Year, dob.Month, dob.Day)) age--;
                if (age < 10 || age > 120)
                    return BadRequest(new { message = "Ngày sinh không hợp lệ (tuổi phải trong khoảng 10–120)." });

                // ✅ Lần đầu đặt DOB — ghi vào DB
                user.DateOfBirth = dob;
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = "Cập nhật thành công",
                fullName = user.FullName,
                dateOfBirthLocked = user.DateOfBirth.HasValue
            });
        }

        // ─────────────────────────────────────────────────────────────
        // 3. ĐỔI MẬT KHẨU
        // ─────────────────────────────────────────────────────────────
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
                return BadRequest(new { message = "Mật khẩu cũ không chính xác" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đổi mật khẩu thành công" });
        }

        // ─────────────────────────────────────────────────────────────
        // 4. UPLOAD AVATAR LÊN CLOUDINARY
        // ─────────────────────────────────────────────────────────────
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File không hợp lệ");

            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            var uploadResult = new ImageUploadResult();
            using (var stream = file.OpenReadStream())
            {
                var uploadParams = new ImageUploadParams()
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "hotel_management/avatars",
                    Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            if (uploadResult.Error != null)
                return BadRequest(uploadResult.Error.Message);

            user.AvatarUrl = uploadResult.SecureUrl.AbsoluteUri;
            await _context.SaveChangesAsync();

            return Ok(new { avatarUrl = user.AvatarUrl });
        }
    }
}