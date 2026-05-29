# Build the client bundle
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
RUN npm run build

# Build the server bundle
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Runtime image: one process serves API/socket + static client
FROM node:20-alpine AS runtime
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_DIST_DIR=/app/client/dist

COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/cache /app/server/cache_seed
COPY --from=client-build /app/client/dist /app/client/dist

RUN mkdir -p /app/server/cache

EXPOSE 8080
CMD ["sh", "-c", "if [ -d /app/server/cache_seed ]; then mkdir -p /app/server/cache; find /app/server/cache -mindepth 1 -maxdepth 1 -exec rm -rf {} +; COPIED=0; for f in /app/server/cache_seed/*; do [ -e \"$f\" ] || continue; name=$(basename \"$f\"); cp \"$f\" \"/app/server/cache/$name\" && COPIED=$((COPIED+1)); done; echo \"[Startup] Overwrote /app/server/cache from cache_seed ($COPIED files copied)\"; else echo '[Startup] WARNING: cache_seed dir missing from image'; fi; exec node dist/index.js"]
