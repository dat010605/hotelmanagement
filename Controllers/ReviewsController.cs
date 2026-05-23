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

        // Helper lấy userId từ JWT — trả null nếu không xác thực được
        private int? GetAuthenticatedUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                return null;
            return id;
        }

        // =====================================================================
        // 1. LẤY TẤT CẢ ĐÁNH GIÁ (Public)
        //    GET: api/Reviews
        // =====================================================================
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

        // =====================================================================
        // 2. LẤY ĐÁNH GIÁ THEO ROOM TYPE (Public — dùng trong Detail Drawer)
        //    GET: api/Reviews/by-room-type/{roomTypeId}
        // =====================================================================
        [HttpGet("by-room-type/{roomTypeId:int}")]
        public async Task<IActionResult> GetReviewsByRoomType(int roomTypeId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.RoomTypeId == roomTypeId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    UserName = r.User != null ? r.User.FullName : "Ẩn danh",
                    UserAvatar = r.User != null ? r.User.AvatarUrl : null,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // =====================================================================
        // 3. KIỂM TRA QUYỀN ĐÁNH GIÁ
        //    GET: api/Reviews/check-eligibility?roomTypeId=X
        //
        //    Quy tắc: User phải có ít nhất 1 Booking chứa RoomType này
        //    VÀ trạng thái Booking là Completed hoặc CheckedOut (đã thanh toán).
        //
        //    Trả về { eligible: bool, alreadyReviewed: bool, reason: string }
        //    → Frontend đọc để hiển thị/ẩn form, KHÔNG gọi lại useEffect khi deps thay đổi.
        // =====================================================================
        [HttpGet("check-eligibility")]
        public async Task<IActionResult> CheckEligibility([FromQuery] int roomTypeId)
        {
            // User chưa đăng nhập → không đủ điều kiện, trả OK (không phải 401)
            // để Frontend render giao diện mà không throw exception
            var userId = GetAuthenticatedUserId();
            if (userId == null)
            {
                return Ok(new
                {
                    eligible = false,
                    alreadyReviewed = false,
                    reason = "not_authenticated"
                });
            }

            // Kiểm tra có Booking hợp lệ (Completed hoặc CheckedOut) chứa roomTypeId này không
            var hasCompletedStay = await _context.BookingDetails
                .AnyAsync(bd =>
                    bd.Booking != null &&
                    bd.Booking.UserId == userId.Value &&
                    bd.RoomTypeId == roomTypeId &&
                    (bd.Booking.Status == "Completed" || bd.Booking.Status == "CheckedOut")
                );

            if (!hasCompletedStay)
            {
                return Ok(new
                {
                    eligible = false,
                    alreadyReviewed = false,
                    reason = "no_completed_booking"
                });
            }

            // Đã đánh giá hạng phòng này chưa
            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.UserId == userId.Value && r.RoomTypeId == roomTypeId);

            return Ok(new
            {
                eligible = !alreadyReviewed,  // đủ điều kiện VÀ chưa review mới eligible
                alreadyReviewed,
                reason = alreadyReviewed ? "already_reviewed" : "ok"
            });
        }

        // =====================================================================
        // 4. TẠO ĐÁNH GIÁ MỚI (Yêu cầu đăng nhập)
        //    POST: api/Reviews
        //
        //    Backend tự validate đủ điều kiện — KHÔNG tin tưởng Frontend.
        //    Nếu không đủ điều kiện → 403 Forbidden (không phải 400).
        // =====================================================================
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto request)
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng. Vui lòng đăng nhập lại.");

            // Validate input
            if (request.RoomTypeId <= 0)
                return BadRequest(new { message = "RoomTypeId không hợp lệ." });

            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest(new { message = "Điểm đánh giá phải từ 1 đến 5." });

            if (string.IsNullOrWhiteSpace(request.Comment) || request.Comment.Trim().Length < 10)
                return BadRequest(new { message = "Nhận xét phải có ít nhất 10 ký tự." });

            // ──────────────────────────────────────────────────────────────────
            // 🔒 GATE 1: Kiểm tra user có Booking đã hoàn thành chứa RoomType này
            //    Status Completed = thanh toán qua CustomerCheckoutPage
            //    Status CheckedOut = checkout cũ (nếu có)
            // ──────────────────────────────────────────────────────────────────
            var hasCompletedStay = await _context.BookingDetails
                .AnyAsync(bd =>
                    bd.Booking != null &&
                    bd.Booking.UserId == userId.Value &&
                    bd.RoomTypeId == request.RoomTypeId &&
                    (bd.Booking.Status == "Completed" || bd.Booking.Status == "CheckedOut")
                );

            if (!hasCompletedStay)
            {
                // 403 Forbidden — không phải 400 — để Frontend phân biệt
                return StatusCode(403, new
                {
                    message = "Chỉ những khách hàng đã đặt và thanh toán hạng phòng này mới có thể để lại đánh giá.",
                    code = "REVIEW_NOT_ELIGIBLE"
                });
            }

            // ──────────────────────────────────────────────────────────────────
            // 🔒 GATE 2: Chống spam — mỗi user chỉ đánh giá 1 lần / room type
            // ──────────────────────────────────────────────────────────────────
            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.UserId == userId.Value && r.RoomTypeId == request.RoomTypeId);

            if (alreadyReviewed)
            {
                return StatusCode(403, new
                {
                    message = "Bạn đã đánh giá hạng phòng này rồi. Mỗi hạng phòng chỉ được đánh giá một lần.",
                    code = "ALREADY_REVIEWED"
                });
            }

            // Tất cả check pass → tạo review
            var review = new Review
            {
                UserId = userId.Value,
                RoomTypeId = request.RoomTypeId,
                Rating = request.Rating,
                Comment = request.Comment.Trim(),
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đánh giá đã được gửi thành công!", ReviewId = review.Id });
        }

        // =====================================================================
        // 5. LẤY LỊCH SỬ ĐẶT PHÒNG CỦA KHÁCH (đã hoàn thành + tất cả đơn)
        //    GET: api/Reviews/my-bookings
        // =====================================================================
        [Authorize]
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyCompletedBookings()
        {
            var userId = GetAuthenticatedUserId();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            var bookings = await _context.Bookings
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.RoomType)
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                .Where(b => b.UserId == userId.Value)
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

            var reviewedRoomTypeIds = await _context.Reviews
                .Where(r => r.UserId == userId.Value)
                .Select(r => r.RoomTypeId)
                .ToListAsync();

            return Ok(new { bookings, reviewedRoomTypeIds });
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
