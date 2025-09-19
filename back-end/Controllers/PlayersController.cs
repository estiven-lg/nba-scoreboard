using GameDataService.Models;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using GameDataService.Models.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace GameDataService.Controllers;

[Authorize]
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
        var dtos = players.Select(p => new PlayerReadDto
        {
            PlayerId = p.PlayerId,
            FullName = p.FullName,
            JerseyNumber = p.JerseyNumber,
            Position = p.Position ?? "",
            TeamId = p.TeamId,
            Height = p.Height,
            Age = p.Age,
            Nationality = p.Nationality ?? ""
        });
        return Ok(dtos);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<PlayerReadDto>> GetPlayerById(int id)
    {
        var p = await _playerService.GetByIdAsync(id);
        if (p == null)
            return NotFound();
        var dto = new PlayerReadDto
        {
            PlayerId = p.PlayerId,
            FullName = p.FullName,
            JerseyNumber = p.JerseyNumber,
            Position = p.Position ?? "",
            TeamId = p.TeamId,
            Height = p.Height,
            Age = p.Age,
            Nationality = p.Nationality ?? ""
        };
        return Ok(dto);
    }


    [HttpPost]
    public async Task<ActionResult<PlayerReadDto>> CreatePlayer(PlayerWriteDto dto)
    {
        var player = new Player
        {
            FullName = dto.FullName,
            JerseyNumber = dto.JerseyNumber,
            Position = dto.Position,
            TeamId = dto.TeamId,
            Height = dto.Height,
            Age = dto.Age,
            Nationality = dto.Nationality
        };
        var createdPlayer = await _playerService.AddAsync(player);
        var readDto = new PlayerReadDto
        {
            PlayerId = createdPlayer.PlayerId,
            FullName = dto.FullName,
            JerseyNumber = createdPlayer.JerseyNumber,
            Position = createdPlayer.Position ?? "",
            TeamId = createdPlayer.TeamId,
            Height = createdPlayer.Height,
            Age = createdPlayer.Age,
            Nationality = createdPlayer.Nationality ?? ""
        };
        return CreatedAtAction(nameof(GetPlayerById), new { id = readDto.PlayerId }, readDto);
    }


    [HttpPut("{id}")]
    public async Task<ActionResult<PlayerReadDto>> UpdatePlayer(int id, PlayerWriteDto dto)
    {
        var player = new Player
        {
            PlayerId = id,
            FullName = dto.FullName,
            JerseyNumber = dto.JerseyNumber,
            Position = dto.Position,
            TeamId = dto.TeamId,
            Height = dto.Height,
            Age = dto.Age,
            Nationality = dto.Nationality
        };
        var updatedPlayer = await _playerService.UpdateAsync(player);
        if (updatedPlayer == null)
            return NotFound();
        var readDto = new PlayerReadDto
        {
            PlayerId = updatedPlayer.PlayerId,
            FullName = dto.FullName,
            JerseyNumber = updatedPlayer.JerseyNumber,
            Position = updatedPlayer.Position ?? "",
            TeamId = updatedPlayer.TeamId,
            Height = updatedPlayer.Height,
            Age = updatedPlayer.Age,
            Nationality = updatedPlayer.Nationality ?? ""
        };
        return Ok(readDto);
    }

    [HttpDelete("{id}")]
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
