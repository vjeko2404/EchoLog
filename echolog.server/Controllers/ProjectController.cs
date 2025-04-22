using echolog.server.Data;
using echolog.server.Models;
using echolog.server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize] // Must be authenticated
    public class ProjectController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IUserContextService _ctx;

        public ProjectController(ApplicationDbContext db, IUserContextService ctx)
        {
            _db = db;
            _ctx = ctx;
        }

        // GET: /api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetAll()
        {
            var query = _db.Projects.AsQueryable();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer")
                query = query.Where(p => p.OwnerId == _ctx.UserId);

            var projects = await query
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(projects);
        }

        // GET: /api/projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetById(int id)
        {
            var project = await _db.Projects
                .Include(p => p.Detail)
                .Include(p => p.Notes)
                .Include(p => p.Files)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer" && project.OwnerId != _ctx.UserId)
                return Forbid();

            return Ok(project);
        }

        // POST: /api/projects
        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<Project>> Create(Project input)
        {
            input.CreatedAt = DateTime.UtcNow;
            input.OwnerId = _ctx.UserId;

            _db.Projects.Add(input);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = input.Id }, input);
        }

        // PUT: /api/projects/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int id, Project update)
        {
            if (id != update.Id)
                return BadRequest("ID mismatch");

            var project = await _db.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            // Apply changes
            project.ShortDescription = update.ShortDescription;
            project.TypeId = update.TypeId;
            project.StatusId = update.StatusId;
            project.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: /api/projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            _db.Projects.Remove(project);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
