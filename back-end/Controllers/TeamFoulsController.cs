using GameDataService.Models;
using GameDataService.Models.DTOs;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace GameDataService.Controllers;

// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class TeamFoulsController : ControllerBase
{
    private readonly ITeamFoulService _teamFoulService;

    public TeamFoulsController(ITeamFoulService teamFoulService)
    {
        _teamFoulService = teamFoulService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamFoulReadDto>>> GetAllTeamFouls()
    {
        var teamFouls = await _teamFoulService.GetAllAsync();
        return Ok(teamFouls);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamFoulReadDto>> GetTeamFoulById(int id)
    {
        var teamFoul = await _teamFoulService.GetByIdAsync(id);
        if (teamFoul == null)
        {
            return NotFound();
        }
        return Ok(teamFoul);
    }

    [HttpPost]
    public async Task<ActionResult<TeamFoulReadDto>> CreateTeamFoul(TeamFoulWriteDto dto)
    {
        var teamFoul = new TeamFoul
        {
            GameId = dto.GameId,
            TeamId = dto.TeamId,
            Period = dto.Period,
            TotalFouls = dto.TotalFouls
        };
        
        var createdTeamFoul = await _teamFoulService.AddAsync(teamFoul);
        return CreatedAtAction(
            nameof(GetTeamFoulById),
            new { id = createdTeamFoul.TeamFoulId },
            createdTeamFoul
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TeamFoulReadDto>> UpdateTeamFoul(int id, TeamFoulWriteDto dto)
    {
        var existingTeamFoul = await _teamFoulService.GetByIdAsync(id);
        if (existingTeamFoul == null)
        {
            return NotFound();
        }

        existingTeamFoul.GameId = dto.GameId;
        existingTeamFoul.TeamId = dto.TeamId;
        existingTeamFoul.Period = dto.Period;
        existingTeamFoul.TotalFouls = dto.TotalFouls;

        var updatedTeamFoul = await _teamFoulService.UpdateAsync(existingTeamFoul);
        if (updatedTeamFoul == null)
        {
            return NotFound();
        }

        return Ok(updatedTeamFoul);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTeamFoul(int id)
    {
        var result = await _teamFoulService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("{id}/increase")]
    public async Task<ActionResult<TeamFoulReadDto>> IncreaseTeamFouls(int id)
    {
        try
        {
            var updatedTeamFoul = await _teamFoulService.IncreaseTeamFoulsAsync(id);
            return Ok(updatedTeamFoul);
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("{id}/decrease")]
    public async Task<ActionResult<TeamFoulReadDto>> DecreaseTeamFouls(int id)
    {
        try
        {
            var updatedTeamFoul = await _teamFoulService.DecreaseTeamFoulsAsync(id);
            return Ok(updatedTeamFoul);
        }
        catch (ArgumentException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}
