namespace echolog.server.Services
{
    public interface IUserContextService
    {
        int UserId { get; }
        string Role { get; }
        bool IsAdmin { get; }
        bool IsObserver { get; }
    }
}
