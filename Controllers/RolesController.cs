using HotelManagement.API.DTOs; // Thêm dòng này để C# nhận diện được DTO
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        
        public RolesController(RoleManager<IdentityRole> roleManager) 
        { 
            _roleManager = roleManager; 
        }

        [HttpGet] 
        public async Task<IActionResult> GetAll() => Ok(await _roleManager.Roles.ToListAsync());
        
        [HttpPost] 
        public async Task<IActionResult> Create([FromBody] CreateRoleDto dto) { /* ... logic ... */ return Ok(); }

        [HttpGet("{id}")] 
        public async Task<IActionResult> GetById(string id) { /* ... logic ... */ return Ok(); }

        [HttpPut("{id}")] 
        public async Task<IActionResult> Update(string id, [FromBody] UpdateRoleDto dto) { /* ... logic ... */ return Ok(); }

        [HttpDelete("{id}")] 
        public async Task<IActionResult> Delete(string id) { /* ... logic ... */ return Ok(); }

        // API Phân quyền
        [HttpPost("assign-permission")] 
        public async Task<IActionResult> AssignPermission([FromBody] AssignPermissionDto dto) { /* ... logic ... */ return Ok(); }
        
        // Thêm API xem quyền (GET /api/Roles/my-permissions) để khớp 100% với ảnh 2
        [HttpGet("my-permissions")] 
        public async Task<IActionResult> GetMyPermissions() { /* ... logic ... */ return Ok(new { Permissions = new[] { "Read", "Write" } }); }
    }
}