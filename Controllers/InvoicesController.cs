using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InvoicesController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // 1. GET: Lấy danh sách tất cả Hóa đơn
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetAllInvoices()
    {
        var invoices = await _context.Invoices
            .Include(i => i.Booking)
            .OrderByDescending(i => i.Id)
            .Select(i => new {
                i.Id, i.BookingId, i.FinalTotal, i.Status,
                GuestName = i.Booking != null ? i.Booking.GuestName : "N/A"
            }).ToListAsync();

        return Ok(invoices);
    }

    // ==========================================
    // 2. GET: Xem chi tiết 1 Hóa đơn (Dùng để in Bill)
    // ==========================================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetInvoiceById(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Booking)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return NotFound("Không tìm thấy hóa đơn này.");
        return Ok(invoice);
    }

    // ==========================================
    // 3. GET: Tính toán hóa đơn tạm tính trước khi thanh toán
    // ==========================================
    [HttpGet("calculate-invoice/{bookingId}")]
    public async Task<IActionResult> CalculateInvoice(int bookingId)
    {
        var result = await CalculateInvoiceInternal(bookingId);
        if (result == null) return NotFound("Không tìm thấy thông tin đặt phòng này.");
        return Ok(result);
    }

    // ==========================================
    // 4. POST: Xác nhận thanh toán & Tạo Hóa đơn
    // ==========================================
    [HttpPost("process-payment")]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto request)
    {
        var booking = await _context.Bookings
            .Include(b => b.BookingDetails).ThenInclude(bd => bd.Room)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId);

        if (booking == null) return NotFound("Không tìm thấy Booking.");
        if (booking.Status == "Completed" || booking.Status == "Paid") 
            return BadRequest("Lỗi: Booking này đã được thanh toán từ trước!");

        var invoiceData = await CalculateInvoiceInternal(request.BookingId);
        if (invoiceData == null) return BadRequest("Lỗi tính tiền.");

        var invoice = new Invoice
        {
            BookingId = request.BookingId,
            TotalRoomAmount = invoiceData.TotalRoomAmount,
            TotalServiceAmount = invoiceData.TotalServiceAmount,
            DiscountAmount = invoiceData.DiscountAmount,
            TaxAmount = invoiceData.TaxAmount,
            FinalTotal = invoiceData.FinalTotal,
            Status = "Paid" 
        };
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync(); 

        var payment = new Payment
        {
            InvoiceId = invoice.Id,
            PaymentMethod = request.PaymentMethod,
            AmountPaid = invoiceData.FinalTotal,
            TransactionCode = request.TransactionCode,
            PaymentDate = DateTime.Now
        };
        _context.Payments.Add(payment);

        booking.Status = "Completed"; 

        foreach (var detail in booking.BookingDetails)
        {
            if (detail.Room != null) detail.Room.Status = "Cleaning"; 
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Thanh toán thành công!", InvoiceId = invoice.Id });
    }

    // ==========================================
    // 5. DELETE: Hủy hóa đơn (Cập nhật trạng thái thành Cancelled)
    // ==========================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelInvoice(int id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null) return NotFound("Không tìm thấy hóa đơn.");

        if (invoice.Status == "Cancelled") return BadRequest("Hóa đơn này đã bị hủy từ trước.");

        invoice.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Đã hủy hóa đơn thành công!" });
    }

    // ==========================================
    // HÀM TIỆN ÍCH: Tính toán tiền (Dùng chung cho API 3 và 4)
    // ==========================================
    private async Task<InvoiceCalculationResultDto?> CalculateInvoiceInternal(int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.User).ThenInclude(u => u.Membership) 
            .Include(b => b.Voucher)                             
            .Include(b => b.BookingDetails).ThenInclude(bd => bd.OrderServices)             
            .Include(b => b.BookingDetails).ThenInclude(bd => bd.LossAndDamages)            
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) return null;

        decimal totalRoomAmount = 0;
        foreach (var detail in booking.BookingDetails)
        {
            int days = (detail.CheckOutDate.Date - detail.CheckInDate.Date).Days;
            if (days <= 0) days = 1; 
            decimal price = (decimal?)detail.PricePerNight ?? 0m;
            totalRoomAmount += days * price; 
        }

        decimal totalServiceAmount = booking.BookingDetails.SelectMany(bd => bd.OrderServices).Sum(os => (decimal?)os.TotalAmount ?? 0m);
        decimal totalDamageAmount = booking.BookingDetails.SelectMany(bd => bd.LossAndDamages).Sum(ld => (decimal?)ld.PenaltyAmount ?? 0m);

        decimal subTotal = totalRoomAmount + totalServiceAmount + totalDamageAmount;
        decimal discountAmount = 0;
        
        if (booking.User?.Membership != null)
        {
            decimal percent = (decimal?)booking.User.Membership.DiscountPercent ?? 0m;
            discountAmount += subTotal * (percent / 100m);
        }

        if (booking.Voucher != null && booking.Voucher.ValidFrom <= DateTime.Now && booking.Voucher.ValidTo >= DateTime.Now)
        {
            decimal minVal = (decimal?)booking.Voucher.MinBookingValue ?? 0m;
            if (subTotal >= minVal)
            {
                decimal discVal = (decimal?)booking.Voucher.DiscountValue ?? 0m;
                if (booking.Voucher.DiscountType == "Percent") discountAmount += subTotal * (discVal / 100m);
                else if (booking.Voucher.DiscountType == "Amount") discountAmount += discVal;
            }
        }

        decimal amountAfterDiscount = subTotal - discountAmount;
        if (amountAfterDiscount < 0) amountAfterDiscount = 0;

        decimal taxAmount = amountAfterDiscount * 0.10m;
        decimal finalTotal = amountAfterDiscount + taxAmount;

        return new InvoiceCalculationResultDto
        {
            BookingId = booking.Id, GuestName = booking.GuestName ?? "Khách vãng lai",
            GuestPhone = booking.GuestPhone ?? "", TotalRoomAmount = totalRoomAmount,
            TotalServiceAmount = totalServiceAmount, TotalDamageAmount = totalDamageAmount,
            SubTotal = subTotal, DiscountAmount = discountAmount,
            TaxAmount = taxAmount, FinalTotal = finalTotal
        };
    }
}