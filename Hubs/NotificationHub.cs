using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace HotelManagement.API.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}