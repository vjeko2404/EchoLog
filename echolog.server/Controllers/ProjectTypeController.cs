using echolog.server.Data;
using echolog.server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/project-types")]
    [Authorize] // All access requires auth
    public class ProjectTypeController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ProjectTypeController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectType>>> GetAll()
        {
            var types = await _db.ProjectTypes.AsNoTracking().ToListAsync();
            return Ok(types);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectType>> GetById(int id)
        {
            var type = await _db.ProjectTypes.FindAsync(id);
            if (type == null)
                return NotFound();

            return Ok(type);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectType>> Create(ProjectType input)
        {
            _db.ProjectTypes.Add(input);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = input.Id }, input);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, ProjectType input)
        {
            if (id != input.Id) return BadRequest();

            var existing = await _db.ProjectTypes.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Value = input.Value;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.ProjectTypes.FindAsync(id);
            if (existing == null) return NotFound();

            _db.ProjectTypes.Remove(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
