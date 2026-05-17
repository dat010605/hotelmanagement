using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenitiesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AmenitiesController(AppDbContext context) { _context = context; }

        // 1. GET /api/Amenities
        [HttpGet] 
        public async Task<IActionResult> GetAll() 
        {
            return Ok(await _context.Amenities.ToListAsync());
        }
        
        // 2. POST /api/Amenities
        [HttpPost] 
        public async Task<IActionResult> Create([FromBody] CreateAmenityDto dto)
        {
            var amenity = new Amenity { Name = dto.Name };
            _context.Amenities.Add(amenity);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Thêm tiện nghi thành công!", Id = amenity.Id });
        }

        // 3. PUT /api/Amenities/{id}
        [HttpPut("{id}")] 
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAmenityDto dto)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null) return NotFound("Không tìm thấy tiện nghi này.");
            
            amenity.Name = dto.Name; 
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Cập nhật tiện nghi thành công!" });
        }

        // 4. DELETE /api/Amenities/{id}
        [HttpDelete("{id}")] 
        public async Task<IActionResult> Delete(int id)
        {
            var amenity = await _context.Amenities.FindAsync(id);
            if (amenity == null) return NotFound("Không tìm thấy tiện nghi này.");
            
            _context.Amenities.Remove(amenity);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Xóa tiện nghi thành công!" });
        }
    }
}