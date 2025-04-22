using echolog.server.Data;
using echolog.server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public UserController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET /api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var users = await _db.Users
                .Include(u => u.Role)
                .OrderBy(u => u.Username)
                .AsNoTracking()
                .ToListAsync();

            return Ok(users);
        }

        // GET /api/users/roles
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<UserRole>>> GetRoles()
        {
            var roles = await _db.UserRoles.AsNoTracking().ToListAsync();
            return Ok(roles);
        }

        // POST /api/users
        [HttpPost]
        public async Task<ActionResult<User>> Create(UserCreateDto input)
        {
            if (await _db.Users.AnyAsync(u => u.Username == input.Username))
                return Conflict("Username already exists.");

            var validRole = await _db.UserRoles.FindAsync(input.RoleId);
            if (validRole == null)
                return BadRequest("Invalid role ID.");

            var user = new User
            {
                Username = input.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password),
                RoleId = input.RoleId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }

        // PUT /api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto input)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            if (!string.Equals(user.Username, input.Username, StringComparison.OrdinalIgnoreCase))
            {
                var usernameTaken = await _db.Users.AnyAsync(u => u.Username == input.Username && u.Id != id);
                if (usernameTaken)
                    return Conflict("Username already exists.");
                user.Username = input.Username;
            }

            if (!string.IsNullOrWhiteSpace(input.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password);
            }

            var roleExists = await _db.UserRoles.AnyAsync(r => r.Id == input.RoleId);
            if (!roleExists)
                return BadRequest("Invalid role.");

            user.RoleId = input.RoleId;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
    public class UserUpdateDto
    {
        public required string Username { get; set; }
        public string? Password { get; set; }
        public int RoleId { get; set; }
    }


    public class UserCreateDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public int RoleId { get; set; }
    }
}
