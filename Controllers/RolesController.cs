using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy tất cả Roles (Kèm Permissions để hiện Tag ở bảng)
        [HttpGet]
        public async Task<IActionResult> GetAll() 
        {
            var roles = await _context.Roles
                .Include(r => r.Permissions)
                .ToListAsync();
            return Ok(roles);
        }

        // 2. Lấy tất cả Permissions (Dùng cho Modal Checkbox)
        // Đặt Route này lên TRÊN các hàm có tham số {id}
        [HttpGet("AllPermissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            var permissions = await _context.Permissions.ToListAsync();
            return Ok(permissions);
        }

        // 3. Gán quyền (Gửi mảng ID trực tiếp)
        [HttpPost("{id:int}/AssignPermissions")]
        public async Task<IActionResult> AssignPermissions(int id, [FromBody] List<int> permissionIds)
        {
            var role = await _context.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return NotFound("Không tìm thấy Vai trò.");

            var permissions = await _context.Permissions
                .Where(p => permissionIds.Contains(p.Id))
                .ToListAsync();

            role.Permissions = permissions;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật quyền thành công!" });
        }

        // 4. Lấy chi tiết 1 Role
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id) 
        {
            var role = await _context.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.Id == id);
            
            if (role == null) return NotFound();
            return Ok(role);
        }

        // 5. Các hàm CRUD khác giữ nguyên nhưng thêm :int
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoleDto dto)
        {
            var role = new Role { Name = dto.Name }; 
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoleDto dto)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound();
            role.Name = dto.Name;
            await _context.SaveChangesAsync();
            return Ok(role);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound();
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa thành công" });
        }
    }
}