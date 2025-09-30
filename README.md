# 🏀 NBA Scoreboard

Proyecto que incluye un **front-end en Angular** y un **back-end en .NET 8**, con soporte para despliegue en **Docker Compose**.

---

## 🚀 Desarrollo

### 🔹 Front-end

Requisitos:
- Node.js **v22** (usando `nvm` recomendado)
- Angular CLI

```bash
# Seleccionar versión de Node.js
nvm use 22

# Instalar dependencias globales
npm install -g @angular/cli
ng version

# Instalar dependencias del proyecto
npm install
```

Ejecutar servidor de desarrollo:

```bash
ng serve
```

---

### 🔹 Back-end

Requisitos:
- .NET **8.0.413**

```bash
dotnet --version
```

Instalar dependencias:

```bash
dotnet restore
```

Configurar variables de entorno en `appsettings.json`:

```json
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

Aplicar migraciones a la base de datos:

```bash
dotnet ef database update
```

Ejecutar la API:

```bash
dotnet run
```

Probar la API en: 👉 [https://localhost:5204/swagger](https://localhost:5204/swagger)

---

## 🛠️ Producción

Para el despliegue en producción se utiliza **Docker Compose**:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

Es necesario crear el archivo **`.env`** con las variables de entorno:

```env
# Front-end
front_port=8585

# Back-end
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
JWT_SECRET=A6!........J
# CONNECTION_STRING=Server=db;Database=${MSSQL_DB};User Id=${MSSQL_USER};Password=${MSSQL_SA_PASSWORD};TrustServerCertificate=True;

# Base de datos
MSSQL_SA_PASSWORD=Abcd_1234
MSSQL_DB=nba
# MSSQL_PASSWORD=Abcd_1234
```

---

## 📌 Notas
- Asegúrate de que **Docker** y **Docker Compose** estén instalados en tu entorno.
- El puerto del front-end se puede configurar con la variable `front_port`.
- Las credenciales y secretos deben almacenarse de forma segura (usa un gestor de secretos en producción).
