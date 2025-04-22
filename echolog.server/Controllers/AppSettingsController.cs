using echolog.server.Data;
using echolog.server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/app-settings")]
    [Authorize(Roles = "Admin")] // whole controller locked
    public class AppSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AppSettingsController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET: /api/app-settings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppSetting>>> GetAll()
        {
            var settings = await _db.AppSettings
                .AsNoTracking()
                .OrderBy(s => s.Key)
                .ToListAsync();

            return Ok(settings);
        }

        // GET: /api/app-settings/ApiPort
        [HttpGet("{key}")]
        public async Task<ActionResult<AppSetting>> GetByKey(string key)
        {
            var setting = await _db.AppSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Key == key);

            if (setting == null)
                return NotFound();

            return Ok(setting);
        }

        // PUT: /api/app-settings/ApiPort
        [HttpPut("{key}")]
        public async Task<IActionResult> Update(string key, [FromBody] string value)
        {
            var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null)
                return NotFound();

            setting.Value = value;
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
