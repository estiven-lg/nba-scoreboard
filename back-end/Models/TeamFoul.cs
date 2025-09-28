using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GameDataService.Models;

public class TeamFoul
{
    public int TeamFoulId { get; set; }

    [ForeignKey(nameof(Game))]
    public int GameId { get; set; }

    [ForeignKey(nameof(Team))]
    public int TeamId { get; set; }

    public int Period { get; set; }

    [JsonIgnore]
    public int TotalFouls { get; set; } = 0;

    [JsonIgnore]
    public Game? Game { get; set; }

    [JsonIgnore]
    public Team? Team { get; set; }
}
