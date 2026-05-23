using HotelManagement.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
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
                Status = true,
                DateOfBirth = !string.IsNullOrEmpty(request.DateOfBirth) && DateOnly.TryParse(request.DateOfBirth, out var dob) ? dob : null
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
            var user = await _context.Users
                                     .Include(u => u.Role).ThenInclude(r => r.Permissions)
                                     .FirstOrDefaultAsync(u => u.Email == request.Email && u.Status == true);

            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại hoặc tài khoản bị khóa." });

            // Xác thực mật khẩu: hỗ trợ cả BCrypt hash lẫn plain text (tài khoản cũ từ seed.sql)
            bool isPasswordValid;
            if (user.PasswordHash.StartsWith("$"))
            {
                // Mật khẩu đã được mã hóa BCrypt → verify bằng BCrypt
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            else
            {
                // Mật khẩu cũ lưu dạng plain text → so sánh trực tiếp
                isPasswordValid = (user.PasswordHash == request.Password);

                // Auto-migrate: Nếu đúng, tự động mã hóa lại bằng BCrypt cho lần sau
                // Dùng ExecuteUpdate để CHỈ update cột password_hash, tránh lỗi NOT NULL ở các cột khác
                if (isPasswordValid)
                {
                    var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
                    await _context.Users
                        .Where(u => u.Id == user.Id)
                        .ExecuteUpdateAsync(s => s.SetProperty(u => u.PasswordHash, hashedPassword));
                }
            }

            if (!isPasswordValid)
                return Unauthorized(new { message = "Mật khẩu không đúng." });

            var token = GenerateJwtToken(user);
            var permissions = user.Role?.Permissions?.Select(p => p.Name).ToList() ?? new List<string>();
            
            // Trả về đúng format để Frontend không bị sập
            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token,
                permissions = permissions,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role?.Name,
                    avatarUrl = user.AvatarUrl
                }
            });
        }

        // ====================================================
        // 2b. LẤY PERMISSIONS CỦA USER HIỆN TẠI (dùng để reload sidebar khi quyền thay đổi)
        // ====================================================
        [HttpGet("my-permissions")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Role).ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.Id.ToString() == userIdClaim);

            if (user == null) return NotFound();

            var permissions = user.Role?.Permissions?.Select(p => p.Name).ToList() ?? new List<string>();
            return Ok(new { permissions });
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
        // 4. ĐĂNG NHẬP BẰNG GOOGLE (Google OAuth)
        // POST: api/Auth/google-login
        // ====================================================
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Credential))
                return BadRequest(new { message = "Google Token không hợp lệ." });

            try
            {
                // Xác thực Google Token bằng Google tokeninfo endpoint
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync(
                    $"https://oauth2.googleapis.com/tokeninfo?id_token={request.Credential}");

                if (!response.IsSuccessStatusCode)
                    return Unauthorized(new { message = "Google Token không hợp lệ hoặc đã hết hạn." });

                var content = await response.Content.ReadAsStringAsync();
                var googleUser = JsonSerializer.Deserialize<JsonElement>(content);

                // Trích xuất thông tin từ Google
                var email = googleUser.GetProperty("email").GetString();
                var name = googleUser.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : email;
                var avatar = googleUser.TryGetProperty("picture", out var picProp) ? picProp.GetString() : null;

                if (string.IsNullOrEmpty(email))
                    return BadRequest(new { message = "Không thể lấy email từ Google." });

                // Tìm user theo email
                var user = await _context.Users.Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    // Tạo user mới với Role Guest
                    var guestRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Guest");
                    if (guestRole == null)
                    {
                        guestRole = new Role { Name = "Guest" };
                        _context.Roles.Add(guestRole);
                        await _context.SaveChangesAsync();
                    }

                    user = new User
                    {
                        FullName = name ?? "Google User",
                        Email = email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                        RoleId = guestRole.Id,
                        AvatarUrl = avatar,
                        Status = true,
                        CreatedAt = DateTime.Now
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    // Reload user with Role
                    user = await _context.Users.Include(u => u.Role)
                        .FirstOrDefaultAsync(u => u.Email == email);
                }
                else
                {
                    // Cập nhật avatar nếu chưa có
                    if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(avatar))
                    {
                        user.AvatarUrl = avatar;
                        await _context.SaveChangesAsync();
                    }
                }

                if (user == null)
                    return StatusCode(500, new { message = "Lỗi tạo tài khoản." });

                if (user.Status != true)
                    return Unauthorized(new { message = "Tài khoản đã bị khóa." });

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "Đăng nhập Google thành công!",
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        fullName = user.FullName,
                        email = user.Email,
                        role = user.Role?.Name,
                        avatarUrl = user.AvatarUrl
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi xử lý Google Login: {ex.Message}" });
            }
        }

        // ====================================================
        // 5. GENERATE TOKEN 
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

    // DTO cho Google Login
    public class GoogleLoginRequest
    {
        public string Credential { get; set; } = null!;
    }
}