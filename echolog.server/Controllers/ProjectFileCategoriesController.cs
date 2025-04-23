using echolog.server.Data;
using echolog.server.Models;
using echolog.server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/file-categories")]
    [Authorize]
    public class ProjectFileCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IUserContextService _ctx;

        public ProjectFileCategoriesController(ApplicationDbContext db, IUserContextService ctx)
        {
            _db = db;
            _ctx = ctx;
        }

        // GET: /api/file-categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectFileCategory>>> GetAll()
        {
            return await _db.ProjectFileCategories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        // POST: /api/file-categories
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProjectFileCategory>> Create(ProjectFileCategory input)
        {
            _db.ProjectFileCategories.Add(input);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = input.Id }, input);
        }

        // PUT: /api/file-categories/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, ProjectFileCategory input)
        {
            var category = await _db.ProjectFileCategories.FindAsync(id);
            if (category == null)
                return NotFound();

            category.Name = input.Name;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: /api/file-categories/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _db.ProjectFileCategories.FindAsync(id);
            if (category == null)
                return NotFound();

            _db.ProjectFileCategories.Remove(category);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
