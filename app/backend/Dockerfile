FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /workspace

COPY tsconfig.base.json ./
COPY app/package.json ./app/package.json
COPY app/backend/package.json app/backend/tsconfig.json ./app/backend/
COPY app/prisma/schema.prisma ./app/prisma/schema.prisma

WORKDIR /workspace/app/backend
RUN pnpm install --no-frozen-lockfile

WORKDIR /workspace/app/backend

EXPOSE 3001

CMD ["sh", "-c", "pnpm db:migrate:prod && pnpm db:generate && pnpm dev"]
