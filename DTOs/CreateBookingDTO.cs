using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs
{
    public class CreateBookingDTO
    {
        [Required(ErrorMessage = "Tên khách hàng là bắt buộc")]
        public string GuestName { get; set; } = null!;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        public string GuestPhone { get; set; } = null!;

        public string? GuestEmail { get; set; }

        [Required]
        public List<BookingRoomDTO> Rooms { get; set; } = new List<BookingRoomDTO>();
    }

    public class BookingRoomDTO
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }
    }
}