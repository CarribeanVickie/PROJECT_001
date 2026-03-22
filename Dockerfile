FROM node:lts-slim AS build
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY dbsetup.js ./
COPY .env.example ./.env

RUN npm run build

FROM node:lts-slim
WORKDIR /app

ENV NODE_ENV=production
# DO NOT hardcode PORT, use the one from Render
ENV PORT=$PORT

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/dbsetup.js ./dbsetup.js

EXPOSE 8080

# Run dbsetup first, then start server
CMD ["sh", "-c", "node dbsetup.js && node dist/middleware/server.js"]