using System.Text.Json.Serialization;
using GameDataService.Data;
using GameDataService.Models;
using GameDataService.Repositories;
using GameDataService.Repositories.interfaces;
using GameDataService.Services;
using GameDataService.Services.interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;

// using GameDataService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Set connection string from environment variable
if (!builder.Environment.IsDevelopment())
{
    var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
    var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
    builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
    builder.Configuration["JwtSecret"] = jwtSecret;
}

// entity framework
builder.Services.AddDbContext<ScoreboardDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    );
});

// autention JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.ASCII.GetBytes(builder.Configuration["JwtSecret"]))
    };
});

// repositories
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<ITeamRepository, TeamRepository>();
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
builder.Services.AddScoped<ITeamFoulRepository, TeamFoulRepository>();
builder.Services.AddScoped<IPlayerFoulRepository, PlayerFoulRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// services
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<ITeamFoulService, TeamFoulService>();
builder.Services.AddScoped<IPlayerFoulService, PlayerFoulService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAngular",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod();
        }
    );
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ScoreboardDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"No se pudo migrar la base de datos: {ex.Message}");
    }

    if (!db.Teams.Any())
    {
        db.Teams.AddRange(
            new Team { Name = "Home", City = "Azul" },
            new Team { Name = "Visitor", City = "Rojo" }
        );
        db.SaveChanges();
    }

    if (!db.Users.Any(u => u.Email == "admin@gmail.com"))
    {
        var hasher = new PasswordHasher<User>();
        var adminUser = new User
        {
            Email = "admin@gmail.com"
        };
        adminUser.PasswordHash = hasher.HashPassword(adminUser, "admin123");

        db.Users.Add(adminUser);
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
