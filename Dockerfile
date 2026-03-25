# -------- Build Stage --------
FROM node:lts-slim AS build
WORKDIR /app

# Install dependencies for build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package.json and install
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source files
COPY tsconfig.json ./
COPY src ./src
COPY dbsetup.js ./

# Build TypeScript
RUN npm run build

# -------- Production Stage --------
FROM node:lts-slim
WORKDIR /app

# Install runtime dependencies
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Copy everything from build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/dbsetup.js ./dbsetup.js

# Expose the port that Render will provide
ENV PORT=$PORT
EXPOSE $PORT

# Use a shell script to safely run dbsetup then start server
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]