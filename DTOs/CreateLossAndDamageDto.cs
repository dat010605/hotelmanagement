namespace HotelManagement.API.DTOs
{
    public class CreateLossAndDamageDto
    {
        public int BookingDetailId { get; set; }
        public int RoomInventoryId { get; set; }
        public int Quantity { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}