using System.ComponentModel.DataAnnotations;

namespace echolog.server.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class UserCreateDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        [Required]
        public int RoleId { get; set; }
    }

    public class UserUpdateDto
    {
        [Required]
        public string Username { get; set; } = null!;
        public string? Password { get; set; }
        [Required]
        public int RoleId { get; set; }
    }

    public class UserRoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
    }
}