# Etapa 1: Construcción de la aplicación (Builder)
FROM node:22-alpine AS builder

WORKDIR /app


COPY package*.json ./
RUN npm ci


COPY . .



CMD ["npm", "start"]

EXPOSE 3000
