using GameDataService.Models;
using GameDataService.Models.DTOs;

namespace GameDataService.Services.interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(string email, string password);
        Task<User> RegisterAsync(string email, string password);
    }
}
