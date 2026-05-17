# API Validation Standards

> Last updated: 2026-05-14 (updated Prompt 06)

This document defines the validation standards that all API endpoints must implement.

---

## Request Validation

All API endpoints must validate incoming request data using Zod schemas:

- Required fields must be present and non-empty
- String fields must have defined min/max length constraints
- Enum fields must only accept defined values
- UUID fields must be valid UUIDs
- Date fields must be valid ISO 8601 dates
- Numeric fields must have defined range constraints

Validation errors must return HTTP 422 Unprocessable Entity with a structured error body listing each failing field.

---

## Response Contracts

- All responses follow the standard envelope format defined in `API_CONTRACTS.md`
- Success responses include `success: true` and a `data` field
- Error responses include `success: false` and an `error` object with `code` and `message`
- Paginated responses include `meta` with `page`, `perPage`, `total`, `totalPages`

---

## Organization Scoping Validation

Every endpoint that returns or modifies data must verify:
1. The resource belongs to the authenticated user's organization
2. A mismatch returns HTTP 404 (not 403) to avoid leaking existence of resources in other organizations

---

## AI Output Validation

Before storing an AI-generated output:
- Output must not be empty or below a minimum length threshold
- Output must include required structural sections (checked by Governance Agent)
- Output must be stored with its source `conversationId`, `agentId`, `skillId`, and `model` version

---

## Audit Log Validation

Every write operation on the following resource types must produce an audit log entry:
- Organization, User, Customer, Project, ProjectMember
- AiGeneratedOutput (every status change)
- AiReview (every review decision)
- ProjectDocument (creation, update, publication)
- DiscoverySession (creation, completion)

---

## AI Presales Intelligence Endpoint Validation (Added Prompt 06)

### Input Validation — All Presales POST Endpoints

| Rule | Applies To | Enforcement |
|---|---|---|
| `projectId` must be a valid UUID belonging to caller's org | All presales endpoints | 404 if not found in org |
| If `requirementIds` provided, all IDs must belong to the project | analyze-requirements | 422 if any ID is invalid |
| If `painPointIds` provided, all IDs must belong to the project | classify-pain-points | 422 if any ID is invalid |
| Project must have at least 1 requirement to run analysis | analyze-requirements, recommend-modules, estimate-scope, generate-proposal-draft | 422 with descriptive message |
| Project must have at least 1 pain point to run classification | classify-pain-points | 422 with descriptive message |
| Scope estimation requires at least 1 approved module recommendation | estimate-scope | 422 if no module recommendations exist |
| Proposal draft requires all 4 preceding analyses to have results | generate-proposal-draft | 422 listing which analyses are missing |

### AI Response Validation — Before Storing

| Rule | Applies To | Enforcement |
|---|---|---|
| AI response must parse as valid JSON matching expected schema | All skills | 500 + do not store if parsing fails |
| `confidenceScore` must be an integer 0–100 | All skills | Clamp to range server-side; log warning |
| `evidence` array must be non-empty on analysis outputs | analyze-requirements, recommend-modules | 422 if empty; do not store |
| `sections` array must contain exactly 9 items for proposal draft | generate-proposal-draft | 500 if count != 9; retry or fallback |
| All required string fields in AI response must be non-empty | All skills | 500 + do not store if any required field is empty |

### Service Availability Validation

| Condition | Response |
|---|---|
| `ANTHROPIC_API_KEY` not set | HTTP 503 `{ error: { code: "AI_SERVICE_UNAVAILABLE", message: "AI provider not configured" } }` |
| Anthropic API returns error (rate limit, timeout) | HTTP 503 with upstream error code passed through |
| Anthropic API returns unexpected response format | HTTP 500; result not stored; error logged |

### Confidence Label Derivation (Server-Side Only)

`confidenceLabel` must be derived server-side from `confidenceScore`. The AI is not permitted to set it. The mapping is enforced in the service layer:

| Score | Label |
|---|---|
| 0–39 | Low |
| 40–59 | Medium |
| 60–79 | High |
| 80–100 | Very High |

### Catalog Endpoint Validation

`GET /api/netsuite-catalog`:
- Requires valid JWT (authenticated user)
- No organization scoping required (catalog is system-level)
- Supports pagination: `page`, `perPage` query params (default: page 1, perPage 50)
- Supports filter: `category` query param (exact match)
- Returns only `isActive = true` records unless `includeInactive=true` is passed by admin
## Prompt 13 — SaaS API Validation

Required validation rules:

- Tenant create requires an existing organization and prevents more than one tenant per organization.
- Tenant plan assignment requires an active subscription plan.
- Invoice creation requires an active or trial tenant, a valid billing period, and an existing active plan when provided.
- Invoice payment rejects already-paid invoices.
- Usage records require valid metric type, non-negative value, and `periodEnd > periodStart`.
- Tenant role assignment requires the role to belong to the tenant and the user to belong to the tenant organization.
- Subscription plans with active tenants cannot be deleted; deactivate instead.

Validation commands executed on 2026-05-16:

- `pnpm --filter "./app/backend" db:generate`
- `pnpm --filter "./app/backend" typecheck`
- `pnpm --filter "./app/frontend" typecheck`

## Prompt 14 — Deployment API Validation

Required validation rules:

- Deployment trigger requires an existing environment.
- Service-scoped deployment trigger requires a service in the selected environment.
- Tenant-scoped deployment trigger validates tenant ownership against actor organization.
- Rollback requires a valid service and creates a deployment run with `actionType = ROLLBACK`.
- Self-healing requires a valid service and restores desired replicas/healthy status.
- Metric recording requires valid metric type and non-negative value.
- Alert update only allows OPEN, ACKNOWLEDGED, or RESOLVED.

Validation commands executed on 2026-05-16:

- `pnpm --filter "./app/backend" db:generate`
- `DATABASE_URL=... pnpm --filter "./app/backend" exec prisma validate`
- `DATABASE_URL=... pnpm --filter "./app/backend" db:migrate:prod`
- `pnpm --filter "./app/backend" typecheck`
- `pnpm --filter "./app/frontend" typecheck`
- `pnpm --filter "./app/backend" test`
- `pnpm build`
- `docker compose config`
- `docker compose -f docker-compose.yml -f docker-compose.observability.yml config`
- `docker compose -f docker-compose.yml -f docker-compose.prod.yml config`
- `docker compose build backend frontend`

## Prompt 15 — Security API Validation

Required validation rules:

- Secret create requires secret type, name, and value.
- Secret values must be encrypted before database persistence.
- Secret list responses must return masked values only.
- Secret rotation requires a new non-empty value and records `lastRotatedAt`.
- Tenant-scoped secret and access-log queries must validate tenant ownership.
- Access log reads, secret reads, secret create, secret rotation, and compliance report checks write access logs.
- All security endpoints require admin-grade RBAC.

Validation commands executed on 2026-05-16:

- `pnpm --filter "./app/backend" db:generate`
- `DATABASE_URL=... pnpm --filter "./app/backend" exec prisma validate`
- `DATABASE_URL=... pnpm --filter "./app/backend" db:migrate:prod`
- `pnpm --filter "./app/backend" typecheck`
- `pnpm --filter "./app/frontend" typecheck`
- `pnpm --filter "./app/backend" test`
- `./scripts/security-check.sh`
- `pnpm build`
- `docker compose config`
# Prompt 17 API Validation

- Superuser-only endpoints must reject non-superuser roles.
- Global tenant and user APIs must return cross-tenant data only through `/api/admin`.
- Tenant status, subscription override, user role change, and deployment trigger mutations must write `SuperuserActionLog`.
- Deployment triggers must preserve tenant/project target context where supplied.
## Roadmap Foundation Completion API Validation

- Document APIs must reject access when `projectId` does not belong to the actor organization.
- Knowledge APIs must restrict sources and documents to the actor project.
- RAG retrieval must log retrieved chunks in `RetrievalLog`.
- Evaluation APIs must validate that linked outputs belong to the same project.
- AI registry mutation endpoints require superuser access.
- All create/update actions must write `AuditLog` records.
