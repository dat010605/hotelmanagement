using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR; 
using HotelManagement.API.Models;
using HotelManagement.API.Hubs;
using Microsoft.AspNetCore.Authorization;     

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext; 

        public BookingsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("AvailableRooms")]
        public async Task<IActionResult> GetAvailableRooms([FromQuery] DateTime checkIn, [FromQuery] DateTime checkOut)
        {
            if (checkIn >= checkOut) return BadRequest("Ngày nhận phòng phải trước ngày trả phòng.");
            if (checkIn.Date < DateTime.Today) return BadRequest("Không thể đặt phòng cho ngày trong quá khứ.");

            var busyRoomIds = await _context.BookingDetails
                .Include(bd => bd.Booking)
                .Where(bd => bd.CheckInDate < checkOut && bd.CheckOutDate > checkIn 
                             && bd.Booking != null && bd.Booking.Status != "Cancelled") 
                .Select(bd => bd.RoomId)
                .Distinct()
                .ToListAsync();

            var availableRooms = await _context.Rooms
                .Include(r => r.RoomType)
                .Where(r => !busyRoomIds.Contains(r.Id))
                .Select(r => new
                {
                    RoomId = r.Id,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType != null ? r.RoomType.Name : "Không xác định",
                    Price = r.RoomType != null ? r.RoomType.BasePrice : 0m,
                    MaxAdults = r.RoomType != null ? r.RoomType.CapacityAdults : 0,
                    MaxChildren = r.RoomType != null ? r.RoomType.CapacityChildren : 0
                })
                .ToListAsync();

            return Ok(availableRooms);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] DTOs.CreateBookingDTO request)
        {
            if (request.Rooms == null || !request.Rooms.Any()) return BadRequest("Phải chọn ít nhất 1 phòng để đặt.");

            // Kiểm tra ngày hợp lệ cho từng phòng đặt
            foreach (var roomReq in request.Rooms)
            {
                if (roomReq.CheckInDate >= roomReq.CheckOutDate)
                {
                    return BadRequest("Ngày nhận phòng phải trước ngày trả phòng.");
                }
                if (roomReq.CheckInDate.Date < DateTime.Today)
                {
                    return BadRequest("Không thể đặt phòng cho ngày trong quá khứ.");
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Kiểm tra voucher nếu có
                int? voucherId = null;
                if (!string.IsNullOrWhiteSpace(request.VoucherCode))
                {
                    var voucher = await _context.Vouchers
                        .FirstOrDefaultAsync(v => v.Code.ToUpper() == request.VoucherCode.ToUpper());
                    if (voucher == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest("Mã khuyến mãi không tồn tại.");
                    }
                    if (voucher.ValidFrom.HasValue && voucher.ValidFrom.Value > DateTime.Now)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest("Mã khuyến mãi chưa tới thời gian sử dụng.");
                    }
                    if (voucher.ValidTo.HasValue && voucher.ValidTo.Value < DateTime.Now)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest("Mã khuyến mãi đã hết hạn.");
                    }
                    if (voucher.UsageLimit.HasValue)
                    {
                        var usedCount = await _context.Bookings.CountAsync(b => b.VoucherId == voucher.Id && b.Status != "Cancelled");
                        if (usedCount >= voucher.UsageLimit.Value)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest("Mã khuyến mãi đã hết lượt sử dụng.");
                        }
                    }

                    if (voucher.RoomTypeId.HasValue)
                    {
                        var roomIds = request.Rooms.Select(r => r.RoomId).ToList();
                        var hasMatchingRoom = await _context.Rooms
                            .AnyAsync(r => roomIds.Contains(r.Id) && r.RoomTypeId == voucher.RoomTypeId.Value);
                        if (!hasMatchingRoom)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest("Mã khuyến mãi này không áp dụng cho hạng phòng bạn chọn.");
                        }
                    }
                    voucherId = voucher.Id;
                }

                // Kiểm tra xem User có đăng nhập không (qua Token)
                int? currentUserId = null;
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int uid))
                {
                    currentUserId = uid;
                }

                var newBooking = new Booking
                {
                    UserId = currentUserId, // 🌟 Gán UserId để hiển thị trong lịch sử của khách hàng
                    GuestName = request.GuestName,
                    GuestPhone = request.GuestPhone,
                    GuestEmail = request.GuestEmail,
                    BookingCode = "BK" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                    VoucherId = voucherId,
                    Status = "Confirmed"
                };
                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync(); 

                foreach (var roomReq in request.Rooms)
                {
                    var isOverlap = await _context.BookingDetails.AnyAsync(bd => 
                        bd.RoomId == roomReq.RoomId && bd.CheckInDate < roomReq.CheckOutDate && 
                        bd.CheckOutDate > roomReq.CheckInDate && bd.Booking != null && bd.Booking.Status != "Cancelled");
                    if (isOverlap)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Phòng có ID {roomReq.RoomId} đã bị người khác đặt mất. Vui lòng chọn lại!");
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
                await transaction.CommitAsync(); 

                string thongBao = $"Khách hàng {request.GuestName} vừa đặt {request.Rooms.Count} phòng!";
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", thongBao);
                return Ok(new { Message = "Đặt phòng thành công!", BookingId = newBooking.Id, BookingCode = newBooking.BookingCode });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi hệ thống: " + ex.Message);
            }
        }

        // ====================================================
        // BOOKING BY ROOM TYPE — Khách chỉ chọn Hạng phòng, hệ thống tự gán phòng trống
        // ====================================================
        [AllowAnonymous]
        [HttpPost("by-type")]
        public async Task<IActionResult> CreateBookingByType([FromBody] DTOs.CreateBookingByTypeDTO request)
        {
            if (request.CheckInDate >= request.CheckOutDate)
                return BadRequest("Ngày nhận phòng phải trước ngày trả phòng.");
            if (request.CheckInDate.Date < DateTime.Today)
                return BadRequest("Không thể đặt phòng cho ngày trong quá khứ.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Tìm phòng trống thuộc hạng phòng được chọn
                var busyRoomIds = await _context.BookingDetails
                    .Include(bd => bd.Booking)
                    .Where(bd => bd.CheckInDate < request.CheckOutDate && bd.CheckOutDate > request.CheckInDate
                                 && bd.Booking != null && bd.Booking.Status != "Cancelled")
                    .Select(bd => bd.RoomId)
                    .Distinct()
                    .ToListAsync();

                var availableRoom = await _context.Rooms
                    .Include(r => r.RoomType)
                    .Where(r => r.RoomTypeId == request.RoomTypeId
                                && !busyRoomIds.Contains(r.Id)
                                && r.Status != "Maintenance")
                    .OrderBy(r => r.Id)
                    .FirstOrDefaultAsync();

                if (availableRoom == null)
                    return BadRequest("Rất tiếc, hạng phòng này hiện đã hết phòng trống trong khoảng thời gian bạn chọn.");

                // Kiểm tra voucher nếu có
                int? voucherId = null;
                if (!string.IsNullOrWhiteSpace(request.VoucherCode))
                {
                    var voucher = await _context.Vouchers
                        .FirstOrDefaultAsync(v => v.Code.ToUpper() == request.VoucherCode.ToUpper());
                    if (voucher == null) { await transaction.RollbackAsync(); return BadRequest("Mã khuyến mãi không tồn tại."); }
                    if (voucher.ValidTo.HasValue && voucher.ValidTo.Value < DateTime.Now) { await transaction.RollbackAsync(); return BadRequest("Mã khuyến mãi đã hết hạn."); }
                    if (voucher.RoomTypeId.HasValue && voucher.RoomTypeId.Value != request.RoomTypeId) { await transaction.RollbackAsync(); return BadRequest("Mã khuyến mãi không áp dụng cho hạng phòng này."); }
                    voucherId = voucher.Id;
                }

                // Lấy userId nếu đăng nhập
                int? currentUserId = null;
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int uid)) currentUserId = uid;

                var newBooking = new Booking
                {
                    UserId = currentUserId,
                    GuestName = request.GuestName,
                    GuestPhone = request.GuestPhone,
                    GuestEmail = request.GuestEmail,
                    BookingCode = "BK" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                    VoucherId = voucherId,
                    Status = "Confirmed"
                };
                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync();

                var detail = new BookingDetail
                {
                    BookingId = newBooking.Id,
                    RoomId = availableRoom.Id,
                    RoomTypeId = request.RoomTypeId,
                    CheckInDate = request.CheckInDate,
                    CheckOutDate = request.CheckOutDate,
                    PricePerNight = availableRoom.RoomType?.BasePrice ?? 0
                };
                _context.BookingDetails.Add(detail);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                await _hubContext.Clients.All.SendAsync("ReceiveNotification",
                    $"Khách {request.GuestName} vừa đặt phòng hạng {availableRoom.RoomType?.Name}!");

                return Ok(new
                {
                    message = "Đặt phòng thành công!",
                    bookingId = newBooking.Id,
                    bookingCode = newBooking.BookingCode,
                    assignedRoom = availableRoom.RoomNumber
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Lỗi hệ thống: " + ex.Message);
            }
        }

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
                        // 🌟 MA PHÁP ĐÃ SỬA: Lấy đúng Số Phòng thay vì ID
                        RoomName = bd.Room != null ? bd.Room.RoomNumber : "N/A", 
                        RoomTypeName = bd.Room != null && bd.Room.RoomType != null ? bd.Room.RoomType.Name : "N/A",
                        bd.CheckInDate,
                        bd.CheckOutDate,
                        bd.PricePerNight
                    })
                })
                .FirstOrDefaultAsync();

            if (booking == null) return NotFound("Không tìm thấy đơn đặt phòng này.");
            return Ok(booking);
        }

        [HttpPatch("{id}/checkin")]
        public async Task<IActionResult> CheckInBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return NotFound("Không tìm thấy đơn đặt phòng.");
            if (booking.Status == "CheckedIn") return BadRequest("Đơn này đã được Check-in trước đó rồi.");
            if (booking.Status == "Cancelled") return BadRequest("Đơn này đã bị hủy, không thể Check-in.");
            
            booking.Status = "CheckedIn";
            var roomIds = booking.BookingDetails.Select(bd => bd.RoomId).ToList();
            var roomsToUpdate = await _context.Rooms.Where(r => roomIds.Contains(r.Id)).ToListAsync();

            foreach(var room in roomsToUpdate)
            {
                room.Status = "Occupied"; 
            }
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} đã nhận phòng!");
            return Ok(new { Message = "Check-in thành công!", BookingId = booking.Id });
        }

        // Khách hàng yêu cầu trả phòng (chuyển sang chờ thanh toán)
        [HttpPatch("{id}/request-checkout")]
        public async Task<IActionResult> RequestCheckOut(int id)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return NotFound("Không tìm thấy đơn.");
            if (booking.Status != "CheckedIn") return BadRequest("Đơn này chưa Check-in hoặc đã trả phòng.");
            
            booking.Status = "PendingCheckout";
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} yêu cầu trả phòng & đang chờ thanh toán.");
            return Ok(new { Message = "Yêu cầu trả phòng đã được ghi nhận. Vui lòng thanh toán để hoàn tất.", BookingId = booking.Id });
        }

        // Lễ tân trực tiếp checkout (dùng cho admin)
        [HttpPatch("{id}/checkout")]
        public async Task<IActionResult> CheckOutBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return NotFound("Không tìm thấy đơn.");
            if (booking.Status != "CheckedIn" && booking.Status != "PendingCheckout") 
                return BadRequest("Đơn này chưa Check-in hoặc đã trả phòng.");
            
            booking.Status = "Completed";
            var roomIds = booking.BookingDetails.Select(bd => bd.RoomId).ToList();
            var rooms = await _context.Rooms.Where(r => roomIds.Contains(r.Id)).ToListAsync();

            foreach(var room in rooms)
            {
                room.Status = "Maintenance";
                room.CleaningStatus = "Dirty";
            }
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} đã trả phòng & thanh toán thành công!");
            return Ok(new { Message = "Trả phòng thành công!" });
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound("Không tìm thấy đơn đặt phòng.");
            if (booking.Status == "CheckedIn" || booking.Status == "CheckedOut") return BadRequest("Khách đã nhận phòng, không thể hủy đơn này nữa.");
            if (booking.Status == "Cancelled") return BadRequest("Đơn này đã được hủy trước đó rồi.");
            
            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", $"Khách {booking.GuestName} vừa HỦY đơn đặt phòng.");
            return Ok(new { Message = "Hủy đơn đặt phòng thành công!", BookingId = booking.Id });
        }
    }
}
