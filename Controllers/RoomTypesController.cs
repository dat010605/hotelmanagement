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

        // ====================================================
        // 6. GET /api/RoomTypes/availability — Lấy hạng phòng + số lượng phòng trống
        // ====================================================
        [HttpGet("availability")]
        public async Task<IActionResult> GetAvailability([FromQuery] DateTime? checkIn, [FromQuery] DateTime? checkOut)
        {
            bool hasDateFilter = checkIn.HasValue && checkOut.HasValue;
            var ci = checkIn ?? DateTime.Today;
            var co = checkOut ?? DateTime.Today.AddDays(1);

            var busyRoomIds = hasDateFilter
                ? await _context.BookingDetails
                    .Include(bd => bd.Booking)
                    .Where(bd => bd.CheckInDate < co && bd.CheckOutDate > ci
                                 && bd.Booking != null && bd.Booking.Status != "Cancelled"
                                 && bd.RoomId != null)
                    .Select(bd => (int)bd.RoomId!)
                    .Distinct()
                    .ToListAsync()
                : new List<int>();

            var roomTypes = await _context.RoomTypes
                .Where(rt => rt.IsActive != false)
                .Select(rt => new
                {
                    rt.Id,
                    rt.Name,
                    rt.BasePrice,
                    rt.CapacityAdults,
                    rt.CapacityChildren,
                    rt.Description,
                    rt.SizeSqm,
                    rt.BedType,
                    rt.ViewType,
                    TotalRooms = rt.Rooms.Count(r => r.Status != "Maintenance"),
                    AvailableRooms = hasDateFilter
                        ? rt.Rooms.Count(r => !busyRoomIds.Contains(r.Id) && r.Status != "Maintenance")
                        : -1, // -1 = chưa lọc ngày, frontend hiển thị "Chọn ngày để xem"
                    HasDateFilter = hasDateFilter,
                    Images = rt.RoomImages
                        .Where(img => img.IsActive != false)
                        .OrderByDescending(img => img.IsPrimary)
                        .Select(img => img.ImageUrl)
                        .ToList(),
                    Amenities = rt.Amenities.Select(a => a.Name).ToList()
                })
                .OrderBy(rt => rt.BasePrice)
                .ToListAsync();

            return Ok(roomTypes);
        }
        // ... (Code hiện tại) ...

// ==========================================
// THÊM: 6. GET: Lấy loại phòng theo tên
// ==========================================
[HttpGet("by-name/{name}")]
public async Task<IActionResult> GetByName(string name) { /* ... Logic sum ... */ return Ok(); }

// ==========================================
// THÊM: 7. POST: Thêm hình ảnh cho loại phòng
// ==========================================
[HttpPost("images")]
public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] int roomTypeId) { /* ... Logic upload ... */ return Ok(); }

// ==========================================
// THÊM: 8. PATCH: Đặt ảnh làm ảnh chính
// ==========================================
[HttpPatch("set-primary")]
public async Task<IActionResult> SetPrimaryImage([FromQuery] int imageId, [FromQuery] int roomTypeId) { /* ... Logic set ... */ return Ok(); }

// ==========================================
// THÊM: 9. DELETE: Xóa hình ảnh
// ==========================================
[HttpDelete("images/{imageId}")]
public async Task<IActionResult> DeleteImage(int imageId) { /* ... Logic delete ... */ return Ok(); }
    }
}