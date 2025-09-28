using GameDataService.Models;
using GameDataService.Models.DTOs;

namespace GameDataService.Services.interfaces;

public interface ITeamService
{
    Task<IEnumerable<TeamReadDto>> GetAllAsync(string? search = null);
    Task<TeamReadDto?> GetByIdAsync(int id);
    Task<TeamReadDto> AddAsync(TeamWriteDto teamDto);
    Task<TeamReadDto?> UpdateAsync(int id, TeamWriteDto teamDto);
    Task<bool> DeleteAsync(int id);
}
