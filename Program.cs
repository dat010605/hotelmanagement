using HotelManagement.API.Hubs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
// Cho phép truy cập thư mục wwwroot
// ==========================================
// 1. ĐĂNG KÝ CONTROLLERS & CẤU HÌNH JSON
// ==========================================
builder.Services.AddSignalR();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ngăn chặn lỗi vòng lặp vô tận (Fix lỗi 500 khi lôi dữ liệu quan hệ)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        
        // Đảm bảo dữ liệu trả về giữ nguyên kiểu camelCase (fullName thay vì FullName)
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        
        // Bỏ qua các giá trị null để JSON gọn nhẹ hơn
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<HotelManagement.API.Services.AuditLogCleanupService>();
builder.Services.AddHostedService<HotelManagement.API.Services.BirthdayVoucherWorker>();

// ==========================================
// 2. CẤU HÌNH SWAGGER (HỖ TRỢ JWT)
// ==========================================
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "HotelManagement API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo cú pháp: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// ==========================================
// 3. DATABASE & CORS
// ==========================================
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditLogInterceptor>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<AuditLogInterceptor>();
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(interceptor);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", builder =>
    {
        builder.WithOrigins(
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://localhost:5175",
                    "http://localhost:5176"
                ) // Địa chỉ của React FE (Vite tự tăng port khi bị chiếm)
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials(); // BẮT BUỘC PHẢI CÓ DÒNG NÀY CHO SIGNALR
    });
});

// ==========================================
// 4. CẤU HÌNH JWT
// ==========================================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "ChuoiBiMatSieuCapVip123456789");

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
var app = builder.Build();
app.UseStaticFiles();
// ==========================================
// 5. CẤU HÌNH MIDDLEWARE PIPELINE (THỨ TỰ RẤT QUAN TRỌNG)
// ==========================================

// Bật trang báo lỗi chi tiết khi đang code để soi lỗi 500
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); 
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS phải đặt TRƯỚC Authentication và Authorization
app.UseCors("AllowReact");

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.MapHub<HotelManagement.API.Hubs.NotificationHub>("/notificationHub");

app.Run();