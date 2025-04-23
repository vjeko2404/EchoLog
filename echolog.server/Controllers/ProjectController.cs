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
    [Route("api/projects")]
    [Authorize]
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
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
        {
            var query = _db.Projects.AsQueryable();

            if (!_ctx.IsAdmin && !_ctx.IsObserver)
                query = query.Where(p => p.OwnerId == _ctx.UserId);

            var projects = await query
                .Include(p => p.Owner)
                .Include(p => p.Detail)
                .Include(p => p.Notes)
                .Include(p => p.Files)
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    ShortDescription = p.ShortDescription,
                    TypeId = p.TypeId,
                    Type = _db.ProjectTypes.FirstOrDefault(t => t.Id == p.TypeId)!.Value,
                    StatusId = p.StatusId,
                    Status = _db.ProjectStatuses.FirstOrDefault(s => s.Id == p.StatusId)!.Value,
                    OwnerId = p.OwnerId,
                    OwnerUsername = p.Owner.Username,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Detail = p.Detail != null ? new ProjectDetailDto
                    {
                        ProjectId = p.Detail.ProjectId,
                        FullDescription = p.Detail.FullDescription,
                        KnownBugs = p.Detail.KnownBugs,
                        ArchitectureSummary = p.Detail.ArchitectureSummary
                    } : null,
                    Notes = p.Notes.Select(n => new ProjectNoteDto
                    {
                        Id = n.Id,
                        ProjectId = n.ProjectId,
                        NoteText = n.NoteText,
                        CreatedAt = n.CreatedAt
                    }).ToList(),
                    Files = p.Files.Select(f => new ProjectFileDto
                    {
                        Id = f.Id,
                        ProjectId = f.ProjectId,
                        FileName = f.FileName,
                        FilePath = f.FilePath,
                        Description = f.Description,
                        UploadedAt = f.UploadedAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(projects);
        }

        // GET: /api/projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetById(int id)
        {
            var project = await _db.Projects
                .Include(p => p.Owner)
                .Include(p => p.Detail)
                .Include(p => p.Notes)
                .Include(p => p.Files)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer" && project.OwnerId != _ctx.UserId)
                return Forbid();

            var projectDto = new ProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                ShortDescription = project.ShortDescription,
                TypeId = project.TypeId,
                Type = _db.ProjectTypes.FirstOrDefault(t => t.Id == project.TypeId)?.Value ?? string.Empty,
                StatusId = project.StatusId,
                Status = _db.ProjectStatuses.FirstOrDefault(s => s.Id == project.StatusId)?.Value ?? string.Empty,
                OwnerId = project.OwnerId,
                OwnerUsername = project.Owner.Username,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                Detail = project.Detail != null ? new ProjectDetailDto
                {
                    ProjectId = project.Detail.ProjectId,
                    FullDescription = project.Detail.FullDescription,
                    KnownBugs = project.Detail.KnownBugs,
                    ArchitectureSummary = project.Detail.ArchitectureSummary
                } : null,
                Notes = project.Notes.Select(n => new ProjectNoteDto
                {
                    Id = n.Id,
                    ProjectId = n.ProjectId,
                    NoteText = n.NoteText,
                    CreatedAt = n.CreatedAt
                }).ToList(),
                Files = project.Files.Select(f => new ProjectFileDto
                {
                    Id = f.Id,
                    ProjectId = f.ProjectId,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    Description = f.Description,
                    UploadedAt = f.UploadedAt
                }).ToList()
            };

            return Ok(projectDto);
        }

        // POST: /api/projects
        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<ProjectDto>> Create(ProjectCreateDto input)
        {
            var userId = _ctx.UserId;

            var project = new Project
            {
                Title = input.Title,
                ShortDescription = input.ShortDescription,
                TypeId = input.TypeId,
                StatusId = input.StatusId,
                OwnerId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Projects.Add(project);
            await _db.SaveChangesAsync();

            // Return the created project as DTO
            var projectDto = new ProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                ShortDescription = project.ShortDescription,
                TypeId = project.TypeId,
                StatusId = project.StatusId,
                OwnerId = project.OwnerId,
                CreatedAt = project.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, projectDto);
        }

        // PUT: /api/projects/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int id, ProjectUpdateDto dto)
        {
            var project = await _db.Projects.FindAsync(id);
            if (project == null)
                return NotFound();

            // Only Admin can change ownership
            if (_ctx.IsAdmin && dto.OwnerId.HasValue && dto.OwnerId.Value != project.OwnerId)
            {
                var newOwner = await _db.Users.FindAsync(dto.OwnerId.Value);
                if (newOwner != null)
                {
                    project.OwnerId = newOwner.Id;
                }
            }

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            // Apply changes from DTO
            project.Title = dto.Title;
            project.ShortDescription = dto.ShortDescription;
            project.TypeId = dto.TypeId;
            project.StatusId = dto.StatusId;
            project.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: /api/projects/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,User")]
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