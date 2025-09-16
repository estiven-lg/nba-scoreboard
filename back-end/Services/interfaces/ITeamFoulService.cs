using GameDataService.Models;

namespace GameDataService.Services.interfaces;

public interface ITeamFoulService
{
    Task<IEnumerable<TeamFoul>> GetAllAsync();
    Task<TeamFoul?> GetByIdAsync(int id);
    Task<TeamFoul> AddAsync(TeamFoul teamFoul);
    Task<TeamFoul?> UpdateAsync(TeamFoul teamFoul);
    Task<TeamFoul> IncreaseTeamFoulsAsync(int teamFoulId);
    Task<TeamFoul> DecreaseTeamFoulsAsync(int teamFoulId);
    Task<bool> DeleteAsync(int id);
}
