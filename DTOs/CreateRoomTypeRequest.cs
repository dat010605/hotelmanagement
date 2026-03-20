namespace HotelManagement.API.DTOs
{
    public class CreateRoomTypeRequest
    {
        // Bắt buộc phải nhập tên hạng phòng
        public string Name { get; set; } = null!;
        
        // LƯU Ý: Nếu bảng RoomType của bạn trong database có thêm các cột khác 
        // như Mô tả (Description), Sức chứa (Capacity) hay Giá (Price), 
        // bạn hãy gõ thêm các thuộc tính đó vào đây nhé.
    }
}