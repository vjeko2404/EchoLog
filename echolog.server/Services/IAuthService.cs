using echolog.server.Models;

namespace echolog.server.Services
{
    public interface IAuthService
    {
        Task<AuthResult?> AuthenticateAsync(string username, string password);
    }

    public class AuthResult
    {
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
}
