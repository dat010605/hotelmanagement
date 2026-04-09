using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using HotelManagement.API.Hubs;
using HotelManagement.API.DTOs;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace HotelManagement.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LossAndDamagesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public LossAndDamagesController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var query = _context.LossAndDamages
                .Include(l => l.RoomInventory)
                    .ThenInclude(ri => ri!.Equipment)
                .AsQueryable();

            if (startDate.HasValue) 
                query = query.Where(l => l.CreatedAt >= startDate.Value);
            if (endDate.HasValue) 
                query = query.Where(l => l.CreatedAt <= endDate.Value.AddDays(1));

            var data = await query
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    l.Id,
                    l.Quantity,
                    l.PenaltyAmount,
                    Description = l.Description ?? "",
                    l.CreatedAt,
                    l.RoomInventoryId, // Trả về để Frontend dùng khi Edit
                    RoomNumber = l.RoomInventory != null ? l.RoomInventory.RoomId.ToString() : "N/A",
                    EquipmentName = (l.RoomInventory != null && l.RoomInventory.Equipment != null) 
                                    ? l.RoomInventory.Equipment.Name : "N/A",
                    //  BẢN VÁ SỐ 1: BỐC ẢNH TỪ DATABASE TRẢ VỀ CHO REACT 
                    ImageUrl = l.ImageUrl 
                })
                .ToListAsync();
            return Ok(data);
        }

        // =========================================================================
        // ĐÂY LÀ HÀM BỔ SUNG ĐỂ FIX LỖI 404 KHI MỞ TRANG KIỂM KÊ PHÒNG
        // =========================================================================
        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetDamagesByRoom(int roomId)
        {
            try
            {
                var damages = await _context.LossAndDamages
                    .Include(ld => ld.RoomInventory)
                    .ThenInclude(ri => ri!.Equipment)
                    .Where(ld => ld.RoomInventory != null && ld.RoomInventory.RoomId == roomId)
                    .Select(ld => new
                    {
                        id = ld.Id,
                        roomInventoryId = ld.RoomInventoryId,
                        equipmentName = (ld.RoomInventory != null && ld.RoomInventory.Equipment != null) 
                                        ? ld.RoomInventory.Equipment.Name : "Vật tư lẻ",
                        quantity = ld.Quantity,
                        penaltyAmount = ld.PenaltyAmount,
                        description = ld.Description ?? "",
                        createdAt = ld.CreatedAt
                    })
                    .ToListAsync();

                return Ok(damages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải danh sách hỏng hóc: " + ex.Message });
            }
        }
        // =========================================================================

        // =========================================================================
        // NHẬN DỮ LIỆU BÁO HỎNG TỪ REACT
        // =========================================================================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLossAndDamageDto request)
        {
            try
            {
                // 1. Tìm vật tư trong phòng dựa vào ID gửi lên
                var inventoryItem = await _context.RoomInventories
                    .Include(ri => ri.Equipment)
                    .FirstOrDefaultAsync(ri => ri.Id == request.RoomInventoryId);

                if (inventoryItem == null) 
                    return NotFound(new { message = "Không tìm thấy vật tư này trong phòng!" });

                // 2. Chuyển đổi số lượng kho (Trừ số đang dùng, cộng vào số bị hỏng)
                if (inventoryItem.Equipment != null)
                {
                    inventoryItem.Equipment.InUseQuantity -= request.Quantity;
                    inventoryItem.Equipment.DamagedQuantity += request.Quantity;
                }

                // 3. Tạo bản ghi lưu vào bảng Thất Thoát & Đền Bù
                var newDamage = new LossAndDamage
                {
                    RoomInventoryId = request.RoomInventoryId,
                    Quantity = request.Quantity,
                    PenaltyAmount = request.PenaltyAmount,
                    Description = request.Description,
                    CreatedAt = DateTime.Now,
                    //  BẢN VÁ SỐ 2: HỨNG ẢNH TỪ REACT VÀ NHÉT VÀO DATABASE 
                    ImageUrl = request.ImageUrl 
                };

                _context.LossAndDamages.Add(newDamage);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"⚠️ Có 1 hóa đơn thất thoát/báo hỏng mới (Số lượng: {request.Quantity})!");

                return Ok(new { message = "Báo hỏng và cập nhật kho thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống khi lưu: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }
        // =========================================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLossAndDamageDto dto)
        {
            var record = await _context.LossAndDamages
                .Include(l => l.RoomInventory).ThenInclude(ri => ri!.Equipment)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (record == null) return NotFound();

            // Logic điều chỉnh kho nếu số lượng thay đổi
            if (record.RoomInventory?.Equipment != null && dto.Quantity.HasValue && record.Quantity != dto.Quantity.Value) {
                int diff = dto.Quantity.Value - record.Quantity;
                record.RoomInventory.Equipment.InUseQuantity -= diff;
                record.RoomInventory.Equipment.DamagedQuantity += diff;
                record.Quantity = dto.Quantity.Value;
            }

            if (dto.Description != null) record.Description = dto.Description;
            if (dto.PenaltyAmount.HasValue) record.PenaltyAmount = dto.PenaltyAmount.Value;
            
            await _context.SaveChangesAsync();
            return Ok(record);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _context.LossAndDamages
                .Include(l => l.RoomInventory).ThenInclude(ri => ri!.Equipment)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (record == null) return NotFound();

            if (record.RoomInventory?.Equipment != null) {
                record.RoomInventory.Equipment.InUseQuantity += record.Quantity;
                record.RoomInventory.Equipment.DamagedQuantity -= record.Quantity;
            }

            _context.LossAndDamages.Remove(record);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Đã xóa 1 biên bản đền bù thất thoát!");
            return Ok(new { message = "Xóa thành công" });
        }
    }

    // =========================================================================
    // DTO ĐỂ NHẬN DỮ LIỆU TỪ REACT GỬI LÊN (Nằm ngoài Controller)
    // =========================================================================
    public class CreateLossAndDamageDto
    {
        public int RoomInventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal PenaltyAmount { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }
}