using GameDataService.Models;
using GameDataService.Models.DTOs;
using GameDataService.Services.interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameDataService.Services;

namespace GameDataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;
    private readonly SyncService _sync;

    public GamesController(IGameService gameService, SyncService sync)
    {
        _gameService = gameService;
        _sync = sync;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<GameReadDto>> Create([FromBody] GameWriteDto dto)
    {
        try
        {
            var game = await _gameService.CreateGame(dto);

            var responseGame = await _gameService.GetGame(game.GameId);
            _sync.SyncToQueue("POST", "Game", game);
            return Ok(responseGame);
        }
        catch (InvalidOperationException ex)
        {
            // Devuelve un 409 Conflict con el mensaje de error
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameReadDto>>> GetAll([FromQuery] string? status = null)
    {
        var games = await _gameService.GetGames();
        
        if (!string.IsNullOrEmpty(status))
        {
            games = games.Where(g => g.GameStatus.ToString().Equals(status, StringComparison.OrdinalIgnoreCase) == true);
        }
        
        return Ok(games);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GameReadDto>> Get(int id)
    {
        var game = await _gameService.GetGame(id);
        if (game == null)
        {
            return NotFound();
        }
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    // Puntuación
    [Authorize]
    [HttpPost("{id:int}/score/home")]
    public async Task<ActionResult<GameReadDto>> HomePoints(int id, [FromBody] PointsDto dto)
    {
        var game = await _gameService.AddPointsAsync(id, home: true, dto.Points);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/score/visitor")]
    public async Task<ActionResult<GameReadDto>> VisitorPoints(int id, [FromBody] PointsDto dto)
    {
        var game = await _gameService.AddPointsAsync(id, home: false, dto.Points);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/score/home/decrement")]
    public async Task<ActionResult<GameReadDto>> HomeMinus(int id)
    {
        var game = await _gameService.SubtractPointAsync(id, home: true);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/score/visitor/decrement")]
    public async Task<ActionResult<GameReadDto>> VisitorMinus(int id)
    {
        var game = await _gameService.SubtractPointAsync(id, home: false);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    // Tiempo
    [Authorize]
    [HttpPost("{id:int}/start")]
    public async Task<ActionResult<GameReadDto>> Start(int id, [FromBody] TimeDto dto)
    {
        var game = await _gameService.StartAsync(id, dto.PeriodSeconds);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/pause")]
    public async Task<ActionResult<GameReadDto>> Pause(int id)
    {
        var game = await _gameService.PauseAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/resume")]
    public async Task<ActionResult<GameReadDto>> Resume(int id)
    {
        var game = await _gameService.ResumeAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [HttpPost("{id:int}/reset-period")]
    public async Task<ActionResult<GameReadDto>> ResetPeriod(int id, [FromBody] TimeDto dto)
    {
        var game = await _gameService.ResetPeriodAsync(id, dto.PeriodSeconds);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    // Cuartos
    [Authorize]
    [HttpPost("{id:int}/next-period")]
    public async Task<ActionResult<GameReadDto>> NextPeriod(int id)
    {
        var game = await _gameService.NextPeriodAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/previous-period")]
    public async Task<ActionResult<GameReadDto>> PreviousPeriod(int id)
    {
        var game = await _gameService.PreviousPeriodAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    // General
    [Authorize]
    [HttpPost("{id:int}/reset-game")]
    public async Task<ActionResult<GameReadDto>> ResetGame(int id)
    {
        var game = await _gameService.ResetGameAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/suspend")]
    public async Task<ActionResult<GameReadDto>> Suspend(int id)
    {
        var game = await _gameService.SuspendAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    [Authorize]
    [HttpPost("{id:int}/finish")]
    public async Task<ActionResult<GameReadDto>> Finish(int id)
    {
        var game = await _gameService.FinishGameAsync(id);
        _sync.SyncToQueue("UPDATE", "Game", game);
        return Ok(game);
    }

    // "Guardar": los cambios ya se guardan en cada acción; este endpoint es opcional/no-op.
    [Authorize]
    [HttpPost("{id:int}/save")]
    public async Task<ActionResult<GameReadDto>> Save(int id) =>
        (await _gameService.GetGame(id)) is { } g ? Ok(MapToReadDto(g)) : NotFound();

    private static GameReadDto MapToReadDto(Game game)
    {
        return new GameReadDto
        {
            GameId = game.GameId,
            GameDate = game.GameDate,
            HomeTeamId = game.HomeTeamId,
            AwayTeamId = game.AwayTeamId,
            // HomeScore = game.HomeScore,
            // AwayScore = game.AwayScore,
            // GameStatus = game.GameStatus,
            // CurrentPeriod = game.CurrentPeriod,
            // RemainingTime = game.RemainingTime,
            // PeriodStartTime = game.PeriodStartTime,
            // HomeTeam =
            //     game.HomeTeam != null
            //         ? new TeamReadDto { TeamId = game.HomeTeam.TeamId, Name = game.HomeTeam.Name }
            //         : null,
            // AwayTeam =
            //     game.AwayTeam != null
            //         ? new TeamReadDto { TeamId = game.AwayTeam.TeamId, Name = game.AwayTeam.Name }
            //         : null,
            // TeamFouls =
            //     game.TeamFouls?.Select(tf => new TeamFoulReadDto
            //         {
            //             TeamId = tf.TeamId,
            //             Period = tf.Period,
            //             TotalFouls = tf.TotalFouls,
            //         })
            //         .ToList() ?? new List<TeamFoulReadDto>(),
            // PlayerFouls =
            //     game.PlayerFouls?.Select(pf => new PlayerFoulReadDto
            //         {
            //             PlayerId = pf.PlayerId,
            //             Period = pf.Period,
            //             FoulCount = pf.FoulCount,
            //         })
            //         .ToList() ?? new List<PlayerFoulReadDto>(),
        };
    }
}


