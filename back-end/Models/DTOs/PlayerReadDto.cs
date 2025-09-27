namespace GameDataService.Models.DTOs;

public class PlayerReadDto
{
    public int PlayerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int JerseyNumber { get; set; }
    public string Position { get; set; } = string.Empty;
    public int TeamId { get; set; }
    public TeamReadDto Team { get; set; } = null!;
    public int Height { get; set; }
    public int Age { get; set; }
    public string Nationality { get; set; } = string.Empty;
}
