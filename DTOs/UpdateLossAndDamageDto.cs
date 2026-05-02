namespace HotelManagement.API.DTOs
{
    public class UpdateLossAndDamageDto
    {
        // Thêm dấu ? để cho phép null, tránh lỗi "bắt phải có ID vật tư"
        public int? RoomInventoryId { get; set; } 
        public int? Quantity { get; set; }
        public decimal? PenaltyAmount { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? Status { get; set; }
    }
}