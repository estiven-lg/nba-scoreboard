namespace GameDataService.Models;

public class UserWriteDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;   
}