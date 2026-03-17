using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. ĐĂNG KÝ CONTROLLERS & API EXPLORER
// ==========================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Dòng này giúp bỏ qua các vòng lặp vô tận khi xuất JSON
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// ==========================================
// 2. CẤU HÌNH SWAGGER (HỖ TRỢ JWT BEARER)
// ==========================================
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "HotelManagement API", Version = "v1" });

    // Định nghĩa form nhập Token
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo cú pháp: Bearer {chuỗi_token_của_bạn}\n\nVí dụ: Bearer eyJhbGciOiJIUzI1NiIsInR...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Yêu cầu Swagger gắn Token vào Header của mỗi Request
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ==========================================
// 3. CẤU HÌNH DATABASE (SQL SERVER)
// ==========================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    

// ==========================================
// 4. CẤU HÌNH BẢO MẬT (JWT AUTHENTICATION)
// ==========================================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
// Đã thêm dấu '!' để bỏ qua cảnh báo CS8604 (Nullable)
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(secretKey)
        };
    });

// ==========================================
// 5. BUILD & CẤU HÌNH MIDDLEWARE PIPELINE
// ==========================================
var app = builder.Build();

// Chỉ bật Swagger UI khi đang chạy ở môi trường Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Kích hoạt hệ thống Cửa An Ninh (Xác thực & Phân quyền)
app.UseAuthentication(); 
app.UseAuthorization();

// Ánh xạ các API (Controllers)
app.MapControllers();

app.Run();