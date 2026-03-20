namespace HotelManagement.API.DTOs;

// DTO này dùng để trả dữ liệu ra màn hình cho Thu ngân xem trước khi chốt hóa đơn
public class InvoiceCalculationResultDto
{
    public int BookingId { get; set; }
    public string GuestName { get; set; }
    public string GuestPhone { get; set; }

    // Các khoản thu
    public decimal TotalRoomAmount { get; set; }      // Tổng tiền phòng
    public decimal TotalServiceAmount { get; set; }   // Tổng tiền dịch vụ (ăn uống, giặt ủi...)
    public decimal TotalDamageAmount { get; set; }    // Tổng tiền đền bù (hư hỏng đồ đạc)
    public decimal SubTotal { get; set; }             // Tổng cộng (chưa giảm giá, chưa thuế)

    // Các khoản trừ và thuế
    public decimal DiscountAmount { get; set; }       // Số tiền được giảm giá (từ Voucher/Hạng thành viên)
    public decimal TaxAmount { get; set; }            // Tiền thuế VAT (VD: 10%)

    // Tổng thanh toán cuối cùng
    public decimal FinalTotal { get; set; }
    // DTO này dùng để nhận yêu cầu Thanh toán từ Thu ngân

}
public class ProcessPaymentDto
{
    public int BookingId { get; set; }

    // Phương thức thanh toán: "Cash" (Tiền mặt), "Credit Card" (Quẹt thẻ), "Transfer" (Chuyển khoản)...
    public string PaymentMethod { get; set; } = "Cash";

    // Mã giao dịch ngân hàng/ví điện tử (nếu có)
    public string? TransactionCode { get; set; }
}         
    public class RevenueStatDto
    {
        public string DateOrMonth { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int TotalInvoices { get; set; }
    }