# Skill: Docker Compose Setup

## Purpose

Create and maintain the `docker-compose.yml` configuration that starts the complete local development environment for the AI NetSuite Implementation OS with a single command: `docker compose up`.

## When To Use

Use when setting up the initial local development environment, or when adding a new service to the stack (e.g., Redis, a background worker).

## Required Inputs

- Stack definition from ADR-0001 (frontend: Next.js, backend: Hono, DB: PostgreSQL, cache: Redis)
- Environment variable names from `.env.example`
- Port assignments for each service

## Process

1. Define services: `frontend`, `backend`, `postgres`, `redis`.
2. Configure each service with the correct image, build context, ports, and environment variables.
3. Define a shared network for service-to-service communication.
4. Configure volumes for PostgreSQL data persistence in development.
5. Ensure the backend waits for PostgreSQL to be healthy before starting.
6. Document startup commands in the README.

## Output Format

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: netsuite_ai_os
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./app/backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/netsuite_ai_os
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./app/backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./app/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      API_URL: http://backend:3001
    depends_on:
      - backend
    volumes:
      - ./app/frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

## Validation Rules

- PostgreSQL must have a health check — backend must not start before DB is ready
- Volumes must be used for both postgres data and node_modules (prevents host `node_modules` conflicts)
- No real secrets in `docker-compose.yml` — use `.env` file or `environment` with placeholder values

## Risk Checks

- Flag if the backend service does not have `depends_on` with health check condition on postgres
- Flag if `node_modules` volume is not defined (causes permission issues on macOS)

## Do Not Do

- Do not hardcode production secrets in docker-compose.yml
- Do not use `latest` image tags — pin to specific minor versions for reproducibility

## Example Output

> `docker compose up` starts 4 containers: postgres:15-alpine (port 5432), redis:7-alpine (port 6379), backend (port 3001, waits for postgres healthy), frontend (port 3000). Developer visits http://localhost:3000 to see the application.
