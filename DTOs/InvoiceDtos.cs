namespace HotelManagement.API.DTOs;

public class InvoiceCalculationResultDto
{
    public int BookingId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;

    public decimal TotalRoomAmount { get; set; }      
    public decimal TotalServiceAmount { get; set; }   
    public decimal TotalDamageAmount { get; set; }    
    public decimal SubTotal { get; set; }             

    public decimal DiscountAmount { get; set; }       
    public decimal TaxAmount { get; set; }            

    public decimal FinalTotal { get; set; }
}

public class ProcessPaymentDto
{
    public int BookingId { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? TransactionCode { get; set; }

    // DTO DÀNH RIÊNG CHO YÊU CẦU TẠO LINK MOMO
    public class MoMoPaymentRequest
    {
        public long Amount { get; set; }
        public string OrderId { get; set; } = string.Empty;
    }
}         

public class RevenueStatDto
{
    public string DateOrMonth { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public int TotalInvoices { get; set; }
}