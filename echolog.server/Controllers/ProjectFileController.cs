using echolog.server.Data;
using echolog.server.Models;
using echolog.server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/project-files")]
    [Authorize]
    public class ProjectFileController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IUserContextService _ctx;

        public ProjectFileController(ApplicationDbContext db, IUserContextService ctx)
        {
            _db = db;
            _ctx = ctx;
        }

        // GET /api/project-files/5
        [HttpGet("{projectId}")]
        public async Task<ActionResult<IEnumerable<ProjectFile>>> GetByProject(int projectId)
        {
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer" && project.OwnerId != _ctx.UserId)
                return Forbid();

            var files = await _db.ProjectFiles
                .Where(f => f.ProjectId == projectId)
                .OrderByDescending(f => f.UploadedAt)
                .AsNoTracking()
                .ToListAsync();

            return Ok(files);
        }

        // POST /api/project-files
        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<ProjectFile>> Create(ProjectFile input)
        {
            var project = await _db.Projects.FindAsync(input.ProjectId);
            if (project == null)
                return BadRequest("Invalid ProjectId");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            input.UploadedAt = DateTime.UtcNow;

            _db.ProjectFiles.Add(input);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByProject), new { projectId = input.ProjectId }, input);
        }

        // PUT /api/project-files/9
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int id, ProjectFile input)
        {
            if (id != input.Id)
                return BadRequest("ID mismatch");

            var file = await _db.ProjectFiles.FindAsync(id);
            if (file == null)
                return NotFound();

            var project = await _db.Projects.FindAsync(file.ProjectId);
            if (project == null)
                return BadRequest("Orphaned file.");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            file.FileName = input.FileName;
            file.FilePath = input.FilePath;
            file.Description = input.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/project-files/9
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Delete(int id)
        {
            var file = await _db.ProjectFiles.FindAsync(id);
            if (file == null)
                return NotFound();

            var project = await _db.Projects.FindAsync(file.ProjectId);
            if (project == null)
                return BadRequest("Orphaned file.");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            _db.ProjectFiles.Remove(file);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
