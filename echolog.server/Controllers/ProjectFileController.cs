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
        public async Task<ActionResult<IEnumerable<ProjectFileDto>>> GetByProject(int projectId)
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
                .Select(f => new ProjectFileDto
                {
                    Id = f.Id,
                    ProjectId = f.ProjectId,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    Description = f.Description,
                    UploadedAt = f.UploadedAt
                })
                .ToListAsync();

            return Ok(files);
        }

        // POST /api/project-files
        [HttpPost("upload")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Upload(
    [FromForm] List<IFormFile> files,
    [FromForm] int projectId,
    [FromForm] string? description,
    [FromForm] int? categoryId)
        {
            if (files == null || files.Count == 0)
                return BadRequest("No files received.");

            var project = await _db.Projects.FindAsync(projectId);
            if (project == null) return BadRequest("Invalid Project ID");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            if (categoryId == null)
                return BadRequest("Category is required.");

            var folder = Path.Combine("Uploads", projectId.ToString());
            Directory.CreateDirectory(folder);

            var savedFiles = new List<ProjectFileDto>();

            foreach (var file in files)
            {
                var filePath = Path.Combine(folder, file.FileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await file.CopyToAsync(stream);
                }

                var entry = new ProjectFile
                {
                    ProjectId = projectId,
                    FileName = file.FileName,
                    FilePath = filePath.Replace("\\", "/"),
                    Description = description,
                    CategoryId = categoryId.Value,
                    UploadedAt = DateTime.UtcNow
                };

                _db.ProjectFiles.Add(entry);
                await _db.SaveChangesAsync();

                var category = await _db.ProjectFileCategories
                    .Where(c => c.Id == categoryId)
                    .Select(c => c.Name)
                    .FirstOrDefaultAsync();

                savedFiles.Add(new ProjectFileDto
                {
                    Id = entry.Id,
                    ProjectId = entry.ProjectId,
                    FileName = entry.FileName,
                    FilePath = entry.FilePath,
                    Description = entry.Description,
                    UploadedAt = entry.UploadedAt,
                    CategoryId = entry.CategoryId,
                    CategoryName = category
                });
            }

            return Ok(savedFiles);
        }


        // PUT /api/project-files/9
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> Update(int id, ProjectFileUpdateDto dto)
        {
            var file = await _db.ProjectFiles.FindAsync(id);
            if (file == null)
                return NotFound();

            var project = await _db.Projects.FindAsync(file.ProjectId);
            if (project == null)
                return BadRequest("Orphaned file.");

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId)
                return Forbid();

            file.FileName = dto.FileName;
            file.FilePath = dto.FilePath;
            file.Description = dto.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET: /api/project-files/download/{id}
        [HttpGet("download/{id}")]
        [Authorize]
        public async Task<IActionResult> Download(int id)
        {
            var file = await _db.ProjectFiles.FindAsync(id);
            if (file == null || !System.IO.File.Exists(file.FilePath))
                return NotFound();

            var project = await _db.Projects.FindAsync(file.ProjectId);
            if (project == null)
                return BadRequest();

            if (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId && _ctx.Role != "Observer")
                return Forbid();

            var mime = "application/octet-stream"; // Or use FileExtensionContentTypeProvider

            var bytes = await System.IO.File.ReadAllBytesAsync(file.FilePath);
            return File(bytes, mime, file.FileName);
        }

        // POST: /api/project-files/download-zip
        [HttpPost("download-zip")]
        [Authorize]
        public async Task<IActionResult> DownloadZip([FromBody] List<int> fileIds)
        {
            var files = await _db.ProjectFiles
                .Where(f => fileIds.Contains(f.Id))
                .ToListAsync();

            if (!files.Any()) return NotFound("No valid files found");

            foreach (var f in files)
            {
                var project = await _db.Projects.FindAsync(f.ProjectId);
                if (project == null || (!_ctx.IsAdmin && project.OwnerId != _ctx.UserId && _ctx.Role != "Observer"))
                    return Forbid();
            }

            using var zipStream = new MemoryStream();
            using (var archive = new System.IO.Compression.ZipArchive(zipStream, System.IO.Compression.ZipArchiveMode.Create, true))
            {
                foreach (var file in files)
                {
                    if (!System.IO.File.Exists(file.FilePath)) continue;

                    var entry = archive.CreateEntry(file.FileName, System.IO.Compression.CompressionLevel.Optimal);
                    using var entryStream = entry.Open();
                    using var fileStream = System.IO.File.OpenRead(file.FilePath);
                    await fileStream.CopyToAsync(entryStream);
                }
            }

            zipStream.Position = 0;
            return File(zipStream.ToArray(), "application/zip", "echolog-files.zip");
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