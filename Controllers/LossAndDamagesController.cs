using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models;
using HotelManagement.API.Hubs;
using HotelManagement.API.DTOs;

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
                                    ? l.RoomInventory.Equipment.Name : "N/A"
                })
                .ToListAsync();
            return Ok(data);
        }

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
            return Ok(new { message = "Xóa thành công" });
        }
    }
}