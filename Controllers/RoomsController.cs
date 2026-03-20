using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; 
using HotelManagement.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using static HotelManagement.API.DTOs.CreateRoomRequest; // 1. PHẢI THÊM THƯ VIỆN NÀY

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
        // 1. GET /api/Rooms : Ai đăng nhập cũng xem được
        // ====================================================
        [HttpGet]
        [Authorize] // Yêu cầu đăng nhập mới được xem
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await _context.Rooms.ToListAsync();
            return Ok(rooms);
        }

        [HttpGet("{id}")]
        [Authorize] 
        public async Task<IActionResult> GetRoomById(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng này!" });
            return Ok(room);
        }

        // ====================================================
        // 3. POST /api/Rooms : CHỈ ADMIN VÀ MANAGER MỚI ĐƯỢC TẠO
        // ====================================================
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")] // 2. THÊM DÒNG NÀY ĐỂ FIX LỖI BẠN GẶP
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
        // 4. PUT /api/Rooms/{id} : CHỈ ADMIN VÀ MANAGER MỚI ĐƯỢC SỬA
        // ====================================================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")] // 3. THÊM DÒNG NÀY
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] CreateRoomRequest request)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng này!" });

            bool isRoomNumberExist = await _context.Rooms.AnyAsync(r => r.RoomNumber == request.RoomNumber && r.Id != id);
            if (isRoomNumberExist) return BadRequest(new { message = "Số phòng này đã bị trùng với một phòng khác!" });

            room.RoomTypeId = request.RoomTypeId;
            room.Name = request.Name;
            room.RoomNumber = request.RoomNumber;
            room.Floor = request.Floor;
            room.Status = request.Status;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin phòng thành công!" });
        }

        // ====================================================
        // 5. PATCH : Cập nhật nhanh trạng thái
        // ====================================================
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Manager")] 
        public async Task<IActionResult> UpdateRoomStatus(int id, [FromBody] UpdateRoomStatusRequest request)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng này!" });

            room.Status = request.Status;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã cập nhật trạng thái phòng thành: {request.Status}" });
        }
    }
}