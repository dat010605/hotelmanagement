using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; 
using HotelManagement.API.DTOs;
using static HotelManagement.API.DTOs.CreateRoomRequest;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context; 

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        // ====================================================
        // 1. GET /api/Rooms : Lấy danh sách tất cả các phòng
        // ====================================================
        [HttpGet]
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await _context.Rooms.ToListAsync();
            return Ok(rooms);
        }

        // ====================================================
        // 2. GET /api/Rooms/{id} : Xem chi tiết 1 phòng
        // ====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomById(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng này!" });
            }
            return Ok(room);
        }

        // ====================================================
        // 3. POST /api/Rooms : Thêm phòng mới
        // ====================================================
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
        {
            bool isRoomExist = await _context.Rooms.AnyAsync(r => r.RoomNumber == request.RoomNumber);
            if (isRoomExist) return BadRequest(new { message = "Số phòng này đã tồn tại!" });

            var newRoom = new Room
            {
                RoomTypeId = request.RoomTypeId,
                Name = request.Name,
                RoomNumber = request.RoomNumber,
                Floor = request.Floor,
                Status = string.IsNullOrEmpty(request.Status) ? "Available" : request.Status 
            };

            _context.Rooms.Add(newRoom);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm phòng thành công!", roomId = newRoom.Id });
        }

        // ====================================================
        // 4. PUT /api/Rooms/{id} : Cập nhật thông tin phòng
        // ====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] CreateRoomRequest request)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng này!" });

            // Kiểm tra xem số phòng đổi mới có bị trùng với phòng khác đang có không
            bool isRoomNumberExist = await _context.Rooms.AnyAsync(r => r.RoomNumber == request.RoomNumber && r.Id != id);
            if (isRoomNumberExist) return BadRequest(new { message = "Số phòng này đã bị trùng với một phòng khác!" });

            // Cập nhật dữ liệu
            room.RoomTypeId = request.RoomTypeId;
            room.Name = request.Name;
            room.RoomNumber = request.RoomNumber;
            room.Floor = request.Floor;
            room.Status = request.Status;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin phòng thành công!" });
        }

        // ====================================================
        // 5. PATCH /api/Rooms/{id}/status : Cập nhật trạng thái phòng
        // ====================================================
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateRoomStatus(int id, [FromBody] UpdateRoomStatusRequest request)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng này!" });

            // Chỉ cập nhật duy nhất trường Status
            room.Status = request.Status;
            
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã cập nhật trạng thái phòng thành: {request.Status}" });
        }
    }
}