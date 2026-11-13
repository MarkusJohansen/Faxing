# Build the Vite app and bundle the API server, then run both from one small
# Node process: static files from dist/ plus the api/ handlers.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.cjs ./server.cjs
USER node
EXPOSE 8080
# 127.0.0.1, not localhost: busybox wget resolves localhost to ::1 and fails.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server.cjs"]
