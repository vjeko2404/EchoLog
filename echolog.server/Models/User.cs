namespace echolog.server.Models
{
    public class User
    {
        public int Id { get; set; }

        public required string Username { get; set; }
        public required string PasswordHash { get; set; }

        public int RoleId { get; set; }
        public UserRole Role { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
