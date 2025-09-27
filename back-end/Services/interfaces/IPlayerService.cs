using GameDataService.Models;
using GameDataService.Models.DTOs;

namespace GameDataService.Services.interfaces;

public interface IPlayerService
{
    Task<IEnumerable<PlayerReadDto>> GetAllAsync();
    Task<PlayerReadDto?> GetByIdAsync(int id);
    Task<PlayerReadDto> AddAsync(PlayerWriteDto playerDto);
    Task<PlayerReadDto?> UpdateAsync(int id, PlayerWriteDto playerDto);
    Task<bool> DeleteAsync(int id);
}
