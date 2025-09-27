using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using GameDataService.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _playerService;

    public PlayersController(IPlayerService playerService)
    {
        _playerService = playerService;
    }


    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerReadDto>>> GetAllPlayers()
    {
        var players = await _playerService.GetAllAsync();
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
        return CreatedAtAction(nameof(GetPlayerById), new { id = createdPlayer.PlayerId }, createdPlayer);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<PlayerReadDto>> UpdatePlayer(int id, PlayerWriteDto playerDto)
    {
        var updatedPlayer = await _playerService.UpdateAsync(id, playerDto);
        if (updatedPlayer == null)
            return NotFound();
        
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

        return NoContent();
    }
}
