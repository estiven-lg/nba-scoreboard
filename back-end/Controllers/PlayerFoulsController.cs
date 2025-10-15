using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameDataService.Services;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerFoulsController : ControllerBase
{
    private readonly IPlayerFoulService _playerFoulService;
    private readonly SyncService _sync;

    public PlayerFoulsController(IPlayerFoulService playerFoulService, SyncService sync)
    {
        _playerFoulService = playerFoulService;
        _sync = sync;

    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerFoul>>> GetAllPlayerFouls()
    {
        var playerFouls = await _playerFoulService.GetAllAsync();
        return Ok(playerFouls);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlayerFoul>> GetPlayerFoulById(int id)
    {
        var playerFoul = await _playerFoulService.GetByIdAsync(id);
        if (playerFoul == null)
        {
            return NotFound();
        }
        return Ok(playerFoul);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PlayerFoul>> CreatePlayerFoul(PlayerFoul playerFoul)
    {
        var createdPlayerFoul = await _playerFoulService.AddAsync(playerFoul);
        var responsePlayerFoul = await _playerFoulService.GetByIdAsync(createdPlayerFoul.PlayerFoulId);
        _sync.SyncToQueue("POST", "PlayerFoul", responsePlayerFoul);
        return CreatedAtAction(
            nameof(GetPlayerFoulById),
            new { id = createdPlayerFoul.PlayerFoulId },
            createdPlayerFoul
        );
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<PlayerFoul>> UpdatePlayerFoul(int id, PlayerFoul playerFoul)
    {
        if (id != playerFoul.PlayerFoulId)
        {
            return BadRequest();
        }

        var updatedPlayerFoul = await _playerFoulService.UpdateAsync(playerFoul);
        _sync.SyncToQueue("PUT", "PlayerFoul", updatedPlayerFoul);
        if (updatedPlayerFoul == null)
        {
            return NotFound();
        }

        return Ok(updatedPlayerFoul);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeletePlayerFoul(int id)
    {
        var result = await _playerFoulService.DeleteAsync(id);
        _sync.SyncToQueue("DELETE", "PlayerFoul", id);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("{id}/increase")]
    [Authorize]
    public async Task<ActionResult<PlayerFoul>> IncreasePlayerFouls(int id)
    {
        try
        {
            var updatedPlayerFoul = await _playerFoulService.IncreasePlayerFoulsAsync(id);
            _sync.SyncToQueue("PUT", "PlayerFoul", updatedPlayerFoul);
            return Ok(updatedPlayerFoul);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("{id}/decrease")]
    [Authorize]
    public async Task<ActionResult<PlayerFoul>> DecreasePlayerFouls(int id)
    {
        try
        {
            var updatedPlayerFoul = await _playerFoulService.DecreasePlayerFoulsAsync(id);
            _sync.SyncToQueue("PUT", "PlayerFoul", updatedPlayerFoul);
            return Ok(updatedPlayerFoul);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
