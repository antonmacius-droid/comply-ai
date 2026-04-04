# Stage 1: Install dependencies and build
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json* turbo.json ./

# Copy all package.json files for workspace resolution
COPY packages/core/package.json ./packages/core/
COPY packages/web/package.json ./packages/web/
COPY packages/cli/package.json ./packages/cli/
COPY packages/ci/package.json ./packages/ci/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/core/ ./packages/core/
COPY packages/web/ ./packages/web/
COPY packages/cli/ ./packages/cli/
COPY packages/ci/ ./packages/ci/

# Build core first (web depends on it)
RUN npm run build --workspace=packages/core

# Build Next.js web app with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=packages/web

# Stage 2: Production runtime
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 complyai

# Copy standalone Next.js output
COPY --from=builder /app/packages/web/.next/standalone ./
COPY --from=builder /app/packages/web/.next/static ./packages/web/.next/static
COPY --from=builder /app/packages/web/public ./packages/web/public

# Copy core dist for worker processes
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/

USER complyai

EXPOSE 3300

ENV PORT=3300
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/web/server.js"]
