FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

WORKDIR /workspace/app/frontend

COPY app/frontend/package.json ./
RUN pnpm install --no-frozen-lockfile

COPY app/frontend ./

EXPOSE 3000

CMD ["pnpm", "dev"]
