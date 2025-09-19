using GameDataService.Models;


namespace GameDataService.Services.interfaces
{
    public interface IAuthService
    {
        Task<string> LoginAsync(string email, string password);
        Task<User> RegisterAsync(string email, string password);
    }
}
