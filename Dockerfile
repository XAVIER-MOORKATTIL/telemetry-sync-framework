# Stage 1: Build React Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Final Production Container
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copy Express source code
COPY . .

# Copy compiled React build from Stage 1
COPY --from=client-builder /app/client/build ./client/build

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]