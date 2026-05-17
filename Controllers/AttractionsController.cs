using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; // Sử dụng đúng namespace chứa AppDbContext

namespace HotelManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AttractionsController : ControllerBase
{
    private readonly AppDbContext _context; // Đã cập nhật theo image_6ab4fb.jpg

    public AttractionsController(AppDbContext context)
    {
        _context = context;
    }

    // Lấy danh sách địa điểm (Dùng cho trang chủ)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Attraction>>> GetAttractions()
    {
        return await _context.Attractions
            .Where(a => a.IsActive == true)
            .OrderBy(a => a.DistanceKm)
            .ToListAsync();
    }

    // Lấy chi tiết một địa điểm (Dùng cho nút "Xem chi tiết")
    [HttpGet("{id}")]
    public async Task<ActionResult<Attraction>> GetAttraction(int id)
    {
        var attraction = await _context.Attractions.FindAsync(id);
        if (attraction == null) return NotFound();
        return attraction;
    }
}