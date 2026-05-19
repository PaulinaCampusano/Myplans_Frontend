# ── Stage 1: build ───────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL vacío → rutas relativas; nginx proxy las reenvía al gateway
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Plantilla nginx — usa envsubst para inyectar GATEWAY_HOST/PORT en runtime
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV GATEWAY_HOST=gateway
ENV GATEWAY_PORT=8095

EXPOSE 80
