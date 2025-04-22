using echolog.server.Data;
using echolog.server.Models;
using echolog.server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/project-details")]
    [Authorize] // All routes require auth
    public class ProjectDetailController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IUserContextService _ctx;

        public ProjectDetailController(ApplicationDbContext db, IUserContextService ctx)
        {
            _db = db;
            _ctx = ctx;
        }

        // GET /api/project-details/5
        [HttpGet("{projectId}")]
        public async Task<ActionResult<ProjectDetail>> GetByProjectId(int projectId)
        {
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer" && project.OwnerId != _ctx.UserId)
                return Forbid();

            var detail = await _db.ProjectDetails.FindAsync(projectId);
            if (detail == null)
                return NotFound();

            return Ok(detail);
        }

        // POST /api/project-details
        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<ProjectDetail>> Create(ProjectDetail input)
        {
            var project = await _db.Projects.FindAsync(input.ProjectId);
            if (project == null)
                return BadRequest("Project does not exist.");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            var duplicate = await _db.ProjectDetails.FindAsync(input.ProjectId);
            if (duplicate != null)
                return Conflict("Detail already exists for this project.");

            _db.ProjectDetails.Add(input);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByProjectId), new { projectId = input.ProjectId }, input);
        }

        // PUT /api/project-details/5
        [HttpPut("{projectId}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int projectId, ProjectDetail input)
        {
            if (projectId != input.ProjectId)
                return BadRequest("ID mismatch.");

            var project = await _db.Projects.FindAsync(projectId);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            var existing = await _db.ProjectDetails.FindAsync(projectId);
            if (existing == null)
                return NotFound();

            existing.FullDescription = input.FullDescription;
            existing.ArchitectureSummary = input.ArchitectureSummary;
            existing.KnownBugs = input.KnownBugs;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
