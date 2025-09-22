using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GameDataService.Models;
using GameDataService.Models.DTOs;
using GameDataService.Repositories;
using GameDataService.Repositories.interfaces;
using GameDataService.Services.interfaces;


namespace GameDataService.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _config = config;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<User> RegisterAsync(string email, string password)
    {
        var exists = await _userRepo.GetByEmailAsync(email);
        if (exists != null) throw new Exception("Email already in use");

        var user = new User { Email = email };
        user.PasswordHash = _passwordHasher.HashPassword(user, password);
        return await _userRepo.AddAsync(user);
    }

    public async Task<LoginResponseDto> LoginAsync(string email, string password)
    {
        var user = await _userRepo.GetByEmailAsync(email);
        if (user == null) throw new Exception("Invalid credentials");

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (result == PasswordVerificationResult.Failed) throw new Exception("Invalid credentials");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["JwtSecret"]);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return new LoginResponseDto
        {
            Token = tokenString,
            User = new UserReadDto
            {
                Id = user.Id,
                Email = user.Email
            }
        };
    }
}
