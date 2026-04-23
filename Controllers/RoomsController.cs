using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;


namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        // ====================================================
        // 1. GET /api/Rooms : Lấy danh sách phòng
        // ====================================================
        [HttpGet]
        public async Task<IActionResult> GetAllRooms()
        {
            try
            {
                var rooms = await _context.Rooms
                    .AsNoTracking() // Tăng tốc độ truy vấn
                    .Select(r => new
                    {
                        r.Id,
                        r.RoomNumber,
                        r.Floor,
                        r.RoomTypeId,
                        r.Status,
                        r.CleaningStatus,
                        r.ExtensionNumber,
                        ParentRoomId = r.ParentRoomId, //  TRẢ VỀ ID CĂN MẸ CHO REACT BIẾT
                        RoomImages = _context.RoomImages
                                        .Where(img => img.RoomId == r.Id)
                                        .ToList()
                    })
                    .ToListAsync();
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi load danh sách: " + ex.Message });
            }
        }

        // ====================================================
        // 2. GET /api/Rooms/{id} : Lấy chi tiết 1 phòng
        // ====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomById(int id)
        {
            var room = await _context.Rooms
                .AsNoTracking()
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    r.Id,
                    r.RoomNumber,
                    r.Floor,
                    r.RoomTypeId,
                    r.Status,
                    r.CleaningStatus,
                    r.ExtensionNumber,
                    ParentRoomId = r.ParentRoomId // 🌟 BỔ SUNG Ở ĐÂY NỮA
                })
                .FirstOrDefaultAsync();

            if (room == null) return NotFound(new { message = "Không tìm thấy phòng này!" });
            return Ok(room);
        }

        [HttpGet("{id}/inventory")]
        public async Task<IActionResult> GetRoomInventory(int id)
        {
            var inventory = await _context.RoomInventory
                .Where(ri => ri.RoomId == id) 
                .Include(ri => ri.Equipment) 
                .Select(ri => new {
                   Id = ri.Id,              
                   Name = ri.Equipment.Name, 
                   Quantity = ri.Quantity,   
                   PriceIfLost = ri.PriceIfLost, 
                   ItemType = ri.ItemType    
                }).ToListAsync();
            return Ok(inventory);
        }

        // ====================================================
        // 3. POST /api/Rooms : TẠO PHÒNG MỚI
        // ====================================================
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] CreateOrUpdateRoomDto request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.RoomNumber)) 
                    return BadRequest(new { message = "Số phòng không được để trống!" });

                // Kiểm tra trùng số phòng
                bool isRoomExist = await _context.Rooms.AnyAsync(r => r.RoomNumber == request.RoomNumber);
                if (isRoomExist) return BadRequest(new { message = "Số phòng này đã tồn tại trên hệ thống!" });

                var newRoom = new Room
                {
                    RoomNumber = request.RoomNumber,
                    RoomTypeId = request.RoomTypeId ?? 1, 
                    Floor = request.Floor ?? 1,
                    Status = string.IsNullOrEmpty(request.Status) ? "Available" : request.Status,
                    CleaningStatus = string.IsNullOrEmpty(request.CleaningStatus) ? "Clean" : request.CleaningStatus,
                    ExtensionNumber = request.ExtensionNumber,
                    ParentRoomId = request.ParentRoomId //  LƯU ID CĂN MẸ VÀO DATABASE
                };

                _context.Rooms.Add(newRoom);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Thêm phòng thành công!", roomId = newRoom.Id });
            }
            catch (Exception ex)
            {
                var dbError = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { message = "Lỗi Database: " + dbError });
            }
        }

        // ====================================================
        // 4. PUT /api/Rooms/{id} : CẬP NHẬT THÔNG TIN PHÒNG
        // ====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] CreateOrUpdateRoomDto request)
        {
            try
            {
                var room = await _context.Rooms.FindAsync(id);
                if (room == null) return NotFound(new { message = "Không tìm thấy phòng!" });

                if (!string.IsNullOrEmpty(request.RoomNumber))
                {
                    bool isRoomNumberExist = await _context.Rooms.AnyAsync(r => r.RoomNumber == request.RoomNumber && r.Id != id);
                    if (isRoomNumberExist) return BadRequest(new { message = "Số phòng này đã bị trùng với phòng khác!" });
                    room.RoomNumber = request.RoomNumber;
                }

                // Cập nhật các trường khác 
                room.RoomTypeId = request.RoomTypeId ?? room.RoomTypeId;
                room.Floor = request.Floor ?? room.Floor;
                room.Status = request.Status ?? room.Status;
                room.CleaningStatus = request.CleaningStatus ?? room.CleaningStatus;
                room.ExtensionNumber = request.ExtensionNumber ?? room.ExtensionNumber;
                
                //  CHO PHÉP ĐỔI SANG CĂN MẸ KHÁC HOẶC TÁCH RA THÀNH PHÒNG ĐỘC LẬP
                room.ParentRoomId = request.ParentRoomId; 

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lưu chỉnh sửa: " + ex.Message });
            }
        }

        // ====================================================
        // 5. POST /api/Rooms/sync-from-warehouse/{roomId}
        // ====================================================
        [HttpPost("sync-from-warehouse/{roomId}")]
        public async Task<IActionResult> SyncFromWarehouse(int roomId)
        {
            try
            {
                if (!await _context.Rooms.AnyAsync(r => r.Id == roomId))
                    return NotFound(new { message = "Không tìm thấy phòng!" });

                var allEquipments = await _context.Equipments.AsNoTracking().ToListAsync();
                if (!allEquipments.Any()) return BadRequest(new { message = "Kho đang trống!" });

                var existingEquipmentIds = await _context.RoomInventories
                    .Where(ri => ri.RoomId == roomId)
                    .Select(ri => ri.EquipmentId)
                    .ToListAsync();

                var newInventories = allEquipments
                    .Where(e => !existingEquipmentIds.Contains(e.Id)) 
                    .Select(e => new RoomInventory
                    {
                        RoomId = roomId,
                        EquipmentId = e.Id,
                        ItemName = e.Name,
                        Quantity = 1,
                        PriceIfLost = e.DefaultPriceIfLost,
                        Note = "Đồng bộ tự động từ kho",
                        IsActive = true
                    }).ToList();

                if (!newInventories.Any()) return Ok(new { message = "Phòng đã có đầy đủ vật tư mẫu!" });

                _context.RoomInventories.AddRange(newInventories);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Đã đồng bộ thêm {newInventories.Count} vật tư mẫu!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi đồng bộ: " + ex.Message });
            }
        }

        // ====================================================
        // 6. POST /api/Rooms/clone-inventory
        // ====================================================
        [HttpPost("clone-inventory")]
        public async Task<IActionResult> CloneInventory([FromBody] CloneInventoryRequest request)
        {
            try
            {
                var sourceItems = await _context.RoomInventories
                    .AsNoTracking()
                    .Where(ri => ri.RoomId == request.FromRoomId)
                    .ToListAsync();

                if (!sourceItems.Any())
                    return BadRequest(new { message = "Phòng mẫu không có vật tư nào!" });

                var oldItems = await _context.RoomInventories.Where(ri => ri.RoomId == request.ToRoomId).ToListAsync();
                _context.RoomInventories.RemoveRange(oldItems);

                var newItems = sourceItems.Select(item => new RoomInventory
                {
                    RoomId = request.ToRoomId,
                    EquipmentId = item.EquipmentId,
                    ItemName = item.ItemName,
                    Quantity = item.Quantity,
                    PriceIfLost = item.PriceIfLost,
                    Note = $"Sao chép từ phòng mẫu ID: {request.FromRoomId}",
                    IsActive = true
                }).ToList();

                _context.RoomInventories.AddRange(newItems);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Đã sao chép thành công {newItems.Count} món đồ!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi sao chép: " + ex.Message });
            }
        }

        // ====================================================
        // 7. DELETE /api/Rooms/{id}
        // ====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound(new { message = "Không tìm thấy phòng!" });

            try {
                _context.Rooms.Remove(room);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã xóa phòng thành công!" });
            }
            catch (Exception) {
                return BadRequest(new { message = "Không thể xóa phòng này vì đang có dữ liệu liên quan (Vật tư hoặc Hóa đơn)!" });
            }
        }

        // ====================================================
        // 8. Upload hình ảnh phòng
        // ====================================================
        [HttpPost("{id}/upload-image")]
        public async Task<IActionResult> UploadRoomImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn một bức ảnh!");

            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound("Không tìm thấy phòng này trong hệ thống.");

            // KHẾ ƯỚC CLOUDINARY 
            Account account = new Account("drqvarew0", "516395159994396", "0JoVGcEOvUDH99ockP_scKQbRWk");
            Cloudinary cloudinary = new Cloudinary(account);

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "HotelERP_Rooms"
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null) return BadRequest($"Lỗi từ Cloudinary: {uploadResult.Error.Message}");

            // Lấy link ảnh từ mây về, lưu vào Database
            var roomImage = new RoomImage 
            {
                RoomId = id, 
                ImageUrl = uploadResult.SecureUrl.ToString()
            };
            
            _context.RoomImages.Add(roomImage);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã tải ảnh lên mây thành công!", ImageUrl = roomImage.ImageUrl });
        }

        // --- DTOs ---
        public class CreateOrUpdateRoomDto
        {
            public int? RoomTypeId { get; set; }
            public string RoomNumber { get; set; } = null!;
            public int? Floor { get; set; }
            public string? Status { get; set; }
            public string? CleaningStatus { get; set; }
            public string? ExtensionNumber { get; set; }
            public int? ParentRoomId { get; set; } 
        }

        public class CloneInventoryRequest
        {
            public int FromRoomId { get; set; }
            public int ToRoomId { get; set; }
        }
    }
}