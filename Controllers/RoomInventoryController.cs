using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomInventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomInventoryController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. LẤY VẬT TƯ TRONG PHÒNG (Fix lỗi 500)
        // ==========================================
        [HttpGet("Room/{roomId}")]
        public async Task<IActionResult> GetByRoom(int roomId)
        {
            try
            {
                // Dùng Include để lấy tên Vật Tư một cách an toàn và chuẩn xác nhất
                var inventory = await _context.RoomInventories
                    .AsNoTracking()
                    .Include(ri => ri.Equipment) 
                    .Where(ri => ri.RoomId == roomId)
                    .Select(ri => new
                    {
                        id = ri.Id,
                        roomId = ri.RoomId,
                        equipmentId = ri.EquipmentId,
                        equipmentCode = ri.Equipment != null ? ri.Equipment.ItemCode : "N/A",
                        equipmentName = ri.Equipment != null ? ri.Equipment.Name : "Vật tư lẻ",
                        unit = ri.Equipment != null ? ri.Equipment.Unit : "Cái",
                        quantity = ri.Quantity,
                        priceIfLost = ri.PriceIfLost,
                        note = ri.Note ?? ""
                    })
                    .ToListAsync();

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi load vật tư: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }

        // ==========================================
        // DTO - Tuyệt chiêu "Lách luật" lỗi 400 Bad Request
        // ==========================================
        public class AddInventoryDto
        {
            public int RoomId { get; set; }
            public int EquipmentId { get; set; }
            public int Quantity { get; set; }
            public string? Note { get; set; }
        }

        // ==========================================
        // 2. THÊM VẬT TƯ VÀO PHÒNG (Fix lỗi 400)
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> AddToRoom([FromBody] AddInventoryDto request)
        {
            try
            {
                if (request.Quantity <= 0) 
                    return BadRequest(new { message = "Số lượng phải lớn hơn 0!" });

                var equipment = await _context.Equipments.FindAsync(request.EquipmentId);
                if (equipment == null) 
                    return NotFound(new { message = "Vật tư không tồn tại trong kho!" });

                // Tự tính số lượng tồn kho để không phụ thuộc vào cột Computed của SQL
                int inStock = equipment.TotalQuantity - equipment.InUseQuantity - equipment.DamagedQuantity - equipment.LiquidatedQuantity;

                if (inStock < request.Quantity)
                {
                    return BadRequest(new { message = $"Kho không đủ! Hiện tại chỉ còn {inStock} {equipment.Unit}." });
                }

                // Cập nhật số lượng đang sử dụng
                equipment.InUseQuantity += request.Quantity;

                var newInventory = new RoomInventory
                {
                    RoomId = request.RoomId,
                    EquipmentId = request.EquipmentId,
                    Quantity = request.Quantity,
                    PriceIfLost = equipment.DefaultPriceIfLost,
                    Note = request.Note,
                    IsActive = true,
                    ItemType = "Asset"
                };

                _context.RoomInventories.Add(newInventory);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Thêm vật tư thành công và đã trừ kho!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thêm: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }

        // ==========================================
        // 3. XÓA VẬT TƯ (HOÀN TRẢ KHO)
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFromRoom(int id)
        {
            try
            {
                var item = await _context.RoomInventories.FindAsync(id);
                if (item == null) return NotFound(new { message = "Không tìm thấy vật tư này trong phòng!" });

                var equipment = await _context.Equipments.FindAsync(item.EquipmentId);
                if (equipment != null)
                {
                    int qtyToReturn = item.Quantity ?? 0;
                    equipment.InUseQuantity -= qtyToReturn;
                }

                _context.RoomInventories.Remove(item);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đã xóa vật tư và hoàn trả số lượng về kho!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }

        // ==========================================
        // 4. SAO CHÉP (CLONE) VẬT TƯ
        // ==========================================
        [HttpPost("Clone")]
        public async Task<IActionResult> CloneInventory([FromQuery] int sourceRoomId, [FromQuery] int targetRoomId)
        {
            try
            {
                var sourceItems = await _context.RoomInventories
                    .AsNoTracking()
                    .Where(ri => ri.RoomId == sourceRoomId)
                    .ToListAsync();

                if (!sourceItems.Any()) 
                    return BadRequest(new { message = "Phòng mẫu không có vật tư nào để sao chép!" });

                int count = 0;
                foreach (var item in sourceItems)
                {
                    var eq = await _context.Equipments.FindAsync(item.EquipmentId);
                    int qty = item.Quantity ?? 0;

                    if (eq != null)
                    {
                        int inStock = eq.TotalQuantity - eq.InUseQuantity - eq.DamagedQuantity - eq.LiquidatedQuantity;
                        
                        if (inStock >= qty)
                        {
                            eq.InUseQuantity += qty;

                            _context.RoomInventories.Add(new RoomInventory
                            {
                                RoomId = targetRoomId,
                                EquipmentId = item.EquipmentId,
                                Quantity = qty,
                                PriceIfLost = item.PriceIfLost,
                                IsActive = true,
                                Note = $"Sao chép từ phòng {sourceRoomId}",
                                ItemType = "Asset"
                            });
                            count++;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = $"Đã sao chép thành công {count} món đồ!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi Clone: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }
    }
}