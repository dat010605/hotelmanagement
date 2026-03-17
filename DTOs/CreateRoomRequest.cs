namespace HotelManagement.API.DTOs

{
    public class CreateRoomRequest
    {
        // Khách hàng sẽ chọn loại phòng (từ Dropdown), ta chỉ cần lấy ID
        public int? RoomTypeId { get; set; }

        // TÊN PHÒNG (Bắt buộc phải có để sửa lỗi 500 Database)
        public string Name { get; set; } = null!;

        // Số phòng bắt buộc phải nhập
        public string RoomNumber { get; set; } = null!;

        // Tầng
        public int? Floor { get; set; }

        // Trạng thái phòng (Ví dụ: "Trống", "Đang dọn dẹp"...)
        public string? Status { get; set; }

    // Class này chỉ dùng riêng cho API PATCH cập nhật trạng thái
    public class UpdateRoomStatusRequest
    {
        public string Status { get; set; } = null!;
    }
}
    }
