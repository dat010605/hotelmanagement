using HotelManagement.API.Models;
using HotelManagement.API.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public EquipmentsController(AppDbContext context, IHubContext<NotificationHub> hubContext) 
        { 
            _context = context; 
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _context.Equipments.ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(Equipment equipment)
        {
            var existing = await _context.Equipments.FirstOrDefaultAsync(e => e.Name.ToLower() == equipment.Name.ToLower() && e.Supplier == equipment.Supplier);
            if (existing != null)
            {
                existing.TotalQuantity += equipment.TotalQuantity;
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Kho vật tư: Vừa nhập thêm {equipment.TotalQuantity} '{equipment.Name}' từ nhà phân phối '{equipment.Supplier ?? "Không rõ"}'");
                return Ok(existing);
            }

       //   Đã tự động tính: Tồn kho = Tổng - Đang dùng - Hỏng - Thanh lý
            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Kho vật tư: Vừa nhập mới '{equipment.Name}' từ nhà phân phối '{equipment.Supplier ?? "Không rõ"}'");
            return Ok(equipment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Equipment equipmentUpdate)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null) return NotFound("Không tìm thấy vật tư!");

            equipment.ItemCode = equipmentUpdate.ItemCode;
            equipment.Name = equipmentUpdate.Name;
            equipment.Category = equipmentUpdate.Category;
            equipment.Unit = equipmentUpdate.Unit;
            equipment.TotalQuantity = equipmentUpdate.TotalQuantity;
            equipment.DamagedQuantity = equipmentUpdate.DamagedQuantity;
            equipment.LiquidatedQuantity = equipmentUpdate.LiquidatedQuantity;
            equipment.BasePrice = equipmentUpdate.BasePrice;
            equipment.DefaultPriceIfLost = equipmentUpdate.DefaultPriceIfLost;
            equipment.ImageUrl = equipmentUpdate.ImageUrl;
            equipment.Supplier = equipmentUpdate.Supplier;
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Kho vật tư: Cập nhật thông tin '{equipment.Name}'");
            return Ok(equipment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var equipment = await _context.Equipments.FindAsync(id);
            if (equipment == null) return NotFound("Không tìm thấy!");

            try
            {
                _context.Equipments.Remove(equipment);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Kho vật tư: Đã xuất/xóa hoàn toàn một vật tư khỏi hệ thống!");
                return Ok(new { message = "Đã xóa thành công!" });
            }
            catch (DbUpdateException)
            {
                // Thông báo lỗi nếu có ràng buộc khóa ngoại (ví dụ: vật tư đang được sử dụng trong hóa đơn hoặc phòng)
                return BadRequest(new { message = "Không thể xóa vật tư này vì nó đã có lịch sử giao dịch (đang nằm trong hóa đơn hoặc phòng)!" });
            }
        }
    }
}