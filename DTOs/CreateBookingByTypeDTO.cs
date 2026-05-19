using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs
{
    /// <summary>
    /// DTO cho đặt phòng theo Hạng phòng (Room Type) — dành cho khách hàng.
    /// Hệ thống sẽ tự động gán phòng vật lý trống.
    /// </summary>
    public class CreateBookingByTypeDTO
    {
        [Required(ErrorMessage = "Tên khách hàng là bắt buộc")]
        public string GuestName { get; set; } = null!;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        public string GuestPhone { get; set; } = null!;

        public string? GuestEmail { get; set; }

        public string? VoucherCode { get; set; }

        [Required(ErrorMessage = "Phải chọn hạng phòng")]
        public int RoomTypeId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }
    }
}
