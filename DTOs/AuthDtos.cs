namespace HotelManagement.API.DTOs;
public class LoginRequest {
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
public class RefreshTokenRequest {
    public string Token { get; set; } = string.Empty;
}
