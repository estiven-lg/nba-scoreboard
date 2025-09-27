using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameDataService.Models.DTOs;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamReadDto>>> GetAllTeams()
    {
        var teams = await _teamService.GetAllAsync();
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamReadDto>> GetTeamById(int id)
    {
        var team = await _teamService.GetByIdAsync(id);
        if (team == null)
        {
            return NotFound();
        }
        return Ok(team);
    }

    [HttpPost]
    // [Authorize]
    public async Task<ActionResult<TeamReadDto>> CreateTeam(TeamWriteDto team)
    {
        var createdTeam = await _teamService.AddAsync(team);
        return CreatedAtAction(nameof(GetTeamById), new { id = createdTeam.TeamId }, createdTeam);
    }

    [HttpPut("{id}")]
    // [Authorize]
    public async Task<ActionResult<TeamReadDto>> UpdateTeam(int id, TeamWriteDto teamDto)
    {
        var updatedTeam = await _teamService.UpdateAsync(id, teamDto);
        if (updatedTeam == null)
        {
            return NotFound();
        }

        return Ok(updatedTeam);
    }

    [HttpDelete("{id}")]
    // [Authorize]
    public async Task<ActionResult> DeleteTeam(int id)
    {
        var result = await _teamService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}
