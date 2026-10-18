# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json tsconfig*.json nest-cli.json ./

# Stage 2: Development (hot-reload via docker-compose.dev.yml)
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY src ./src/
COPY public ./public/
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Stage 3: Builder
FROM base AS builder
RUN npm ci
COPY src ./src/
RUN npm run build

# Stage 4: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY public ./public/
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3001}/ >/dev/null || exit 1
CMD ["node", "dist/main"]
