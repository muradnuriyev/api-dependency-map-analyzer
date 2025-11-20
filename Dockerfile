# Multi-stage build for Next.js + Prisma (SQLite)

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client and create the SQLite schema in the image
RUN npx prisma generate
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma db push
# Build production bundle
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./dev.db"
# Copy built artifacts and runtime deps
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dev.db ./dev.db
EXPOSE 3000
CMD ["npm", "run", "start"]
