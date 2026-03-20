 using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; 
using HotelManagement.API.DTOs;   

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly AppDbContext _context; 

        public RoomTypesController(AppDbContext context)
        {
            _context = context;
        }

        // ====================================================
        // 1. GET /api/RoomTypes : Lấy danh sách tất cả hạng phòng
        // ====================================================
        [HttpGet]
        public async Task<IActionResult> GetAllRoomTypes()
        {
            var roomTypes = await _context.RoomTypes.ToListAsync();
            return Ok(roomTypes);
        }

        // ====================================================
        // 2. GET /api/RoomTypes/{id} : Xem chi tiết 1 hạng phòng
        // ====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomTypeById(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null)
            {
                return NotFound(new { message = "Không tìm thấy hạng phòng này!" });
            }
            return Ok(roomType);
        }

        // ====================================================
        // 3. POST /api/RoomTypes : Thêm hạng phòng mới
        // ====================================================
        [HttpPost]
        public async Task<IActionResult> CreateRoomType([FromBody] CreateRoomTypeRequest request)
        {
            // Kiểm tra trùng tên hạng phòng
            bool isExist = await _context.RoomTypes.AnyAsync(rt => rt.Name == request.Name);
            if (isExist) return BadRequest(new { message = "Tên hạng phòng này đã tồn tại!" });

            var newRoomType = new RoomType
            {
                Name = request.Name
            };

            _context.RoomTypes.Add(newRoomType);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm hạng phòng thành công!", roomTypeId = newRoomType.Id });
        }

        // ====================================================
        // 4. PUT /api/RoomTypes/{id} : Cập nhật thông tin hạng phòng
        // ====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoomType(int id, [FromBody] CreateRoomTypeRequest request)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null) return NotFound(new { message = "Không tìm thấy hạng phòng này!" });

            // Kiểm tra xem tên mới có bị trùng với hạng phòng khác không
            bool isNameExist = await _context.RoomTypes.AnyAsync(rt => rt.Name == request.Name && rt.Id != id);
            if (isNameExist) return BadRequest(new { message = "Tên hạng phòng này đã bị trùng!" });

            // Cập nhật dữ liệu
            roomType.Name = request.Name;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật hạng phòng thành công!" });
        }

        // ====================================================
        // 5. DELETE /api/RoomTypes/{id} : Xóa hạng phòng
        // ====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);
            if (roomType == null) return NotFound(new { message = "Không tìm thấy hạng phòng này!" });

            // Xóa khỏi database
            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa hạng phòng thành công!" });
        }
    }
}