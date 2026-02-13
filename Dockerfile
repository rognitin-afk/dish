# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install dependencies with Bun
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Build (Next.js standalone output is set in next.config.ts)
ENV NODE_ENV=production
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
