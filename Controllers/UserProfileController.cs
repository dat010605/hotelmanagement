using HotelManagement.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập
    public class UserProfileController : ControllerBase
    {
        // 1. GET /api/UserProfile/my-profile
        [HttpGet("my-profile")] 
        public async Task<IActionResult> GetMyProfile() 
        { 
            return Ok(new { Message = "Đây là profile của bạn (Stub)" }); 
        }

        // 2. PUT /api/UserProfile/update-profile
        [HttpPut("update-profile")] 
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto) 
        { 
            return Ok(new { Message = "Cập nhật profile thành công (Stub)" }); 
        }

        // 3. PUT /api/UserProfile/change-password
        [HttpPut("change-password")] 
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto) 
        { 
            return Ok(new { Message = "Đổi mật khẩu thành công (Stub)" }); 
        }

        // 4. POST /api/UserProfile/upload-avatar
        [HttpPost("upload-avatar")] 
        public async Task<IActionResult> UploadAvatar(IFormFile file) 
        { 
            return Ok(new { Message = "Upload avatar thành công (Stub)" }); 
        }
    }
}