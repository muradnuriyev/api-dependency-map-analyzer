# Multi-stage build for Next.js + Prisma (SQLite)

FROM node:20-bullseye AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bullseye AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure OpenSSL 1.1 is available for Prisma engines
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client and create the SQLite schema in the image
RUN npx prisma generate
# Point Prisma at the SQLite file under /app/prisma
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma db push && ls -la /app/prisma
# Build production bundle
RUN npm run build

FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./prisma/dev.db"
# Copy built artifacts and runtime deps
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db
EXPOSE 3000
CMD ["npm", "run", "start"]
