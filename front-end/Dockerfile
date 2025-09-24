# Etapa 1: Construcción de la aplicación (Builder)
FROM node:22-alpine AS builder

WORKDIR /app


COPY package*.json ./
RUN npm ci


COPY . .


RUN npm run build -- --configuration production

# Etapa 2: Servidor web para producción
FROM nginx:alpine


COPY nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/nba-scoreboard/browser /usr/share/nginx/html



EXPOSE 80
