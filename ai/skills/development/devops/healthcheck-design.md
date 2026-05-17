# Skill: Healthcheck Design

## Purpose

Design and implement the health check endpoint for the AI NetSuite Implementation OS backend — a lightweight endpoint that reports the application's operational status, used by deployment validation, container orchestrators, and monitoring systems.

## When To Use

Use when first implementing the backend, or when adding a new critical dependency that should be reflected in health status.

## Required Inputs

- List of critical dependencies (database, Redis, AI provider)
- Acceptable health check response time (must be under 200ms)

## Process

1. Implement `GET /api/health` that checks each critical dependency.
2. Return 200 with status `healthy` when all critical checks pass.
3. Return 503 with specific failure details when any critical dependency is down.
4. Include: application version, uptime, database status, cache status.
5. Keep the check fast — use a simple `SELECT 1` for database, `PING` for Redis.

## Output Format

```typescript
// app/backend/routes/health.ts
app.get('/api/health', async (c) => {
  const checks = {
    database: 'unknown' as 'connected' | 'error' | 'unknown',
    cache: 'unknown' as 'connected' | 'error' | 'unknown',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'connected'
  } catch {
    checks.database = 'error'
  }

  const allHealthy = Object.values(checks).every(v => v === 'connected')

  return c.json({
    success: allHealthy,
    data: {
      status: allHealthy ? 'healthy' : 'degraded',
      version: process.env.APP_VERSION ?? 'unknown',
      uptime: process.uptime(),
      ...checks,
    }
  }, allHealthy ? 200 : 503)
})
```

## Validation Rules

- Health check must not require authentication
- Health check must complete in under 200ms
- Health check must return 503 (not 200) when a critical dependency is down

## Risk Checks

- Flag if health check performs heavy operations (complex queries, AI calls)
- Flag if health check is behind auth middleware (it must be public)

## Do Not Do

- Do not return sensitive configuration in the health check response
- Do not use 200 status for a degraded state — use 503

## Example Output

> `GET /api/health` → 200: `{ success: true, data: { status: "healthy", version: "0.1.0", uptime: 3600, database: "connected", cache: "connected" } }`. If database is down → 503: `{ success: false, data: { status: "degraded", database: "error", cache: "connected" } }`.
