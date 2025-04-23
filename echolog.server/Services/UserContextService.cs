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

        public string Role =>
    _http.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value ?? "Observer";

        public bool IsAdmin => Role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        public bool IsObserver => Role.Equals("Observer", StringComparison.OrdinalIgnoreCase);

    }
}
