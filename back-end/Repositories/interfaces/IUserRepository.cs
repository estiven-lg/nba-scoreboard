using GameDataService.Models;

namespace GameDataService.Repositories.interfaces;

public interface IUserRepository
{
    Task<User> GetByEmailAsync(string email);
    Task<User> AddAsync(User user);
}