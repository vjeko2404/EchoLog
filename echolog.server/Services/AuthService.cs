using echolog.server.Data;
using echolog.server.Models;
using Microsoft.EntityFrameworkCore;

namespace echolog.server.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;

        public AuthService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<AuthResult?> AuthenticateAsync(string username, string password)
        {
            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return null;

            return new AuthResult
            {
                UserId = user.Id,
                Username = user.Username,
                Role = user.Role.Name
            };
        }
    }
}
