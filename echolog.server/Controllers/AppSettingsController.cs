using echolog.server.Data;
using echolog.server.DTOs;
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
        public async Task<ActionResult<IEnumerable<AppSettingDto>>> GetAll()
        {
            var settings = await _db.AppSettings
                .AsNoTracking()
                .OrderBy(s => s.Key)
                .Select(s => new AppSettingDto
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value
                })
                .ToListAsync();

            return Ok(settings);
        }

        // GET: /api/app-settings/ApiPort
        [HttpGet("{key}")]
        public async Task<ActionResult<AppSettingDto>> GetByKey(string key)
        {
            var setting = await _db.AppSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Key == key);

            if (setting == null)
                return NotFound();

            return Ok(new AppSettingDto
            {
                Id = setting.Id,
                Key = setting.Key,
                Value = setting.Value
            });
        }

        // PUT: /api/app-settings/ApiPort
        [HttpPut("{key}")]
        public async Task<IActionResult> Update(string key, [FromBody] AppSettingUpdateDto dto)
        {
            var setting = await _db.AppSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (setting == null)
                return NotFound();

            setting.Value = dto.Value;
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}