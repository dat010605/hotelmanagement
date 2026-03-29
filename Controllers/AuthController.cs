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

        // ====================================================
        // 1. ĐĂNG KÝ 
        // ====================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists) return BadRequest(new { message = "Email này đã được sử dụng!" });

            var GuestRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Guest");
            if (GuestRole == null)
            {
                GuestRole = new Role { Name = "Guest" };
                _context.Roles.Add(GuestRole);
                await _context.SaveChangesAsync();
            }

            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = GuestRole.Id,
                Status = true
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký tài khoản thành công!" });
        }

        // ====================================================
        // 2. ĐĂNG NHẬP 
        // ====================================================
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.Include(u => u.Role)
                                     .FirstOrDefaultAsync(u => u.Email == request.Email && u.Status == true);

            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại hoặc tài khoản bị khóa." });

            bool isPasswordValid = false;
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
            
            // Trả về đúng format để Frontend không bị sập
            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role?.Name
                    //avatarUrl = user.AvatarUrl
                }
            });
        }

        // ====================================================
        // 3. REFRESH TOKEN 
        // ====================================================
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

        // ====================================================
        // 4. GENERATE TOKEN 
        // ====================================================
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            // Thêm bảo mật phòng hờ nếu máy nhà thiếu file cấu hình
            var keyString = jwtSettings["Key"] ?? "MotChuoiBaoMatCucKyDaiVaKhoDoan1234567890"; 
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            
            double durationInMinutes = 1440; 
            if (double.TryParse(jwtSettings["DurationInMinutes"], out double parsedDuration)) {
                durationInMinutes = parsedDuration;
            }

            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.FullName ?? ""),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "Guest") 
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "HotelAPI", 
                audience: jwtSettings["Audience"] ?? "HotelClients",
                claims: claims, 
                expires: DateTime.Now.AddMinutes(durationInMinutes), 
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}