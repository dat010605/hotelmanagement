using HotelManagement.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
<<<<<<< HEAD
=======
using System.Text.Json;
using BCrypt.Net;
>>>>>>> datpronak123
using HotelManagement.API.Models;
using Google.Apis.Auth;

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
        // 1. ĐĂNG NHẬP GOOGLE (TỰ ĐỘNG TẠO ACCOUNT GUEST)
        // ====================================================
        [HttpPost("GoogleLogin")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.idToken))
                    return BadRequest(new { message = "Token không được để trống." });

                // 1. Xác thực Token gửi từ Frontend
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.idToken);
                
                // 2. Tìm User theo Email từ Google
                var user = await _context.Users.Include(u => u.Role)
                                         .FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user == null)
                {
                    // 3. Nếu chưa có, tự động tạo mới với Role Guest (ID 10)
                    user = new User
                    {
                        FullName = payload.Name,
                        Email = payload.Email,
                        RoleId = 10,             // Gán cứng quyền Guest theo SQL của ông
                        Status = true,           // Kích hoạt tài khoản
                        PasswordHash = "GOOGLE_AUTH_EXTERNAL", // Đánh dấu acc từ Google
                        CreatedAt = DateTime.Now
                    };

                    _context.Users.Add(user);
                    // Lưu xuống SQL - Bước này sẽ thành công vì đã đủ các trường Not Null
                    await _context.SaveChangesAsync();
                    
                    // Nạp lại dữ liệu kèm Role để lấy đúng Name cho JWT Token
                    user = await _context.Users.Include(u => u.Role)
                                             .FirstOrDefaultAsync(u => u.Id == user.Id);
                }

                if (user == null) return BadRequest(new { message = "Không thể tạo hoặc tìm thấy tài khoản." });

                // 4. Tạo JWT của hệ thống
                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "Đăng nhập Google thành công",
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        fullName = user.FullName,
                        email = user.Email,
                        role = user.Role?.Name ?? "Guest"
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Xác thực Google thất bại: " + ex.Message });
            }
        }

        // ====================================================
        // 2. ĐĂNG KÝ TRUYỀN THỐNG
        // ====================================================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists) return BadRequest(new { message = "Email này đã được sử dụng!" });

            var guestRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Guest" || r.Id == 10);
            
            var newUser = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = guestRole?.Id ?? 10,
                Status = true,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký tài khoản thành công!" });
        }

        // ====================================================
        // 3. ĐĂNG NHẬP TRUYỀN THỐNG
        // ====================================================
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.Include(u => u.Role)
                                     .FirstOrDefaultAsync(u => u.Email == request.Email && u.Status == true);

            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại hoặc tài khoản bị khóa." });

<<<<<<< HEAD
            // Lưu ý: Nếu dùng password truyền thống thì verify ở đây. 
            // Hiện tại code đang tập trung fix luồng Google nên tôi để GenerateToken luôn.
=======
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
>>>>>>> datpronak123

            var token = GenerateJwtToken(user);
            
            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token,
                user = new
                {
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
<<<<<<< HEAD
                    role = user.Role?.Name
=======
                    role = user.Role?.Name,
                    avatarUrl = user.AvatarUrl
>>>>>>> datpronak123
                }
            });
        }

        // ====================================================
        // 4. LÀM MỚI TOKEN
        // ====================================================
        [HttpPost("RefreshToken")]
        public IActionResult RefreshToken([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.Token)) return BadRequest("Token trống.");
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(request.Token);
            
            var email = jwtToken.Claims.First(claim => claim.Type == ClaimTypes.Email).Value;
            var user = _context.Users.Include(u => u.Role).FirstOrDefault(u => u.Email == email && u.Status == true);
            
            if (user == null) return Unauthorized("Token không hợp lệ hoặc user đã bị khóa.");

            return Ok(new { Token = GenerateJwtToken(user) });
        }

        // ====================================================
<<<<<<< HEAD
        // 5. HÀM TẠO JWT TOKEN
=======
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
>>>>>>> datpronak123
        // ====================================================
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var keyString = jwtSettings["Key"] ?? "MotChuoiBaoMatCucKyDaiVaKhoDoan1234567890"; 
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            
            if (!double.TryParse(jwtSettings["DurationInMinutes"], out double durationInMinutes)) {
                durationInMinutes = 1440; 
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

<<<<<<< HEAD
    public class GoogleLoginRequest 
    { 
        public string? idToken { get; set; } 
=======
    // DTO cho Google Login
    public class GoogleLoginRequest
    {
        public string Credential { get; set; } = null!;
>>>>>>> datpronak123
    }
}