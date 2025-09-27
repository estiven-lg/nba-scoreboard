using Microsoft.AspNetCore.Mvc;
using GameDataService.Services;
using GameDataService.Services.interfaces;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        try
        {
            var user = await _authService.RegisterAsync(req.Email, req.Password);
            return Ok(new { user.Id, user.Email });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try
        {
            var result = await _authService.LoginAsync(req.Email, req.Password);
            return Ok(new { 
                token = result.Token,
                id = result.User.Id,
                email = result.User.Email 
            });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}