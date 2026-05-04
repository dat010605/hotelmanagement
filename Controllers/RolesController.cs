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

        // 3. Gán quyền (Xóa cũ → Thêm mới, dùng Transaction an toàn)
        [HttpPost("{id:int}/AssignPermissions")]
        public async Task<IActionResult> AssignPermissions(int id, [FromBody] List<int> permissionIds)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null) return NotFound("Không tìm thấy Vai trò.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Bước 1: Xóa toàn bộ quyền cũ của roleId trong bảng trung gian
                await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM [Role_Permissions] WHERE [role_id] = {0}", id);

                // Bước 2: Thêm mới danh sách quyền
                if (permissionIds != null && permissionIds.Any())
                {
                    // Lọc chỉ những permission ID hợp lệ (tồn tại trong DB)
                    var validIds = await _context.Permissions
                        .Where(p => permissionIds.Contains(p.Id))
                        .Select(p => p.Id)
                        .ToListAsync();

                    foreach (var permId in validIds)
                    {
                        await _context.Database.ExecuteSqlRawAsync(
                            "INSERT INTO [Role_Permissions] ([role_id], [permission_id]) VALUES ({0}, {1})",
                            id, permId);
                    }
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Cập nhật quyền thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi khi cập nhật quyền: {ex.Message}");
            }
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