using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GameDataService.Models;

public class PlayerFoul
{
    public int PlayerFoulId { get; set; }

    [ForeignKey(nameof(Game))]
    public int GameId { get; set; }

    [ForeignKey(nameof(Player))]
    public int PlayerId { get; set; }

    public int Period { get; set; }

    [JsonIgnore]
    public int FoulCount { get; set; } = 0;

    [JsonIgnore]
    public Game? Game { get; set; }


    public Player? Player { get; set; }
}
