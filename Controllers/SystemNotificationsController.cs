using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using HotelManagement.API.Hubs;
using Microsoft.AspNetCore.Authorization;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemNotificationsController : ControllerBase
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SystemNotificationsController(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public class BroadcastRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
        {
            if (!string.IsNullOrEmpty(request.Message))
            {
                await _hubContext.Clients.All.SendAsync("ReceiveNotification", request.Message);
            }
            return Ok(new { success = true });
        }
    }
}
