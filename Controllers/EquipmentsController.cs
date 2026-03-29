using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EquipmentsController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _context.Equipments.ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(Equipment equipment)
        {
       //   Đã tự động tính: Tồn kho = Tổng - Đang dùng - Hỏng - Thanh lý
            _context.Equipments.Add(equipment);
            await _context.SaveChangesAsync();
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