using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin")] // Mở dòng này nếu bạn muốn chỉ Admin mới được lấy danh sách quyền
    public class PermissionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermissionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Permissions
        // Lấy toàn bộ danh sách các quyền có trong hệ thống
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPermissions()
        {
            // Lấy danh sách quyền từ bảng Permissions (hoặc RolePermissions tùy DB của bạn)
            // Ở đây mình giả định bạn có bảng Permissions
            var permissions = await _context.Set<Permission>().ToListAsync();
            
            if (permissions == null || !permissions.Any())
            {
                return Ok(new List<object>()); // Trả về mảng rỗng thay vì lỗi nếu chưa có dữ liệu
            }

            return Ok(permissions);
        }
    }
}