namespace GameDataService.Models.DTOs;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserReadDto User { get; set; } = null!;
}

