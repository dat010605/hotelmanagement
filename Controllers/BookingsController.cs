using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR; //  BẮT BUỘC THÊM ĐỂ DÙNG SIGNALR
using HotelManagement.API.Models; 
using HotelManagement.API.Hubs;     //  ĐƯỜNG DẪN TỚI TRẠM PHÁT SÓNG NOTIFICATIONHUB

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext; //  KHAI BÁO CÁI LOA PHÁT THANH

        //  BƠM LOA PHÁT THANH VÀO CONSTRUCTOR
        public BookingsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
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
            var busyRoomIds = await _context.BookingDetails
                .Include(bd => bd.Booking)
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn 
                          && bd.Booking != null && bd.Booking.Status != "Cancelled") // Bỏ qua các đơn đã hủy
                .Select(bd => bd.RoomId)
                .Distinct()
                .ToListAsync();

            // 3. TRUY VẤN PHÒNG TRỐNG
            var availableRooms = await _context.Rooms
                .Include(r => r.RoomType) 
                .Where(r => !busyRoomIds.Contains(r.Id))
                .Select(r => new 
                {
                    RoomId = r.Id,
                    RoomTypeName = r.RoomType != null ? r.RoomType.Name : "Không xác định",
                    Price = r.RoomType != null ? r.RoomType.BasePrice : 0m, 
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

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Tạo đơn đặt phòng (Booking) tổng
                var newBooking = new Booking
                {
                    GuestName = request.GuestName,
                    GuestPhone = request.GuestPhone,
                    GuestEmail = request.GuestEmail,
                    BookingCode = "BK" + DateTime.Now.ToString("yyyyMMddHHmmss"), 
                    Status = "Confirmed" 
                };

                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync(); // Lưu để lấy ID của Booking mới

                // 2. Xử lý từng phòng khách đặt (BookingDetail)
                foreach (var roomReq in request.Rooms)
                {
                    var isOverlap = await _context.BookingDetails.AnyAsync(bd => 
                        bd.RoomId == roomReq.RoomId &&
                        bd.CheckInDate < roomReq.CheckOutDate && 
                        bd.CheckOutDate > roomReq.CheckInDate &&
                        bd.Booking != null && bd.Booking.Status != "Cancelled");

                    if (isOverlap)
                    {
                        await transaction.RollbackAsync(); 
                        return BadRequest($"Phòng có ID {roomReq.RoomId} đã bị người khác đặt mất trong khoảng thời gian này. Vui lòng chọn lại!");
                    }

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
                        PricePerNight = room.RoomType.BasePrice 
                    };

                    _context.BookingDetails.Add(newDetail);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); // Xác nhận lưu thành công toàn bộ

                // =================================================================
                // 🔔 MA PHÁP KÍCH HOẠT CHUÔNG BÁO Ở FRONTEND 🔔
                // =================================================================
                string thongBao = $"Khách hàng {request.GuestName} vừa đặt {request.Rooms.Count} phòng!";
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", thongBao);
                // =================================================================

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
                    TotalRooms = b.BookingDetails.Count 
                })
                .OrderByDescending(b => b.Id) 
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
                    Rooms = b.BookingDetails.Select(bd => new 
                    {
                        DetailId = bd.Id,
                        RoomId = bd.RoomId,
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
            // NÂNG CẤP: Include thêm BookingDetails để lấy danh sách phòng khách đã đặt
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound("Không tìm thấy đơn đặt phòng.");
            if (booking.Status == "CheckedIn") return BadRequest("Đơn này đã được Check-in trước đó rồi.");
            if (booking.Status == "Cancelled") return BadRequest("Đơn này đã bị hủy, không thể Check-in.");

            // 1. Đổi trạng thái đơn thành Đang ở
            booking.Status = "CheckedIn";
            
            // Đổi trạng thái vật lý của các phòng thành "Có khách"
            var roomIds = booking.BookingDetails.Select(bd => bd.RoomId).ToList();
            var roomsToUpdate = await _context.Rooms.Where(r => roomIds.Contains(r.Id)).ToListAsync();
            
            foreach(var room in roomsToUpdate)
            {
                room.Status = "Occupied"; // Báo cho Quản lý quỹ phòng và Sơ đồ phòng biết!
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} đã nhận phòng!");

            return Ok(new { Message = "Check-in thành công!", BookingId = booking.Id });
        }
        // PATCH: api/Bookings/{id}/checkout
        [HttpPatch("{id}/checkout")]
        public async Task<IActionResult> CheckOutBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound("Không tìm thấy đơn.");
            if (booking.Status != "CheckedIn") return BadRequest("Đơn này chưa Check-in hoặc đã trả phòng.");

            // 1. Đổi trạng thái đơn thành Đã trả phòng
            booking.Status = "Completed";

            // 2. Đổi trạng thái TẤT CẢ các phòng trong đơn thành Chờ dọn dẹp
            var roomIds = booking.BookingDetails.Select(bd => bd.RoomId).ToList();
            var rooms = await _context.Rooms.Where(r => roomIds.Contains(r.Id)).ToListAsync();
            
            foreach(var room in rooms)
            {
                room.Status = "Maintenance";
                room.CleaningStatus = "Dirty";
            }

            await _context.SaveChangesAsync();

            // Rung chuông báo cáo
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} đã trả phòng & thanh toán thành công!");

            return Ok(new { Message = "Trả phòng thành công!" });
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

            if (booking.Status == "CheckedIn" || booking.Status == "CheckedOut")
            {
                return BadRequest("Khách đã nhận phòng, không thể hủy đơn này nữa.");
            }
            if (booking.Status == "Cancelled")
            {
                return BadRequest("Đơn này đã được hủy trước đó rồi.");
            }

            booking.Status = "Cancelled";
            
            await _context.SaveChangesAsync();

            // 💡 Optional: Báo chuông cho Lễ tân biết có khách vừa hủy phòng
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} vừa HỦY đơn đặt phòng.");

            return Ok(new { Message = "Hủy đơn đặt phòng thành công!", BookingId = booking.Id });
        }
    }
}