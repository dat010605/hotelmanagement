using HotelManagement.API.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        // 1. GET /api/Articles
        [HttpGet]
        public async Task<IActionResult> GetAll() 
        { 
            return Ok(new { Message = "Lấy danh sách bài viết thành công" }); 
        }

        // 2. POST /api/Articles
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateArticleDto dto) 
        { 
            return Ok(new { Message = "Tạo bài viết thành công" }); 
        }

        // 3. GET /api/Articles/{slug} (Lưu ý: dùng slug thay vì id như trong ảnh gốc)
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug) 
        { 
            return Ok(new { Message = $"Lấy bài viết có slug: {slug}" }); 
        }

        // 4. PUT /api/Articles/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateArticleDto dto) 
        { 
            return Ok(new { Message = $"Cập nhật bài viết {id} thành công" }); 
        }

        // 5. DELETE /api/Articles/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) 
        { 
            return Ok(new { Message = $"Xóa bài viết {id} thành công" }); 
        }

        // 6. POST /api/Articles/{id}/thumbnail (Upload ảnh bìa)
        [HttpPost("{id}/thumbnail")]
        public async Task<IActionResult> UploadThumbnail(int id, IFormFile file) 
        { 
            return Ok(new { Message = $"Upload thumbnail cho bài viết {id} thành công" }); 
        }
    }
}