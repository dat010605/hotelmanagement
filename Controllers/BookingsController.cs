using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HotelManagement.API.Models; 

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Bookings/AvailableRooms?checkIn=2026-03-20&checkOut=2026-03-25
        [HttpGet("AvailableRooms")]
        public async Task<IActionResult> GetAvailableRooms([FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            // 1. Kiểm tra đầu vào cơ bản
            if (checkIn >= checkOut)
            {
                return BadRequest("Ngày nhận phòng phải trước ngày trả phòng.");
            }

            if (checkIn.Date < DateTime.Today)
            {
                return BadRequest("Không thể đặt phòng cho ngày trong quá khứ.");
            }

            // 2. THUẬT TOÁN CHỐNG TRÙNG PHÒNG (OVERLAP)
            // Tìm tất cả ID của các phòng ĐÃ BỊ ĐẶT (trùng lịch) trong khoảng thời gian khách muốn.
            // Công thức: CheckIn_Của_Khách < CheckOut_Đã_Có VÀ CheckOut_Của_Khách > CheckIn_Đã_Có
            var busyRoomIds = await _context.BookingDetails
                .Include(bd => bd.Booking)
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn 
                          && bd.Booking != null && bd.Booking.Status != "Cancelled") // Bỏ qua các đơn đã hủy
                .Select(bd => bd.RoomId)
                .Distinct()
                .ToListAsync();

            // 3. TRUY VẤN PHÒNG TRỐNG
            // Lấy ra các phòng KHÔNG NẰM TRONG danh sách busyRoomIds ở trên
            var availableRooms = await _context.Rooms
                .Include(r => r.RoomType) 
                .Where(r => !busyRoomIds.Contains(r.Id))
                .Select(r => new 
                {
                    RoomId = r.Id,
                    RoomTypeName = r.RoomType != null ? r.RoomType.Name : "Không xác định",
                    Price = r.RoomType != null ? r.RoomType.BasePrice : 0m, // Thêm 'm' cho kiểu decimal
                    MaxAdults = r.RoomType != null ? r.RoomType.CapacityAdults : 0,
                    MaxChildren = r.RoomType != null ? r.RoomType.CapacityChildren : 0
                })
                .ToListAsync();
                

            return Ok(availableRooms);
            
        }
        // POST: api/Bookings
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] DTOs.CreateBookingDTO request)
        {
            if (request.Rooms == null || !request.Rooms.Any())
            {
                return BadRequest("Phải chọn ít nhất 1 phòng để đặt.");
            }

            // Dùng Transaction để đảm bảo: Nếu lỗi ở 1 phòng thì hủy toàn bộ đơn, không lưu mập mờ
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Tạo đơn đặt phòng (Booking) tổng
                var newBooking = new Booking
                {
                    GuestName = request.GuestName,
                    GuestPhone = request.GuestPhone,
                    GuestEmail = request.GuestEmail,
                    BookingCode = "BK" + DateTime.Now.ToString("yyyyMMddHHmmss"), // Tự động tạo mã BK2026...
                    Status = "Confirmed" // Trạng thái mặc định
                };

                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync(); // Lưu để lấy ID của Booking mới

                // 2. Xử lý từng phòng khách đặt (BookingDetail)
                foreach (var roomReq in request.Rooms)
                {
                    // KIỂM TRA LẠI OVERLAP CHỐT CHẶN CUỐI CÙNG (Tránh 2 người cùng bấm đặt 1 lúc)
                    var isOverlap = await _context.BookingDetails.AnyAsync(bd => 
                        bd.RoomId == roomReq.RoomId &&
                        bd.CheckInDate < roomReq.CheckOutDate && 
                        bd.CheckOutDate > roomReq.CheckInDate &&
                        bd.Booking != null && bd.Booking.Status != "Cancelled");

                    if (isOverlap)
                    {
                        await transaction.RollbackAsync(); // Hủy hết
                        return BadRequest($"Phòng có ID {roomReq.RoomId} đã bị người khác đặt mất trong khoảng thời gian này. Vui lòng chọn lại!");
                    }

                    // Lấy giá tiền gốc của phòng tại thời điểm đặt
                    var room = await _context.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.Id == roomReq.RoomId);
                    if (room == null || room.RoomType == null)
                    {
                        await transaction.RollbackAsync();
                        return NotFound($"Không tìm thấy phòng có ID {roomReq.RoomId}");
                    }

                    var newDetail = new BookingDetail
                    {
                        BookingId = newBooking.Id,
                        RoomId = roomReq.RoomId,
                        RoomTypeId = room.RoomTypeId,
                        CheckInDate = roomReq.CheckInDate,
                        CheckOutDate = roomReq.CheckOutDate,
                        PricePerNight = room.RoomType.BasePrice // Chốt giá lúc đặt
                    };

                    _context.BookingDetails.Add(newDetail);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); // Xác nhận lưu thành công toàn bộ

                return Ok(new { Message = "Đặt phòng thành công!", BookingId = newBooking.Id, BookingCode = newBooking.BookingCode });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi hệ thống: " + ex.Message);
            }
        }
        // GET: api/Bookings
        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Select(b => new 
                {
                    b.Id,
                    b.BookingCode,
                    b.GuestName,
                    b.GuestPhone,
                    b.Status,
                    // Đếm xem đơn này đặt bao nhiêu phòng
                    TotalRooms = b.BookingDetails.Count 
                })
                .OrderByDescending(b => b.Id) // Sắp xếp đơn mới nhất lên đầu
                .ToListAsync();

            return Ok(bookings);
        }
        // GET: api/Bookings/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingDetail(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                    .ThenInclude(bd => bd.Room)
                        .ThenInclude(r => r.RoomType)
                .Where(b => b.Id == id)
                .Select(b => new 
                {
                    b.Id,
                    b.BookingCode,
                    b.GuestName,
                    b.GuestPhone,
                    b.GuestEmail,
                    b.Status,
                    // Lấy chi tiết từng phòng trong đơn này
                    Rooms = b.BookingDetails.Select(bd => new 
                    {
                        DetailId = bd.Id,
                        RoomId = bd.RoomId,
                        // Nếu bảng Room của ngài dùng cột Name thì đổi thành bd.Room.Name nhé
                        RoomName = bd.Room != null ? bd.Room.Id.ToString() : "N/A", 
                        RoomTypeName = bd.Room != null && bd.Room.RoomType != null ? bd.Room.RoomType.Name : "N/A",
                        bd.CheckInDate,
                        bd.CheckOutDate,
                        bd.PricePerNight
                    })
                })
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound("Không tìm thấy đơn đặt phòng này.");
            }

            return Ok(booking);
        }
        // PATCH: api/Bookings/{id}/checkin
        [HttpPatch("{id}/checkin")]
        public async Task<IActionResult> CheckInBooking(int id)
        {
            // Tìm đơn đặt phòng theo ID
            var booking = await _context.Bookings.FindAsync(id);

            if (booking == null)
            {
                return NotFound("Không tìm thấy đơn đặt phòng.");
            }

            // Bắt lỗi logic: Không cho check-in lộn xộn
            if (booking.Status == "CheckedIn")
            {
                return BadRequest("Đơn này đã được Check-in trước đó rồi.");
            }
            if (booking.Status == "Cancelled")
            {
                return BadRequest("Đơn này đã bị hủy, không thể Check-in.");
            }

            // Cập nhật trạng thái
            booking.Status = "CheckedIn";
            
            // Lưu xuống Database
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Check-in thành công!", BookingId = booking.Id });
        }
        // PATCH: api/Bookings/{id}/cancel
        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);

            if (booking == null)
            {
                return NotFound("Không tìm thấy đơn đặt phòng.");
            }

            // Logic: Khách đã ở hoặc đã hủy rồi thì không cho hủy lại
            if (booking.Status == "CheckedIn" || booking.Status == "CheckedOut")
            {
                return BadRequest("Khách đã nhận phòng, không thể hủy đơn này nữa.");
            }
            if (booking.Status == "Cancelled")
            {
                return BadRequest("Đơn này đã được hủy trước đó rồi.");
            }

            // Đổi trạng thái thành Cancelled
            booking.Status = "Cancelled";
            
            // Lưu thay đổi
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Hủy đơn đặt phòng thành công!", BookingId = booking.Id });
        }
    }
}