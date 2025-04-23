using System.ComponentModel.DataAnnotations;

namespace echolog.server.DTOs
{
    public class AuthRequestDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public DateTime Expires { get; set; }
    }
}