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
    [Route("api/project-details")]
    [Authorize]
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
        public async Task<ActionResult<ProjectDetailResponseDto>> GetByProjectId(int projectId)
        {
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && _ctx.Role != "Observer" && project.OwnerId != _ctx.UserId)
                return Forbid();

            var detail = await _db.ProjectDetails.FindAsync(projectId);
            if (detail == null)
                return NotFound();

            // Map to DTO
            var responseDto = new ProjectDetailResponseDto
            {
                ProjectId = detail.ProjectId,
                FullDescription = detail.FullDescription,
                KnownBugs = detail.KnownBugs,
                ArchitectureSummary = detail.ArchitectureSummary
            };

            return Ok(responseDto);
        }

        // POST /api/project-details
        [HttpPost]
        [Authorize(Roles = "Admin,User")]
        public async Task<ActionResult<ProjectDetailResponseDto>> Create(ProjectDetailCreateDto dto)
        {
            var project = await _db.Projects.FindAsync(dto.ProjectId);
            if (project == null)
                return BadRequest("Project does not exist.");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            var duplicate = await _db.ProjectDetails.FindAsync(dto.ProjectId);
            if (duplicate != null)
                return Conflict("Detail already exists for this project.");

            // Map from DTO to model
            var newDetail = new ProjectDetail
            {
                ProjectId = dto.ProjectId,
                FullDescription = dto.FullDescription,
                KnownBugs = dto.KnownBugs,
                ArchitectureSummary = dto.ArchitectureSummary
            };

            _db.ProjectDetails.Add(newDetail);
            await _db.SaveChangesAsync();

            // Map back to response DTO
            var responseDto = new ProjectDetailResponseDto
            {
                ProjectId = newDetail.ProjectId,
                FullDescription = newDetail.FullDescription,
                KnownBugs = newDetail.KnownBugs,
                ArchitectureSummary = newDetail.ArchitectureSummary
            };

            return CreatedAtAction(nameof(GetByProjectId), new { projectId = responseDto.ProjectId }, responseDto);
        }

        // PUT /api/project-details/5
        [HttpPut("{projectId}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int projectId, ProjectDetailUpdateDto dto)
        {
            var project = await _db.Projects.FindAsync(projectId);
            if (project == null)
                return NotFound();

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            var existing = await _db.ProjectDetails.FindAsync(projectId);
            if (existing == null)
                return NotFound();

            // Update only the fields from the DTO
            existing.FullDescription = dto.FullDescription;
            existing.ArchitectureSummary = dto.ArchitectureSummary;
            existing.KnownBugs = dto.KnownBugs;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}