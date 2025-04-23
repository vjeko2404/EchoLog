using echolog.server.Data;
using echolog.server.DTOs;
using echolog.server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/project-statuses")]
    public class ProjectStatusController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ProjectStatusController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProjectStatusDto>>> GetAll()
        {
            var statuses = await _db.ProjectStatuses
                .AsNoTracking()
                .Select(s => new ProjectStatusDto
                {
                    Id = s.Id,
                    Value = s.Value
                })
                .ToListAsync();

            return Ok(statuses);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProjectStatusDto>> GetById(int id)
        {
            var status = await _db.ProjectStatuses
                .AsNoTracking()
                .Where(s => s.Id == id)
                .Select(s => new ProjectStatusDto
                {
                    Id = s.Id,
                    Value = s.Value
                })
                .FirstOrDefaultAsync();

            if (status == null)
                return NotFound();

            return Ok(status);
        }

        // If you want to add admin-only write endpoints later:
        /*
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectStatusDto>> Create(ProjectStatusDto dto)
        {
            var status = new ProjectStatus
            {
                Value = dto.Value
            };

            _db.ProjectStatuses.Add(status);
            await _db.SaveChangesAsync();

            dto.Id = status.Id;
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, ProjectStatusDto dto)
        {
            if (id != dto.Id)
                return BadRequest();

            var status = await _db.ProjectStatuses.FindAsync(id);
            if (status == null)
                return NotFound();

            status.Value = dto.Value;
            await _db.SaveChangesAsync();

            return NoContent();
        }
        */
    }
}