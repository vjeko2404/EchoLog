using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace echolog.server.Services
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _http;

        public UserContextService(IHttpContextAccessor http)
        {
            _http = http;
        }

        public int UserId
        {
            get
            {
                var user = _http.HttpContext?.User;
                if (user?.Identity?.IsAuthenticated != true)
                    return -1;

                var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(idClaim, out var id) ? id : -1;
            }
        }

        public string Role
        {
            get
            {
                var user = _http.HttpContext?.User;
                var role = user?.FindFirst(ClaimTypes.Role)?.Value;
                return role?.ToLowerInvariant() ?? "observer";
            }
        }

        public bool IsAdmin => Role == "admin";
    }
}
