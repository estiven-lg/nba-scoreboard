using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace GameDataService.Services
{
    public class SyncService
    {
        private readonly RabbitMqPublisher _publisher;

        public SyncService()
        {
            _publisher = new RabbitMqPublisher();
        }

        public void SyncToQueue(string action, string entity, object rawData)
        {
            // mostramos en consola el objeto que se va a enviar
            Console.WriteLine($"[SyncService] Preparing to send {action} {entity} message to queue");
            // transformamos el objeto segun la entidad
            object transformed = Transform(entity, rawData);
            _publisher.Publish(action, entity, transformed);
        }

        private object Transform(string entity, object data)
        {
            return entity switch
            {
                "Player" => new
                {
                    _id = "player:" + ((dynamic)data).PlayerId.ToString(),
                    doc_type = "player",
                    PlayerId = ((dynamic)data).PlayerId,
                    TeamId = ((dynamic)data).TeamId,
                    Team = ((dynamic)data).Team,
                    JerseyNumber = ((dynamic)data).JerseyNumber,
                    FullName = ((dynamic)data).FullName,
                    Position = ((dynamic)data).Position,
                    Height = ((dynamic)data).Height,
                    Age = ((dynamic)data).Age,
                },
                "Team" => new
                {
                    _id = "team:" + ((dynamic)data).TeamId.ToString(),
                    doc_type = "team",
                    TeamId = ((dynamic)data).TeamId,
                    Name = ((dynamic)data).Name,
                    City = ((dynamic)data).City,
                    LogoUrl = ((dynamic)data).LogoUrl,
                    Players = ((dynamic)data).Players
                },
                "Game" => new
                {
                    _id = "game:" + ((dynamic)data).GameId.ToString(),
                    doc_type = "game",
                    GameId = ((dynamic)data).GameId,
                    HomeTeamId = ((dynamic)data).HomeTeamId,
                    AwayTeamId = ((dynamic)data).AwayTeamId,
                    GameDate = ((dynamic)data).GameDate,
                    HomeScore = ((dynamic)data).HomeScore,
                    AwayScore = ((dynamic)data).AwayScore,
                    HomeTeam = ((dynamic)data).HomeTeam,
                    AwayTeam = ((dynamic)data).AwayTeam,
                    CurrentPeriod = ((dynamic)data).CurrentPeriod,
                    RemainingTime = ((dynamic)data).RemainingTime,
                    GameStatus = ((dynamic)data).GameStatus,
                    PeriodStartTime = ((dynamic)data).PeriodStartTime,
                },  
                "PlayerFoul" => new
                {
                    _id = "playerfoul:" + ((dynamic)data).PlayerFoulId.ToString(),
                    doc_type = "playerfoul",
                    PlayerId = ((dynamic)data).PlayerId,
                    Player = ((dynamic)data).Player,
                    Period = ((dynamic)data).Period,
                    FoulCount = ((dynamic)data).FoulCount,
                    GameId = ((dynamic)data).GameId,
                    Game = ((dynamic)data).Game 
                },
                _ => data
            };
        }
    }
}
