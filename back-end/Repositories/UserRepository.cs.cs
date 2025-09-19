using Microsoft.EntityFrameworkCore;
using GameDataService.Data;
using GameDataService.Models;
using GameDataService.Repositories.interfaces;


namespace GameDataService.Repositories.interfaces
{
    public class UserRepository : IUserRepository
    {
        private readonly ScoreboardDbContext _context;

        public UserRepository(ScoreboardDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null || string.IsNullOrEmpty(user.PasswordHash)) 
                return null;
            return user;
        }

        public async Task<User> AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
