using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // 41. ĐĂNG NHẬP & TRẢ VỀ JWT
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.Include(u => u.Role)
                                     .FirstOrDefaultAsync(u => u.Email == request.Email && u.Status == true);

            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại hoặc tài khoản bị khóa." });

            bool isPasswordValid = false;

            // Xử lý dữ liệu: Phân biệt mật khẩu mẫu và mật khẩu đã mã hóa BCrypt
            if (user.PasswordHash.StartsWith("$"))
            {
                // Nếu là tài khoản tạo mới (đã được băm chuẩn bằng BCrypt)
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            else
            {
                // Nếu là dữ liệu mẫu từ file SQL ("hash1", "hash2"...)
                isPasswordValid = (user.PasswordHash == request.Password);
            }

            if (!isPasswordValid)
                return Unauthorized(new { message = "Mật khẩu không đúng." });

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token, Message = "Đăng nhập thành công" });
        }

        // 42. REFRESH TOKEN (Cấp lại token mới dựa trên thông tin cũ)
        [HttpPost("RefreshToken")]
        public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // Trong thực tế, bạn nên lưu RefreshToken vào Database.
            // Ở đây là logic demo: Giải mã token cũ (dù đã hết hạn) để tạo token mới.
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(request.Token);
            
            // Lấy Email từ Token cũ để tìm lại User
            var email = jwtToken.Claims.First(claim => claim.Type == ClaimTypes.Email).Value;
            var user = _context.Users.Include(u => u.Role).FirstOrDefault(u => u.Email == email && u.Status == true);
            
            if (user == null) return Unauthorized("Token không hợp lệ hoặc user đã bị khóa.");

            return Ok(new { Token = GenerateJwtToken(user) });
        }

        // Hàm tiện ích tạo JWT Token (Sử dụng chung)
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            
            // ĐỌC THỜI GIAN SỐNG TỪ APPSETTINGS.JSON
            double durationInMinutes = Convert.ToDouble(jwtSettings["DurationInMinutes"]);

            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                // Dùng để check quyền [Authorize(Roles="Admin")] ở các Controller khác
                new Claim(ClaimTypes.Role, user.Role.Name) 
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"], 
                audience: jwtSettings["Audience"],
                claims: claims, 
                // Cài đặt thời gian hết hạn dựa vào con số 1440 đọc từ json
                expires: DateTime.Now.AddMinutes(durationInMinutes), 
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}