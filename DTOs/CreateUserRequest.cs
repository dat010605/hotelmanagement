public class CreateUserRequest
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public int RoleId { get; set; }
    public string? Password { get; set; } // Cho phép null để dùng pass mặc định
}