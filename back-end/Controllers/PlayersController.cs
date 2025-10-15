using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using GameDataService.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using GameDataService.Services;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _playerService;
    private readonly SyncService _sync;

    public PlayersController(IPlayerService playerService, SyncService sync)
    {
        _playerService = playerService;
        _sync = sync;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerReadDto>>> GetAllPlayers([FromQuery] string? search = null)
    {
        var players = await _playerService.GetAllAsync(search);
        return Ok(players);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlayerReadDto>> GetPlayerById(int id)
    {
        var player = await _playerService.GetByIdAsync(id);
        if (player == null)
            return NotFound();
        
        return Ok(player);
    }


    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PlayerReadDto>> CreatePlayer(PlayerWriteDto playerDto)
    {
        var createdPlayer = await _playerService.AddAsync(playerDto);
        var responsePlayer = await _playerService.GetByIdAsync(createdPlayer.PlayerId);
        _sync.SyncToQueue("POST", "Player", responsePlayer);
        return CreatedAtAction(nameof(GetPlayerById), new { id = createdPlayer.PlayerId }, createdPlayer);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<PlayerReadDto>> UpdatePlayer(int id, PlayerWriteDto playerDto)
    {
        var updatedPlayer = await _playerService.UpdateAsync(id, playerDto);
        if (updatedPlayer == null)
            return NotFound();

        _sync.SyncToQueue("PUT", "Player", updatedPlayer);
        
        return Ok(updatedPlayer);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeletePlayer(int id)
    {
        var result = await _playerService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }

        _sync.SyncToQueue("DELETE", "Player", new { PlayerId = id });

        return NoContent();
    }
}
