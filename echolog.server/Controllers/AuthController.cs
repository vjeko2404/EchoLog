using echolog.server.Services;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace echolog.server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthRequestDto input)
        {
            var result = await _auth.AuthenticateAsync(input.Username, input.Password);

            if (result == null)
                return Unauthorized("Invalid credentials.");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, result.UserId.ToString()),
                new Claim(ClaimTypes.Name, result.Username),
                new Claim(ClaimTypes.Role, result.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("de80f155e9cc532a9b5f3c61bdfa289e9505f72cb26ad15463176c4713c35b9bd523d1c8c4ad7a2d282cc72e6cfd88076c966f51a7736ead7227762659a2757fe1950ec4e40cbff361cf651732a79cffa90909493368a3bcbbb3dc5bfba182e0cf94b28ae94e823658bd5ca22d9de4e5822f8ba97d2249e46f49600310b50b7bd03360bd07fff59d9a14e28deb5e2b93a523b1902c76afb59e7d489c52020a30f005c43c769e6695f5963b34ec0882a894f709c812be84076af16ae7f713ba7def809c621b3d69562e0ba63e7e0a87353a7f89f56282eee16ed7a0ea679dff0cb9de9cb5207c2a26f6f764b7b0dde0eae24043f4a7303c01ccbbd192744dee27")); // Match Program.cs
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddHours(6);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                expires = expires
            });
        }
    }

    public class AuthRequestDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
}
