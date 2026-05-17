using HotelManagement.API.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticleCategoriesController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll() { return Ok(); }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateArticleCategoryDto dto) { return Ok(); }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateArticleCategoryDto dto) { return Ok(); }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) { return Ok(); }
    }
}