namespace GameDataService.Models.DTOs;

public class TeamReadDto
{
    public int TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? LogoUrl { get; set; }
}
