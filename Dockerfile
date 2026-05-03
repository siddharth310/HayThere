FROM node:22-bookworm-slim AS base

WORKDIR /app

# Prisma needs OpenSSL at runtime for database connections.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

COPY . .
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app ./

EXPOSE 3000

# Run migrations at container start so an EC2/ECS deploy can bring up a fresh DB.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
