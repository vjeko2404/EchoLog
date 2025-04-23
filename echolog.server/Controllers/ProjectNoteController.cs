using echolog.server.Data;
using echolog.server.DTOs;
using echolog.server.Models;
using echolog.server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/project-notes")]
    [Authorize]
    public class ProjectNoteController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IUserContextService _ctx;

        public ProjectNoteController(ApplicationDbContext db, IUserContextService ctx)
        {
            _db = db;
            _ctx = ctx;
        }

        // GET /api/project-notes/5
        [HttpGet("{projectId}")]
        public async Task<ActionResult<IEnumerable<ProjectNoteDto>>> GetByProjectId(int projectId)
        {
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer" && project.OwnerId != _ctx.UserId)
                return Forbid();

            var notes = await _db.ProjectNotes
                .Where(n => n.ProjectId == projectId)
                .OrderByDescending(n => n.CreatedAt)
                .AsNoTracking()
                .Select(n => new ProjectNoteDto
                {
                    Id = n.Id,
                    ProjectId = n.ProjectId,
                    NoteText = n.NoteText,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notes);
        }

        // POST /api/project-notes
        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<ProjectNoteDto>> Create(ProjectNoteCreateDto dto)
        {
            var project = await _db.Projects.FindAsync(dto.ProjectId);
            if (project == null)
                return BadRequest("Invalid ProjectId");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            var note = new ProjectNote
            {
                ProjectId = dto.ProjectId,
                NoteText = dto.NoteText,
                CreatedAt = DateTime.UtcNow
            };

            _db.ProjectNotes.Add(note);
            await _db.SaveChangesAsync();

            var responseDto = new ProjectNoteDto
            {
                Id = note.Id,
                ProjectId = note.ProjectId,
                NoteText = note.NoteText,
                CreatedAt = note.CreatedAt
            };

            return CreatedAtAction(nameof(GetByProjectId), new { projectId = responseDto.ProjectId }, responseDto);
        }

        // PUT /api/project-notes/12
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int id, ProjectNoteUpdateDto dto)
        {
            var note = await _db.ProjectNotes.FindAsync(id);
            if (note == null)
                return NotFound();

            var project = await _db.Projects.FindAsync(note.ProjectId);
            if (project == null)
                return BadRequest("Orphaned note");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            note.NoteText = dto.NoteText;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /api/project-notes/12
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Delete(int id)
        {
            var note = await _db.ProjectNotes.FindAsync(id);
            if (note == null)
                return NotFound();

            var project = await _db.Projects.FindAsync(note.ProjectId);
            if (project == null)
                return BadRequest("Orphaned note");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            _db.ProjectNotes.Remove(note);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}