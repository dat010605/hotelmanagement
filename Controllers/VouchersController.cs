using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; // Đổi lại namespace Models cho khớp với dự án của bạn

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VouchersController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH VOUCHER
        // GET: api/Vouchers
        [HttpGet]
        public async Task<IActionResult> GetVouchers()
        {
            var vouchers = await _context.Vouchers.OrderByDescending(v => v.Id).ToListAsync();
            return Ok(vouchers);
        }

        // 2. TẠO VOUCHER MỚI
        // POST: api/Vouchers
        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] Voucher request)
        {
            // Kiểm tra xem mã code đã bị ai tạo chưa (tránh trùng lặp)
            if (await _context.Vouchers.AnyAsync(v => v.Code.ToUpper() == request.Code.ToUpper()))
            {
                return BadRequest("Mã Voucher này đã tồn tại, vui lòng chọn mã khác!");
            }

            // Format lại dữ liệu cho đẹp
            request.Code = request.Code.ToUpper();
            
            _context.Vouchers.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Tạo mã giảm giá thành công!", Voucher = request });
        }

        // 3. XÓA VOUCHER
        // DELETE: api/Vouchers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
            {
                return NotFound("Không tìm thấy Voucher này.");
            }

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa Voucher thành công!" });
        }

        // ========================================================
        // 4. API ĐẶC BIỆT DÀNH CHO LỄ TÂN (Dùng ở trang Đặt phòng)
        // GET: api/Vouchers/check?code=SUMMER2026
        // ========================================================
        [HttpGet("check")]
        public async Task<IActionResult> CheckVoucher(string code)
        {
            if (string.IsNullOrEmpty(code)) return BadRequest("Vui lòng nhập mã.");

            var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code.ToUpper() == code.ToUpper());
            
            if (voucher == null)
            {
                return NotFound("Mã giảm giá không tồn tại hoặc đã hết hạn.");
            }

            return Ok(voucher);
        }
    }
}