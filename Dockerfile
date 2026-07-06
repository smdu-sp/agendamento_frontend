# Debian slim no build: @next/swc no Alpine costuma falhar com EPERM em alguns hosts.
ARG BASE_IMAGE=mirror.gcr.io/library/node:22-bookworm-slim
ARG RUNNER_IMAGE=mirror.gcr.io/library/node:22-alpine

FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi

FROM ${BASE_IMAGE} AS builder
WORKDIR /app

# Não usar NODE_ENV=production aqui — o build precisa de devDependencies (TypeScript, etc.).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_TELEMETRY_DISABLED=1
ENV XDG_CACHE_HOME=/tmp/.cache

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p .next /tmp/.cache && npm run build

FROM ${RUNNER_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
CMD ["node", "server.js"]
