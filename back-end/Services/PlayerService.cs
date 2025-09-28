using GameDataService.Models;
using GameDataService.Models.DTOs;
using GameDataService.Repositories.interfaces;
using GameDataService.Services.interfaces;

namespace GameDataService.Services;

public class PlayerService(IPlayerRepository playerRepo, ITeamRepository teamRepo) : IPlayerService
{
    private readonly IPlayerRepository _playerRepo = playerRepo;
    private readonly ITeamRepository _teamRepo = teamRepo;

    public async Task<IEnumerable<PlayerReadDto>> GetAllAsync(string? search = null)
    {
        var players = await _playerRepo.GetAll();
        
        // Aplicar filtro de búsqueda si se proporciona
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.ToLower().Trim();
            players = players.Where(p => 
                p.FullName.ToLower().Contains(searchTerm) ||
                p.Position.ToLower().Contains(searchTerm) ||
                (p.Nationality != null && p.Nationality.ToLower().Contains(searchTerm)) ||
                p.JerseyNumber.ToString().Contains(searchTerm)
            ).ToList();
        }

        var playerDtos = new List<PlayerReadDto>();
        
        foreach (var player in players)
        {
            playerDtos.Add(MapToReadDto(player));
        }
        
        return playerDtos;
    }

    public async Task<PlayerReadDto?> GetByIdAsync(int id)
    {
        var player = await _playerRepo.GetById(id);
        return player != null ? MapToReadDto(player) : null;
    }

    public async Task<PlayerReadDto> AddAsync(PlayerWriteDto playerDto)
    {
        var player = MapToEntity(playerDto);
        var createdPlayer = await _playerRepo.Add(player);
        return MapToReadDto(createdPlayer);
    }

    public async Task<PlayerReadDto?> UpdateAsync(int id, PlayerWriteDto playerDto)
    {
        var existingPlayer = await _playerRepo.GetById(id);
        if (existingPlayer == null)
            return null;

        // Update properties
        existingPlayer.FullName = playerDto.FullName;
        existingPlayer.JerseyNumber = playerDto.JerseyNumber;
        existingPlayer.Position = playerDto.Position;
        existingPlayer.TeamId = playerDto.TeamId;
        existingPlayer.Height = playerDto.Height;
        existingPlayer.Age = playerDto.Age;
        existingPlayer.Nationality = playerDto.Nationality;

        var updatedPlayer = await _playerRepo.Update(existingPlayer);
        return updatedPlayer != null ? MapToReadDto(updatedPlayer) : null;
    }

    public async Task<bool> DeleteAsync(int id) => await _playerRepo.Delete(id);

    // Mapping methods
    private PlayerReadDto MapToReadDto(Player player)
    {
        return new PlayerReadDto
        {
            PlayerId = player.PlayerId,
            FullName = player.FullName,
            JerseyNumber = player.JerseyNumber,
            Position = player.Position,
            TeamId = player.TeamId,
            Height = player.Height,
            Age = player.Age,
            Nationality = player.Nationality,
            Team = player.Team != null ? new TeamReadDto
            {
                TeamId = player.Team.TeamId,
                Name = player.Team.Name,
                City = player.Team.City
            } : new TeamReadDto()
        };
    }

    private static Player MapToEntity(PlayerWriteDto playerDto)
    {
        return new Player
        {
            FullName = playerDto.FullName,
            JerseyNumber = playerDto.JerseyNumber,
            Position = playerDto.Position,
            TeamId = playerDto.TeamId,
            Height = playerDto.Height,
            Age = playerDto.Age,
            Nationality = playerDto.Nationality
        };
    }
}
