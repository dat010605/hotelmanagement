using Microsoft.AspNetCore.SignalR;

namespace HotelManagement.API.Hubs
{
   
    public class NotificationHub : Hub
    {
               public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"[SignalR] Có người vừa kết nối: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

               public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"[SignalR] Người dùng {Context.ConnectionId} đã ngắt kết nối.");
            await base.OnDisconnectedAsync(exception);
        }
    }
}