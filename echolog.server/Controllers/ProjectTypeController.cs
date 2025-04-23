using echolog.server.Data;
using echolog.server.DTOs;
using echolog.server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/project-types")]
    [Authorize]
    public class ProjectTypeController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ProjectTypeController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectTypeDto>>> GetAll()
        {
            var types = await _db.ProjectTypes
                .AsNoTracking()
                .Select(t => new ProjectTypeDto
                {
                    Id = t.Id,
                    Value = t.Value
                })
                .ToListAsync();

            return Ok(types);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectTypeDto>> GetById(int id)
        {
            var type = await _db.ProjectTypes
                .AsNoTracking()
                .Where(t => t.Id == id)
                .Select(t => new ProjectTypeDto
                {
                    Id = t.Id,
                    Value = t.Value
                })
                .FirstOrDefaultAsync();

            if (type == null)
                return NotFound();

            return Ok(type);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectTypeDto>> Create(ProjectTypeCreateDto dto)
        {
            var type = new ProjectType
            {
                Value = dto.Value
            };

            _db.ProjectTypes.Add(type);
            await _db.SaveChangesAsync();

            var responseDto = new ProjectTypeDto
            {
                Id = type.Id,
                Value = type.Value
            };

            return CreatedAtAction(nameof(GetById), new { id = responseDto.Id }, responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, ProjectTypeUpdateDto dto)
        {
            var existing = await _db.ProjectTypes.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Value = dto.Value;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.ProjectTypes.FindAsync(id);
            if (existing == null)
                return NotFound();

            _db.ProjectTypes.Remove(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}