# Deployment Architecture

> Last updated: 2026-05-13
> Status: Planned — local development setup in Phase 1, cloud deployment in Phase 14+

---

## Local Development

Tool: Docker Compose

Services in local stack:
- `app-frontend` — Next.js dev server (port 3000)
- `app-backend` — Hono API dev server (port 3001)
- `postgres` — PostgreSQL 15 (port 5432)
- `redis` — Redis 7 (port 6379)

Commands (to be implemented in Phase 1):
```bash
docker compose up          # start all services
pnpm dev                   # start frontend and backend in watch mode
pnpm db:migrate            # run Prisma migrations
pnpm db:seed               # seed development data
```

---

## Staging Environment (Phase 1 target)

| Service | Provider |
|---|---|
| Frontend | Vercel (preview deployment) |
| Backend API | Fly.io or Railway |
| Database | Neon or Supabase (managed PostgreSQL) |
| Cache | Upstash (managed Redis) |

CI/CD: GitHub Actions
- On PR: run type check, lint, tests
- On merge to main: deploy to staging automatically
- On release tag: deploy to production (manual approval gate)

---

## Production Environment (Phase 14 target)

| Service | Provider |
|---|---|
| Frontend | Vercel (production) |
| Backend API | Fly.io or Railway (production tier) |
| Database | Neon or Supabase (production tier, with backups) |
| Cache | Upstash (production tier) |
| Secrets | GitHub Actions Secrets / Doppler |
| Monitoring | Sentry (errors) + Datadog or Grafana (metrics) |

---

## Environment Promotion

```
Developer local → PR preview (Vercel) → Staging → Production
```

Each promotion requires:
- All tests passing
- No P0 bugs
- CHANGELOG.md updated
- Release notes written

---

## Backup and Recovery

- Database: automated daily backups via managed provider (Neon/Supabase)
- Point-in-time recovery target: 24 hours
- Application state: stateless (all state in DB + cache), recovery = redeploy
- Document storage: backed up separately (S3-compatible, managed provider)
