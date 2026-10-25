FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY frontend frontend
RUN npm run build -w frontend

FROM nginx:stable-alpine
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 CMD wget -q -O- http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
