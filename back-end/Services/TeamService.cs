using GameDataService.Models;
using GameDataService.Models.DTOs;
using GameDataService.Repositories.interfaces;
using GameDataService.Services.interfaces;

namespace GameDataService.Services;

public class TeamService(ITeamRepository teamRepo) : ITeamService
{
    private readonly ITeamRepository _teamRepo = teamRepo;

    public async Task<IEnumerable<TeamReadDto>> GetAllAsync()
    {
        var teams = await _teamRepo.GetAll();
        return teams.Select(MapToReadDto);
    }

    public async Task<TeamReadDto?> GetByIdAsync(int id)
    {
        var team = await _teamRepo.GetById(id);
        return team != null ? MapToReadDto(team) : null;
    }

    public async Task<TeamReadDto> AddAsync(TeamWriteDto teamDto)
    {
        var team = MapToEntity(teamDto);
        var createdTeam = await _teamRepo.Add(team);
        return MapToReadDto(createdTeam);
    }

    public async Task<TeamReadDto?> UpdateAsync(int id, TeamWriteDto teamDto)
    {
        var existingTeam = await _teamRepo.GetById(id);
        if (existingTeam == null)
            return null;

        // Update properties
        existingTeam.Name = teamDto.Name;
        existingTeam.City = teamDto.City;

        var updatedTeam = await _teamRepo.Update(existingTeam);
        return updatedTeam != null ? MapToReadDto(updatedTeam) : null;
    }

    public async Task<bool> DeleteAsync(int id) => await _teamRepo.Delete(id);

    // Mapping methods
    private static TeamReadDto MapToReadDto(Team team)
    {
        return new TeamReadDto
        {
            TeamId = team.TeamId,
            Name = team.Name,
            City = team.City
        };
    }

    private static Team MapToEntity(TeamWriteDto teamDto)
    {
        return new Team
        {
            Name = teamDto.Name,
            City = teamDto.City
        };
    }
}
