FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

FROM dependencies AS build
COPY backend backend
RUN npm run db:generate -w backend && npm run build -w backend

FROM dependencies AS migrate
COPY backend/prisma backend/prisma
COPY backend/prisma.config.ts backend/prisma.config.ts
COPY --from=build /app/backend/dist backend/dist
ENV JITI_FS_CACHE=false
USER node
CMD ["npm", "run", "db:deploy", "-w", "backend"]

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev --workspace=backend --include-workspace-root=false && npm cache clean --force
COPY --from=build /app/backend/dist backend/dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 CMD node -e "fetch('http://127.0.0.1:3001/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "backend/dist/server.js"]
