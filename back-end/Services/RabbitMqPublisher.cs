using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace GameDataService.Services
{
    public class RabbitMqPublisher
    {

        async public void Publish(string action, string entity, object payload)
        {
            var factory = new ConnectionFactory() { 
                HostName = "rabbitmq", 
                UserName = "guest", 
                Password = "guest" 
            };

            var connection = await factory.CreateConnectionAsync();
            using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "game_data",
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null
            );

            var message = new
            {
                Action = action,
                Entity = entity,
                Data = payload,
                Timestamp = DateTime.UtcNow
            };

            byte[] body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
            var properties = new BasicProperties
            {
                ContentType = "application/json",
                Persistent = true
            };
            await channel.BasicPublishAsync(exchange: "", routingKey: "game_data", false, properties, body);

            Console.WriteLine($"[x] Sent {action} {entity} message");
        }

 
    }
}
