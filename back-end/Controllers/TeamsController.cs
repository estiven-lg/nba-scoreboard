using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameDataService.Models.DTOs;
using GameDataService.Services;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;
    private readonly SyncService _sync;

    public TeamsController(ITeamService teamService, SyncService sync)
    {
        _teamService = teamService;
        _sync = sync;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamReadDto>>> GetAllTeams([FromQuery] string? search = null)
    {
        var teams = await _teamService.GetAllAsync(search);
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
    [Authorize]
    public async Task<ActionResult<TeamReadDto>> CreateTeam(TeamWriteDto team)
    {
        var createdTeam = await _teamService.AddAsync(team);
        var responseTeam = await _teamService.GetByIdAsync(createdTeam.TeamId);
        _sync.SyncToQueue("POST", "Team", responseTeam);
        return CreatedAtAction(nameof(GetTeamById), new { id = createdTeam.TeamId }, createdTeam);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<TeamReadDto>> UpdateTeam(int id, TeamWriteDto teamDto)
    {
        var updatedTeam = await _teamService.UpdateAsync(id, teamDto);
        if (updatedTeam == null)
        {
            return NotFound();
        }

        _sync.SyncToQueue("PUT", "Team", updatedTeam);

        return Ok(updatedTeam);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult> DeleteTeam(int id)
    {
        var result = await _teamService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }

        _sync.SyncToQueue("DELETE", "Team", new { TeamId = id });

        return NoContent();
    }
}
