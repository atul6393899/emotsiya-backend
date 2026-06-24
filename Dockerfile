# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild bcrypt && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p logs && chown node:node logs

EXPOSE 5000

USER node

CMD ["node", "dist/server.js"]
