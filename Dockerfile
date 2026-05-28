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
COPY --from=client-build /app/client/dist /app/client/dist

RUN mkdir -p /app/server/cache

EXPOSE 8080
CMD ["node", "dist/index.js"]
