namespace HotelManagement.API.DTOs
{
    public class EmployeeResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? RoleName { get; set; }
        public bool? Status { get; set; }
    }

    public class UpdateEmployeeRequest
    {
        public string FullName { get; set; } = null!;
        public string? Phone { get; set; }
        public int? RoleId { get; set; }
        public bool? Status { get; set; }
    }
    public class CreateEmployeeRequest
    {
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!; // Mật khẩu cho nhân viên mới
    public string? Phone { get; set; }
    public int RoleId { get; set; } // Ví dụ: 2 là Staff, 3 là Manager
    }
}