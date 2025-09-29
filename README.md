# NBA-scoreboard
## Development
### Front-end

para el front es nesesario usar la version de node 22
```
$ nvm use 22
```

instalamos dependencias
```
$ npm install -g @angular/cli
$ ng version
$ npm install

```
Ejecutar el servidor de desarrollo
```
$ ng serve
```
### Back-end

tener instalado .Net version 8
```
$ dotnet --version
8.0.413
```

Descargar dependencias de NuGet
```
$ dotnet restore
```

Configurar variables de entorno en Revisa *appsettings.json*

```
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=nba;User Id=sa;Password=Abcd_1234;TrustServerCertificate=True;"
  },
  "JwtSecret": "A6.......J",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Aplicar migraciones a la base de datos

```
$ dotnet ef database update
```

Ejecutar la API
```
$ dotnet run
```


Probar la API en : *https://localhost:5204/swagger*

## Produccion
para produccion hacemos uso de docker compose

```
$ docker compose -f docker-compose.production.yml up --build -d
```

es importante el crear las variables de entorno *.env*

```
# front variables
front_port=8585

# back variables
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
JWT_SECRET=A6!........J
# CONNECTION_STRING=Server=db;Database=${MSSQL_DB};User Id=${MSSQL_USER};Password=${MSSQL_SA_PASSWORD};TrustServerCertificate=True;

# Db variables
MSSQL_SA_PASSWORD=Abcd_1234
MSSQL_DB=nba
# MSSQL_PASSWORD=Abcd_1234
```