using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using HotelManagement.API.Models;
using System.Security.Claims;

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

        // =====================================================
        // 1. LẤY TẤT CẢ ĐÁNH GIÁ (Public)
        // GET: api/Reviews
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.RoomType)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    UserName = r.User != null ? r.User.FullName : "Ẩn danh",
                    UserAvatar = r.User != null ? r.User.AvatarUrl : null,
                    r.RoomTypeId,
                    RoomTypeName = r.RoomType != null ? r.RoomType.Name : "Không xác định",
                    r.Rating,
                    r.Comment,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // =====================================================
        // 2. TẠO ĐÁNH GIÁ MỚI (Yêu cầu đăng nhập)
        // POST: api/Reviews
        // =====================================================
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto request)
        {
            // Lấy UserID từ JWT Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Không xác định được người dùng. Vui lòng đăng nhập lại.");
            }

            // Validate dữ liệu
            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest("Điểm đánh giá phải từ 1 đến 5.");

            if (string.IsNullOrWhiteSpace(request.Comment))
                return BadRequest("Vui lòng viết nhận xét.");

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            // =====================================================
            // VALIDATE THEO ROLE:
            // - Admin / Manager / Lễ Tân / Receptionist: được gửi đánh giá tự do (không cần booking)
            // - Guest: phải có booking đã hoàn thành (Completed / CheckedOut)
            // - Housekeeping / Buồng Phòng: không được đánh giá
            // =====================================================
            var privilegedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Admin", "Manager", "Receptionist", "Lễ Tân"
            };
            var blockedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Housekeeping", "Buồng Phòng"
            };

            if (blockedRoles.Contains(roleClaim))
            {
                return StatusCode(403, "Bộ phận buồng phòng không được phép gửi đánh giá.");
            }

            // Guest: kiểm tra lịch sử đặt phòng hoàn thành
            bool isPrivileged = privilegedRoles.Contains(roleClaim);
            if (!isPrivileged)
            {
                var hasStayed = await _context.BookingDetails
                    .AnyAsync(bd =>
                        bd.Booking != null &&
                        bd.Booking.UserId == userId &&
                        bd.RoomTypeId == request.RoomTypeId &&
                        (bd.Booking.Status == "Completed" || bd.Booking.Status == "CheckedOut")
                    );

                if (!hasStayed)
                {
                    return BadRequest("Bạn chỉ được đánh giá hạng phòng mà bạn đã từng lưu trú và hoàn thành.");
                }
            }

            // Kiểm tra trùng lặp (tất cả role)
            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.UserId == userId && r.RoomTypeId == request.RoomTypeId);

            if (alreadyReviewed)
            {
                return BadRequest("Bạn đã đánh giá hạng phòng này rồi.");
            }

            var review = new Review
            {
                UserId = userId,
                RoomTypeId = request.RoomTypeId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đánh giá đã được gửi thành công!", Review = review });
        }

        // =====================================================
        // 3. LẤY LỊCH SỬ ĐẶT PHÒNG CỦA KHÁCH (đã hoàn thành)
        // GET: api/Reviews/my-bookings
        // =====================================================
        [Authorize]
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyCompletedBookings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Không xác định được người dùng.");
            }

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            var privilegedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Admin", "Manager", "Receptionist", "Lễ Tân"
            };

            // =====================================================
            // Privileged staff (Admin/Manager/Lễ Tân):
            // Trả về tất cả RoomType dưới dạng 1 booking giả để
            // frontend hiển thị nút đánh giá cho từng hạng phòng
            // =====================================================
            if (privilegedRoles.Contains(roleClaim))
            {
                var allRoomTypes = await _context.RoomTypes
                    .Select(rt => new
                    {
                        Id = rt.Id,
                        RoomNumber = "—",
                        RoomTypeId = rt.Id,
                        RoomTypeName = rt.Name,
                        CheckInDate = (DateTime?)null,
                        CheckOutDate = (DateTime?)null,
                        PricePerNight = (decimal?)null
                    })
                    .ToListAsync();

                var reviewedRoomTypeIds = await _context.Reviews
                    .Where(r => r.UserId == userId)
                    .Select(r => r.RoomTypeId)
                    .ToListAsync();

                var syntheticBooking = new[]
                {
                    new
                    {
                        Id = 0,
                        BookingCode = "STAFF-REVIEW",
                        Status = "Completed",
                        GuestName = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
                        Rooms = allRoomTypes
                    }
                };

                return Ok(new { bookings = syntheticBooking, reviewedRoomTypeIds });
            }

            // =====================================================
            // Guest: trả về booking thực tế của user
            // =====================================================
            var bookings = await _context.Bookings
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Id)
                .Select(b => new
                {
                    b.Id,
                    b.BookingCode,
                    b.Status,
                    b.GuestName,
                    Rooms = b.BookingDetails.Select(bd => new
                    {
                        bd.Id,
                        RoomNumber = bd.Room != null ? bd.Room.RoomNumber : "N/A",
                        RoomTypeId = bd.RoomTypeId,
                        RoomTypeName = bd.RoomType != null ? bd.RoomType.Name : "Không xác định",
                        bd.CheckInDate,
                        bd.CheckOutDate,
                        bd.PricePerNight
                    }).ToList()
                })
                .ToListAsync();

            // Lấy danh sách các RoomTypeId mà user đã review
            var guestReviewedIds = await _context.Reviews
                .Where(r => r.UserId == userId)
                .Select(r => r.RoomTypeId)
                .ToListAsync();

            return Ok(new { bookings, reviewedRoomTypeIds = guestReviewedIds });
        }

        // =====================================================
        // 4. XÓA ĐÁNH GIÁ (Admin)
        // DELETE: api/Reviews/{id}
        // =====================================================
        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound("Không tìm thấy đánh giá này.");
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa đánh giá thành công." });
        }
    }

    // DTO cho tạo review
    public class CreateReviewDto
    {
        public int RoomTypeId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
    }
}
