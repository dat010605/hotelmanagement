using HotelManagement.API.DTOs;
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

        // 41. ĐĂNG NHẬP & TRẢ VỀ JWT KÈM THEO QUYỀN (PERMISSIONS)
      [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. TÌM USER + GỘP ROLE + GỘP LUÔN PERMISSIONS (Nhờ cầu nối của EF Core)
            var user = await _context.Users
                .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions) // EF Core nối thẳng sang bảng Permissions
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Status == true);

            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại hoặc tài khoản bị khóa." });

            bool isPasswordValid = false;

            // Xử lý dữ liệu: Phân biệt mật khẩu mẫu và mật khẩu đã mã hóa BCrypt
            if (user.PasswordHash.StartsWith("$"))
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            else
            {
                isPasswordValid = (user.PasswordHash == request.Password);
            }

            if (!isPasswordValid)
                return Unauthorized(new { message = "Mật khẩu không đúng." });

            var token = GenerateJwtToken(user);

            // ==========================================
            // 2. LẤY DANH SÁCH QUYỀN CỰC KỲ ĐƠN GIẢN
            // ==========================================
            // Lấy trực tiếp từ danh sách Permissions đã Include ở bước 1
            var userPermissions = user.Role?.Permissions?.Select(p => p.Name).ToList() ?? new List<string>();

            // TRẢ VỀ ĐẦY ĐỦ CHO REACT
            return Ok(new 
            { 
                Token = token, 
                User = new 
                { 
                    Id = user.Id, 
                    FullName = user.FullName, 
                    Email = user.Email,
                    Role = user.Role?.Name 
                },
                Permissions = userPermissions 
            });
        }
        // 42. REFRESH TOKEN (Cấp lại token mới dựa trên thông tin cũ)
        [HttpPost("RefreshToken")]
        public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(request.Token);
            
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
            
            double durationInMinutes = Convert.ToDouble(jwtSettings["DurationInMinutes"]);

            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.Name) 
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"], 
                audience: jwtSettings["Audience"],
                claims: claims, 
                expires: DateTime.Now.AddMinutes(durationInMinutes), 
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}