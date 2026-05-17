# Test Plan

> Last updated: 2026-05-14 (updated Prompt 06)
> Status: Planned — test implementation begins Phase 1

---

## Testing Strategy

The platform uses a layered testing strategy:

| Layer | Type | Tooling (Planned) | Phase |
|---|---|---|---|
| Unit | Function-level logic tests | Vitest | Phase 1 |
| Integration | API endpoint tests with real database | Vitest + Supertest | Phase 1 |
| AI Evaluation | Skill output quality tests | Custom evaluation harness | Phase 10 |
| E2E | Full user workflow tests | Playwright | Phase 3 |
| Hallucination | AI hallucination detection tests | Custom harness | Phase 10 |
| Performance | Load and stress tests | k6 | Phase 14 |
| Security | Penetration and dependency scanning | OWASP ZAP + Dependabot | Phase 14 |

---

## Phase 1 Test Requirements

### Project Management API (New — Prompt 02)

#### Task API
- [ ] Create task with valid input → returns 201 with task
- [ ] Create task in project from another org → returns 404
- [ ] Create task with invalid status enum → returns 422
- [ ] List tasks for project → returns paginated list
- [ ] Update task status → returns 200, creates audit log entry
- [ ] Delete task → soft-deletes, returns 200

#### Milestone API
- [ ] Create milestone with valid input → returns 201
- [ ] List milestones for project → returns list
- [ ] Update milestone status → returns 200

#### RAID API
- [ ] Create RAID item with all types (RISK, ASSUMPTION, ISSUE, DEPENDENCY, DECISION)
- [ ] Filter RAID items by type and status
- [ ] Update RAID item status → creates audit log entry

#### Project Portfolio API
- [ ] List projects → returns org-scoped list
- [ ] Filter by status and health
- [ ] Search by project name
- [ ] Create project → returns 201, navigable workspace

#### Multi-tenant isolation tests
- [ ] Task from org-A not accessible by org-B user → returns 404
- [ ] Milestone from project-A not accessible via project-B route → returns 404
- [ ] RAID item from another org → returns 404

### Auth API
- [ ] Register with valid data → returns 201 with JWT
- [ ] Register with duplicate email → returns 409
- [ ] Login with valid credentials → returns 200 with JWT
- [ ] Login with wrong password → returns 401
- [ ] Access protected endpoint without token → returns 401
- [ ] Access protected endpoint with expired token → returns 401
- [ ] Refresh token with valid refresh token → returns new JWT

### Organization API
- [ ] Get current organization (authenticated) → returns org data
- [ ] Get current organization (unauthenticated) → returns 401
- [ ] Update organization with valid data → returns 200
- [ ] Update organization with another org's token → returns 403

### Customer API
- [ ] List customers → returns paginated list scoped to org
- [ ] Create customer → returns 201
- [ ] Get customer by ID → returns customer
- [ ] Get customer from different org → returns 404
- [ ] Update customer → returns 200
- [ ] Delete customer → soft-deletes, returns 200

### Project API
- [ ] List projects → scoped to org
- [ ] Create project → returns 201
- [ ] Get project by ID → returns project
- [ ] Get project from different org → returns 404

### Audit Log
- [ ] Every write operation creates an audit log entry
- [ ] Audit log entries cannot be modified or deleted
- [ ] List audit logs → returns paginated, filterable log

---

---

## AI Presales Intelligence Test Cases (Added Prompt 06)

### AI Engine — Unit Tests

- [ ] `ai-engine.ts`: When `ANTHROPIC_API_KEY` is set, calling `callClaude()` with a valid prompt resolves with a parsed response
- [ ] `ai-engine.ts`: When `ANTHROPIC_API_KEY` is not set, calling `callClaude()` throws `AIServiceUnavailableError`
- [ ] AI engine response parsing: Valid JSON response is returned as typed object
- [ ] AI engine response parsing: Malformed JSON from API triggers error (does not crash, does not store)

### Skill Unit Tests (with mocked AI engine)

- [ ] `analyze-requirements.ts`: Given 3 valid requirements, returns 3 analysis objects with required fields
- [ ] `analyze-requirements.ts`: Each analysis has `evidenceArray.length >= 1`
- [ ] `analyze-requirements.ts`: `confidenceScore` is an integer between 0 and 100
- [ ] `classify-pain-points.ts`: Given 2 pain points, returns 2 classifications with `businessArea` and `rootCause` non-empty
- [ ] `recommend-modules.ts`: Returns only modules present in the injected `moduleCatalog`
- [ ] `recommend-modules.ts`: Every recommendation has at least 1 evidence item
- [ ] `estimate-scope.ts`: Returns valid `EstimatedComplexity` enum value
- [ ] `estimate-scope.ts`: `estimatedDurationWeeks` is a positive integer
- [ ] `generate-proposal-draft.ts`: Returns exactly 9 sections
- [ ] `generate-proposal-draft.ts`: All 9 `ProposalSectionType` values are present in the response

### API Integration Tests — Analyze Requirements

- [ ] `POST /api/projects/:projectId/ai/analyze-requirements` with valid project → returns 200 with analyses and outputId
- [ ] Same endpoint when project has no requirements → returns 422 with descriptive error
- [ ] Same endpoint when `requirementIds` contains an ID from another project → returns 422
- [ ] Same endpoint when `ANTHROPIC_API_KEY` not set (mock env) → returns 503
- [ ] `GET /api/projects/:projectId/ai/requirement-analysis` → returns stored analyses for project
- [ ] `GET` from different org → returns empty list (not 404; no cross-org data leakage)

### API Integration Tests — Classify Pain Points

- [ ] `POST /api/projects/:projectId/ai/classify-pain-points` with valid project → returns 200
- [ ] Same endpoint when project has no pain points → returns 422
- [ ] `GET /api/projects/:projectId/ai/pain-point-analysis` → returns stored classifications
- [ ] `POST` when AI returns empty `businessArea` → does not store result, returns 500

### API Integration Tests — Recommend Modules

- [ ] `POST /api/projects/:projectId/ai/recommend-modules` → returns recommendations referencing catalog modules
- [ ] Response includes `catalogModuleId` for every recommendation
- [ ] `GET /api/projects/:projectId/ai/module-recommendations` → returns stored recommendations
- [ ] Running recommendation twice creates two separate `AiGeneratedOutput` records (each run is independent)

### API Integration Tests — Estimate Scope

- [ ] `POST /api/projects/:projectId/ai/estimate-scope` → returns valid ScopeEstimation with complexity enum
- [ ] `complexity` is one of `SIMPLE | MODERATE | COMPLEX | HIGHLY_COMPLEX`
- [ ] `keyRisks` is a non-empty array
- [ ] `keyAssumptions` is a non-empty array
- [ ] `GET /api/projects/:projectId/ai/scope-estimations` → returns list of stored estimations

### API Integration Tests — Generate Proposal Draft

- [ ] `POST /api/projects/:projectId/ai/generate-proposal-draft` → returns 9-section proposal
- [ ] All 9 `ProposalSectionType` values present in response
- [ ] Each section has non-empty `content` string
- [ ] `GET /api/projects/:projectId/ai/proposal-drafts` → returns list of stored proposal records

### API Integration Tests — NetSuite Catalog

- [ ] `GET /api/netsuite-catalog` (authenticated) → returns paginated list of modules
- [ ] `GET /api/netsuite-catalog` (unauthenticated) → returns 401
- [ ] `GET /api/netsuite-catalog?category=Financial` → returns only Financial modules
- [ ] Total seeded modules is 20

### Review Workflow Integration Tests — Presales Outputs

- [ ] Presales skill output created with `status: DRAFT`
- [ ] Submit `AiReview` with `decision: APPROVED` on a `REQUIREMENT_ANALYSIS` output → output status becomes `APPROVED`
- [ ] Advance `APPROVED` output to `PUBLISHED` → succeeds
- [ ] Advance `DRAFT` output to `PUBLISHED` without review → returns 422
- [ ] Submit `AiReview` with `decision: REJECTED` → output status becomes `REJECTED`
- [ ] Submit `AiReview` with `decision: REVISION_REQUESTED` → output status becomes `REVISED`

### Multi-tenant Isolation Tests — Presales

- [ ] Requirement analysis from org-A not accessible via org-B project route → returns 404 or empty list
- [ ] Module catalog is accessible by all authenticated users (not org-scoped) → confirmed
- [ ] Pain point classifications from org-A project not returned in org-B project GET → confirmed

### Confidence Score Tests

- [ ] `confidenceScore` stored as integer (not decimal)
- [ ] `confidenceLabel` is always derived server-side from `confidenceScore` — AI-provided label in response is ignored
- [ ] Scores outside 0–100 range are clamped before storage

## Test Data Policy

- Tests must not use production data.
- Test database is seeded with representative but fictional data.
- Test database is reset between test runs.
- No real customer names, emails, or business data in test fixtures.
## Prompt 13 — SaaS Multi-Tenant Test Plan

Backend validation:

- Tenant CRUD: create, list, update status/plan, delete.
- Subscription plan CRUD: create, list, update, delete unused plan, reject delete with tenants.
- Billing: create invoice, reject invalid/inactive tenant invoices, mark invoice paid, reject duplicate payment.
- Usage: record each metric type, aggregate summary by tenant, validate period ordering.
- Tenant RBAC: create/update role, assign user role, reject cross-organization assignment.
- Feature gate: active tenant + active plan + feature in plan returns allowed; inactive tenant or missing feature returns denied.

Frontend validation:

- `/admin/tenants` renders tenant list, status badges, plan info, and activation/suspension/delete actions.
- `/admin/subscription-plans` renders plan catalog, feature chips, pricing, and limits.
- `/admin/billing` renders tenant selector, invoice creation, invoice list, payment status, and mark-paid action.
- `/admin/tenants/:tenantId/usage` renders usage KPIs, history, sample usage creation, and CSV export.
- `/admin/tenants/:tenantId/roles` renders role list, permission summary, user assignments, and assignment form.

Completed automated checks:

- Backend TypeScript typecheck passed.
- Frontend TypeScript typecheck passed.
- Prisma Client generation passed.

Pending:

- Integration tests against a live PostgreSQL test database.
- Docker Compose rebuild/startup validation.
- Payment gateway webhook contract tests once gateway integration is added.

## Prompt 14 — Deployment & DevOps Test Plan

Backend validation:

- Validate deployment overview returns seeded development/staging/production environments.
- Validate trigger endpoint creates `DeploymentRun`, updates service health/status, and writes audit log.
- Validate rollback endpoint creates rollback history and restores stable service state.
- Validate self-healing endpoint restores desired replicas and creates a SELF_HEAL run.
- Validate metrics and alerts endpoints create/list/update operational records.
- Validate tenant-scoped deployment requests reject cross-organization tenant IDs.
- Validate `/api/health/live`, `/api/health/ready`, and `/api/health/metrics`.

Frontend validation:

- `/admin/deployment` renders metrics, environment cards, service health, alerts, and run history.
- Deploy, rollback, and self-heal controls call backend endpoints.
- Alert and metric visualization handle empty states and populated data.
- Tenant-specific services display tenant context when present.

Infrastructure validation:

- `docker compose config`
- `docker compose -f docker-compose.yml -f docker-compose.observability.yml config`
- `docker compose -f docker-compose.yml -f docker-compose.prod.yml config`
- `docker compose build backend frontend`
- GitHub Actions workflow syntax reviewed through repository file structure.

Pending:

- Real Slack/email webhook provider tests.
- Kubernetes manifests and autoscaling tests.
- Cloud Terraform plan against an actual provider account.

## Prompt 15 — Security, Compliance & Data Protection Test Plan

Backend validation:

- Verify AES-256-GCM encryption/decryption helper does not expose plaintext in ciphertext.
- Verify secret create stores encrypted value and returns masked value.
- Verify secret rotation updates encrypted value and `lastRotatedAt`.
- Verify access logs are generated for security reads, secret create, rotation, and compliance checks.
- Verify security endpoints require RBAC.
- Verify tenant-scoped secret operations reject cross-organization tenant IDs.
- Verify encrypted field registry returns expected protected fields.

Frontend validation:

- `/admin/security` renders compliance metrics, readiness badges, encryption status, secrets, and access logs.
- Secret create and rotate controls call backend endpoints.
- Access logs can be filtered and exported.
- Secret values are masked in the UI.

Docker/CI validation:

- `SECURITY_ENCRYPTION_KEY` is available in local Compose.
- Traefik production overlay remains TLS-ready.
- CI runs `scripts/security-check.sh`.

Pending:

- External Vault/KMS provider integration.
- Historical encryption migration for AI content and billing payment methods.
- Full data-subject request management workflow.
# Prompt 17 Test Plan

- Backend: validate superuser RBAC, cross-tenant aggregation, tenant lifecycle status changes, subscription overrides, user role assignment, deployment trigger records, and superuser action logging.
- Frontend: validate `/admin/global-dashboard`, `/admin/tenants`, `/admin/users`, and `/admin/deployments` render states, mutation controls, and alert/action tables.
- Docker: validate `SUPERUSER_EMAILS`, Prisma migration deploy, and health checks in the compose stack.
