namespace HotelManagement.API.DTOs;

// DTO dùng để Thêm mới một dịch vụ (VD: Massage, Giặt ủi)
public class CreateServiceDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int? CategoryId { get; set; }
}

// DTO dùng khi Khách hàng gọi dịch vụ lên phòng
public class OrderServiceRequestDto
{
    public int BookingDetailId { get; set; } // ID của phòng khách đang ở
    public int ServiceId { get; set; }       // Dịch vụ khách gọi
    public int Quantity { get; set; }        // Số lượng
}
// DTO dùng để Cập nhật dịch vụ
public class UpdateServiceDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int? CategoryId { get; set; }
    public string? Status { get; set; } // Ví dụ: "Active", "Inactive"
}