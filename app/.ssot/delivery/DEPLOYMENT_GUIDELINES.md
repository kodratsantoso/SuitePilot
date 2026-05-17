# Deployment Guidelines

> Last updated: 2026-05-16 (Prompt 14)

## CI/CD Pipeline Architecture

The deployment pipeline uses GitHub Actions:

- `ci.yml`: install, Prisma generate/validate/migrate, backend/frontend typecheck, production build, backend tests, Docker Compose build.
- `deploy.yml`: manual environment deployment with image tag input, GHCR image publish, deployment command, health check, rollback-on-failure hook.

Pipeline quality gates:

- Prisma schema must validate.
- Migrations must deploy against a PostgreSQL service.
- Backend and frontend TypeScript checks must pass.
- Production build must pass.
- Docker images must build before deployment.

## Environment Strategy

| Environment | Purpose | Deployment Mode |
|---|---|---|
| development | Local iteration and smoke validation | `docker compose up -d --build` |
| staging | Release candidate validation | Compose production overlay or future Kubernetes namespace |
| production | Customer-facing runtime | Compose production overlay with Traefik, TLS, health checks, rollback policy |

Secrets are referenced through environment-specific secret references (`env/development`, `env/staging`, `env/production`) and should be supplied by CI/CD environment secrets or a secret manager.

## Tenant-Aware Deployments

- Deployment metadata stores optional `tenantId` for tenant-specific services.
- Tenant-scoped deployment actions validate that the tenant belongs to the actor organization.
- Tenant runtime isolation is represented by `tenant_slug` in Terraform network naming and by tenant-aware deployment service metadata.
- Future dedicated tenant deployments should use separate runtime namespaces/networks and isolated secrets.

## Logging and Monitoring

- Backend exposes Prometheus text metrics at `/api/health/metrics`.
- Readiness and liveness endpoints are available at `/api/health/ready` and `/api/health/live`.
- `docker-compose.observability.yml` adds Prometheus, Loki, and Promtail.
- Docker services use bounded `json-file` logging in local Compose.
- Deployment dashboard surfaces latest deployment metrics, alerts, logs, and run status.

## Self-Healing and Rollback

- Docker Compose uses `restart: unless-stopped` for local restart self-healing.
- Production overlay includes Docker deploy restart policies and update rollback settings.
- `/api/deployment/services/:serviceId/self-heal` restores desired replicas and marks health as healthy after restart simulation.
- `/api/deployment/rollback` creates a rollback run and restores the last known stable image tag.
- `scripts/rollback.sh` provides a pipeline rollback hook.

## Operational Commands

```bash
pnpm --filter "./app/backend" db:migrate:prod
pnpm typecheck
pnpm build
docker compose config
docker compose build backend frontend
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
./scripts/deploy.sh development latest
./scripts/rollback.sh development
./scripts/healthcheck.sh development
```

## Known Limitations

- Deployment trigger APIs simulate CI/CD execution; external runners should call these APIs with pipeline status events in a future phase.
- Production Compose overlay includes Traefik and rollback policy, but Kubernetes manifests and autoscaling controllers are future work.
- Alert delivery configuration is modeled through alerts and docs; Slack/email webhook delivery is not yet wired to a provider.
- Terraform currently defines tenant-aware Docker network scaffolding only, not full cloud infrastructure.

## Next Implementation Phase

Prompt 15 — Build Security, Compliance & Data Protection Layer: Encryption, Secret Management, Access Logs, GDPR/PDPA Readiness
