using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// Thay 'YourProject.Models' bằng namespace chứa AppDbContext của bạn
// using YourProject.Models; 

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto request)
        {
            try
            {
                // 1. RÀNG BUỘC NGHIÊM NGẶT: Khách đã thực sự ở hạng phòng này chưa?
                // Tìm trong các Booking của khách, xem có đơn nào "Completed" và có chứa RoomTypeId này không
                bool hasStayed = await _context.Bookings
                    .AnyAsync(b => b.UserId == request.UserId 
                                && b.Status == "Completed" 
                                && _context.BookingDetails.Any(bd => bd.BookingId == b.Id && bd.RoomTypeId == request.RoomTypeId));

                if (!hasStayed)
                {
                    return BadRequest(new { message = "Bạn chưa từng hoàn tất trải nghiệm hạng phòng này, không thể để lại đánh giá!" });
                }

                // 2. LƯU ĐÁNH GIÁ VÀO DATABASE
                var review = new Review
                {
                    UserId = request.UserId,
                    RoomTypeId = request.RoomTypeId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    CreatedAt = DateTime.Now
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cảm ơn bạn đã để lại đánh giá tuyệt vời!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi máy chủ: " + ex.Message });
            }
        }

        // DTO để nhận dữ liệu từ React gửi lên
        public class CreateReviewDto
        {
            public int UserId { get; set; }
            public int RoomTypeId { get; set; }
            public int Rating { get; set; }
            public string Comment { get; set; }
        }
    }
}