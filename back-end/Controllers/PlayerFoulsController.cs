using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerFoulsController : ControllerBase
{
    private readonly IPlayerFoulService _playerFoulService;

    public PlayerFoulsController(IPlayerFoulService playerFoulService)
    {
        _playerFoulService = playerFoulService;
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
