# API Contracts

> Last updated: 2026-05-16 (updated Prompt 12 — AI Continuous Improvement Layer)
> Status: **IMPLEMENTED** — All API groups implemented including GET single-item endpoints, Activity, full AI Discovery Workspace, and AI Presales Intelligence. Backend TypeScript: 0 errors.

> **Prompt 02 Update:** Added Project Management API groups (Tasks, Milestones, RAID, Workstreams, Activity). Updated Projects group with full CRUD spec and expanded fields. All project-scoped endpoints use `/api/projects/:projectId/` prefix to enforce project workspace separation.

> **Prompt 05 Update:** Added AI Discovery Workspace API groups: Discovery Sessions, Discovery Questions, Discovery Answers, Requirements, Pain Points, AI Conversations (project-scoped), AI Messages, AI Generated Outputs, and AI Output Reviews. All new endpoints are project-scoped under `/api/projects/:projectId/` or session-scoped under `/api/discovery-sessions/:sessionId/`. Agent and skill attribution is required on conversation creation.

> **Prompt 06 Update:** Added AI Presales Intelligence API group with 10 project-scoped endpoints under `/api/projects/:projectId/ai/` for requirement analysis, pain point classification, module recommendations, scope estimation, and proposal draft generation. Added 1 system-level endpoint `GET /api/netsuite-catalog`. All endpoints return confidence scores and evidence. When ANTHROPIC_API_KEY is not set, POST endpoints return 503 with a descriptive error.

All APIs are RESTful, JSON-based, and served from the backend API layer. Authentication is via JWT Bearer token in the `Authorization` header unless noted otherwise.

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 50 }
}
```

Errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [...]
  }
}
```

---

## API Groups

### Auth

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user and organization |
| POST | /api/auth/login | Authenticate and receive JWT |
| POST | /api/auth/logout | Invalidate session |
| POST | /api/auth/refresh | Refresh JWT token |
| GET | /api/auth/me | Get current authenticated user |
| POST | /api/auth/password/reset | Request password reset |
| POST | /api/auth/password/confirm | Confirm password reset |

---

### Organizations

| Method | Path | Description |
|---|---|---|
| GET | /api/organizations/current | Get current organization |
| PATCH | /api/organizations/current | Update organization settings |
| GET | /api/organizations/current/members | List members |
| POST | /api/organizations/current/members/invite | Invite a user |
| DELETE | /api/organizations/current/members/:userId | Remove a member |
| GET | /api/organizations/current/roles | List roles |
| POST | /api/organizations/current/roles | Create a role |
| PATCH | /api/organizations/current/roles/:roleId | Update a role |

---

### Customers

| Method | Path | Description |
|---|---|---|
| GET | /api/customers | List customers |
| POST | /api/customers | Create a customer |
| GET | /api/customers/:id | Get a customer |
| PATCH | /api/customers/:id | Update a customer |
| DELETE | /api/customers/:id | Soft-delete a customer |

---

### Projects

| Method | Path | Description |
|---|---|---|
| GET | /api/projects | List projects |
| POST | /api/projects | Create a project |
| GET | /api/projects/:id | Get a project |
| PATCH | /api/projects/:id | Update a project |
| DELETE | /api/projects/:id | Archive a project |
| GET | /api/projects/:id/members | List project members |
| POST | /api/projects/:id/members | Add a project member |
| DELETE | /api/projects/:id/members/:userId | Remove a project member |

---

### AI Agents

| Method | Path | Description |
|---|---|---|
| GET | /api/ai/agents | List available agents |
| GET | /api/ai/agents/:slug | Get agent details and available skills |
| POST | /api/ai/agents/:slug/invoke | Invoke an agent with a skill |
| GET | /api/ai/conversations | List AI conversations |
| GET | /api/ai/conversations/:id | Get conversation details |

---

### AI Skills

| Method | Path | Description |
|---|---|---|
| GET | /api/ai/skills | List all skills |
| GET | /api/ai/skills/:slug | Get skill details |

---

### Discovery Sessions

| Method | Path | Description |
|---|---|---|
| GET | /api/projects/:id/discovery | List discovery sessions |
| POST | /api/projects/:id/discovery | Create a discovery session |
| GET | /api/projects/:id/discovery/:sessionId | Get session details |
| PATCH | /api/projects/:id/discovery/:sessionId | Update session |
| POST | /api/projects/:id/discovery/:sessionId/ai/summarize | Generate AI summary |
| GET | /api/projects/:id/discovery/:sessionId/requirements | List requirements |
| POST | /api/projects/:id/discovery/:sessionId/requirements | Add requirement |
| PATCH | /api/projects/:id/discovery/:sessionId/requirements/:reqId | Update requirement |

---

### Documents

| Method | Path | Description |
|---|---|---|
| GET | /api/projects/:id/documents | List project documents |
| GET | /api/projects/:id/documents/:docId | Get document |
| POST | /api/projects/:id/documents/generate | Generate AI document |
| PATCH | /api/projects/:id/documents/:docId | Update document |
| POST | /api/projects/:id/documents/:docId/submit | Submit for review |
| GET | /api/projects/:id/documents/:docId/versions | Get version history |

---

### Review Workflow

| Method | Path | Description |
|---|---|---|
| GET | /api/review/queue | List items pending review (for current user) |
| GET | /api/review/outputs/:outputId | Get AI output for review |
| POST | /api/review/outputs/:outputId/approve | Approve output |
| POST | /api/review/outputs/:outputId/reject | Reject output |
| POST | /api/review/outputs/:outputId/request-revision | Request revision |
| POST | /api/review/outputs/:outputId/comments | Add comment |
| GET | /api/review/outputs/:outputId/comments | List comments |

---

### Audit Logs

| Method | Path | Description |
|---|---|---|
| GET | /api/audit | List audit logs (paginated, filterable) |
| GET | /api/audit/:id | Get a single audit log entry |

---

### Project Tasks

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/tasks | List all tasks for a project | `task:read` | No |
| POST | /api/projects/:projectId/tasks | Create a task | `task:write` | `task.created` |
| GET | /api/projects/:projectId/tasks/:taskId | Get a task | `task:read` | No |
| PATCH | /api/projects/:projectId/tasks/:taskId | Update a task | `task:write` | `task.updated` |
| DELETE | /api/projects/:projectId/tasks/:taskId | Soft-delete a task | `task:delete` | `task.deleted` |

**POST /api/projects/:projectId/tasks — Request Body:**
```json
{
  "title": "string (required, 1–200 chars)",
  "description": "string? (max 2000)",
  "status": "BACKLOG | TODO | IN_PROGRESS | BLOCKED | IN_REVIEW | DONE | CANCELLED (default: BACKLOG)",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL (default: MEDIUM)",
  "workstreamId": "uuid?",
  "ownerId": "uuid?",
  "startDate": "ISO date?",
  "dueDate": "ISO date?",
  "dependsOnId": "uuid? (task ID)",
  "tags": "string[]?",
  "relatedDeliverable": "string?"
}
```
**Response 201:** `{ success: true, data: { task } }`
**Errors:** 401, 404 (project not found in org), 422 (validation)

---

### Project Milestones

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/milestones | List milestones | `task:read` | No |
| POST | /api/projects/:projectId/milestones | Create milestone | `task:write` | `milestone.created` |
| GET | /api/projects/:projectId/milestones/:milestoneId | Get milestone | `task:read` | No |
| PATCH | /api/projects/:projectId/milestones/:milestoneId | Update milestone | `task:write` | `milestone.updated` |
| DELETE | /api/projects/:projectId/milestones/:milestoneId | Delete milestone | `task:delete` | `milestone.deleted` |

**POST /api/projects/:projectId/milestones — Request Body:**
```json
{
  "name": "string (required)",
  "description": "string?",
  "phase": "string?",
  "targetDate": "ISO date (required)",
  "status": "NOT_STARTED | IN_PROGRESS | COMPLETED | DELAYED | AT_RISK | CANCELLED (default: NOT_STARTED)",
  "ownerId": "uuid?",
  "completionPercent": "integer 0–100 (default: 0)"
}
```

---

### RAID Log

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/raid | List RAID items (filterable by type/status) | `raid:read` | No |
| POST | /api/projects/:projectId/raid | Create RAID item | `raid:write` | `raid.created` |
| GET | /api/projects/:projectId/raid/:raidId | Get RAID item | `raid:read` | No |
| PATCH | /api/projects/:projectId/raid/:raidId | Update RAID item | `raid:write` | `raid.updated` |
| DELETE | /api/projects/:projectId/raid/:raidId | Close/archive RAID item | `raid:write` | `raid.closed` |

**POST /api/projects/:projectId/raid — Request Body:**
```json
{
  "type": "RISK | ASSUMPTION | ISSUE | DEPENDENCY | DECISION (required)",
  "title": "string (required)",
  "description": "string (required)",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL?",
  "probability": "LOW | MEDIUM | HIGH?",
  "impact": "LOW | MEDIUM | HIGH?",
  "status": "OPEN | MONITORING | MITIGATED | RESOLVED | CLOSED | ESCALATED (default: OPEN)",
  "ownerId": "uuid?",
  "mitigationPlan": "string?",
  "dueDate": "ISO date?",
  "decisionRequired": "boolean (default: false)"
}
```

**Query Parameters for GET list:**
- `type` — filter by RAID type
- `status` — filter by status
- `severity` — filter by severity
- `page`, `perPage` — pagination

---

### Workstreams

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/workstreams | List workstreams | `project:read` | No |
| POST | /api/projects/:projectId/workstreams | Create workstream | `project:write` | `workstream.created` |
| PATCH | /api/projects/:projectId/workstreams/:workstreamId | Update workstream | `project:write` | `workstream.updated` |
| DELETE | /api/projects/:projectId/workstreams/:workstreamId | Delete workstream | `project:write` | `workstream.deleted` |

---

### Project Activity Feed

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/activity | Get recent activity for a project (paginated, newest first) | `project:read` | No |

**Response:** paginated list of ProjectActivity records with actor details, action, resource, description, and timestamp.

---

### Health Check

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | /api/health | Application health check (DB, cache, version) | None (public) |

**Response 200 (healthy):**
```json
{ "success": true, "data": { "status": "healthy", "version": "0.1.0", "uptime": 3600, "database": "connected", "cache": "connected" } }
```
**Response 503 (degraded):**
```json
{ "success": false, "data": { "status": "degraded", "database": "error", "cache": "connected" } }
```

---

---

### Discovery Sessions (Prompt 05)

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/discovery-sessions | List discovery sessions | `discovery:read` | No |
| POST | /api/projects/:projectId/discovery-sessions | Create a discovery session | `discovery:write` | `discovery_session.created` |
| GET | /api/projects/:projectId/discovery-sessions/:sessionId | Get a session | `discovery:read` | No |
| PATCH | /api/projects/:projectId/discovery-sessions/:sessionId | Update session | `discovery:write` | `discovery_session.updated` |
| DELETE | /api/projects/:projectId/discovery-sessions/:sessionId | Archive a session | `discovery:write` | `discovery_session.deleted` |

**POST request body:**
```json
{
  "title": "string (required)",
  "customerId": "uuid (required)",
  "facilitatorId": "uuid?",
  "sessionDate": "ISO datetime?",
  "notes": "string?"
}
```

---

### Discovery Questions (Prompt 05)

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | /api/discovery-sessions/:sessionId/questions | List questions for a session | `discovery:read` |
| POST | /api/discovery-sessions/:sessionId/questions | Add a question to a session | `discovery:write` |

**POST request body:**
```json
{
  "questionText": "string (required)",
  "category": "string?",
  "orderIndex": "integer?",
  "source": "AI_GENERATED | HUMAN_AUTHORED (default: HUMAN_AUTHORED)"
}
```

---

### Discovery Answers (Prompt 05)

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | /api/discovery-sessions/:sessionId/answers | List answers for a session | `discovery:read` |
| POST | /api/discovery-sessions/:sessionId/answers | Record an answer | `discovery:write` |

**POST request body:**
```json
{
  "questionId": "uuid (required)",
  "answerText": "string (required)"
}
```

---

### Requirements (Prompt 05)

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/requirements | List requirements | `requirement:read` | No |
| POST | /api/projects/:projectId/requirements | Create a requirement | `requirement:write` | `requirement.created` |

**POST request body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "FUNCTIONAL | TECHNICAL | INTEGRATION | REPORTING | MIGRATION (required)",
  "priority": "MUST_HAVE | SHOULD_HAVE | NICE_TO_HAVE (default: SHOULD_HAVE)",
  "status": "CAPTURED | ANALYSED | CONFIRMED | DEFERRED | OUT_OF_SCOPE (default: CAPTURED)",
  "discoverySessionId": "uuid?",
  "sourceAnswerId": "uuid?",
  "netsuiteModule": "string?",
  "fitStatus": "FIT | GAP | PARTIAL_FIT?"
}
```

---

### Pain Points (Prompt 05)

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/pain-points | List pain points | `discovery:read` | No |
| POST | /api/projects/:projectId/pain-points | Create a pain point | `discovery:write` | `pain_point.created` |

**POST request body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL (required)",
  "category": "string?",
  "sessionId": "uuid?"
}
```

---

### Security & Compliance (Prompt 15)

| Method | Path | Description |
|---|---|---|
| GET | /api/security/access-logs | List access logs (admin only; filterable by tenant/project) |
| GET | /api/security/secrets | List secrets (admin only; tenant-scoped) |
| POST | /api/security/secrets | Create a secret (encrypts value before store) |
| PATCH | /api/security/secrets/:secretId/rotate | Rotate secret value (encrypted) |
| GET | /api/security/encrypted-fields | List registered encrypted fields |
| GET | /api/security/compliance-report | Get GDPR/PDPA readiness and summary metrics |

All security endpoints require organization admin-level permission and enforce tenant ownership when a `tenantId` parameter is supplied. Secret values returned by the API are masked and never returned in plaintext.


### AI Conversations — Project-Scoped (Prompt 05)

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/ai/conversations | List conversations | `ai:read` | No |
| POST | /api/projects/:projectId/ai/conversations | Start a conversation | `ai:write` | `ai_conversation.created` |
| PATCH | /api/projects/:projectId/ai/conversations/:conversationId | Update conversation status | `ai:write` | `ai_conversation.updated` |

**POST request body:**
```json
{
  "agentId": "uuid (required)",
  "skillId": "uuid (required)",
  "sessionId": "uuid?",
  "title": "string?",
  "model": "string (required, e.g. 'claude-sonnet-4-6')"
}
```

Note: Both `agentId` and `skillId` are required. No conversation can be created without agent and skill attribution.

---

### AI Conversation Messages (Prompt 05)

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | /api/ai/conversations/:conversationId/messages | List messages in order | `ai:read` |
| POST | /api/ai/conversations/:conversationId/messages | Append a message | `ai:write` |

**POST request body:**
```json
{
  "role": "USER | ASSISTANT | SYSTEM (required)",
  "content": "string (required)",
  "orderIndex": "integer (required)"
}
```

---

### AI Generated Outputs (Prompt 05)

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| GET | /api/projects/:projectId/ai/generated-outputs | List outputs | `ai:read` | No |
| POST | /api/projects/:projectId/ai/generated-outputs | Create an output | `ai:write` | `ai_output.created` |
| PATCH | /api/projects/:projectId/ai/generated-outputs/:outputId | Update output / advance status | `ai:write` | `ai_output.updated` |

**POST request body:**
```json
{
  "conversationId": "uuid (required)",
  "agentId": "uuid (required)",
  "skillId": "uuid (required)",
  "outputType": "string (required, e.g. 'BRD', 'DISCOVERY_SUMMARY', 'FIT_GAP', 'MODULE_RECOMMENDATION')",
  "title": "string (required)",
  "content": "string (required)"
}
```

**Status transition rules (enforced by API):**
- `DRAFT` → `IN_REVIEW`: allowed at any time by output owner
- `IN_REVIEW` → `APPROVED` / `REJECTED` / `REVISED`: set by review decision (requires AiReview record)
- `APPROVED` → `PUBLISHED`: allowed only after at least one `APPROVED` AiReview exists
- No backward transitions except `REVISED` → `IN_REVIEW`

---

### AI Output Reviews (Prompt 05)

| Method | Path | Purpose | Permission | Audit |
|---|---|---|---|---|
| POST | /api/projects/:projectId/ai/generated-outputs/:outputId/reviews | Submit a review decision | `ai:review` | `ai_review.submitted` |

**POST request body:**
```json
{
  "decision": "APPROVED | REJECTED | REVISION_REQUESTED (required)",
  "comments": "string?",
  "rubricScores": "JSON object? (structured rubric evaluation)"
}
```

**Response 201:** Creates AiReview record and updates AiGeneratedOutput status accordingly:
- `APPROVED` → output status becomes `APPROVED`
- `REJECTED` → output status becomes `REJECTED`
- `REVISION_REQUESTED` → output status becomes `REVISED`

---

---

### AI Presales Intelligence (Prompt 06)

All endpoints are project-scoped under `/api/projects/:projectId/ai/`. Each POST endpoint triggers a live Anthropic Claude API call and stores the result before returning. If `ANTHROPIC_API_KEY` is not configured, POST endpoints return HTTP 503. GET endpoints always return stored results regardless of API key status.

#### Requirement Analysis

| Method | Path | Purpose | Permission |
|---|---|---|---|
| POST | /api/projects/:projectId/ai/analyze-requirements | Run requirement analysis for this project | `ai:write` |
| GET | /api/projects/:projectId/ai/requirement-analysis | List stored requirement analyses | `ai:read` |

**POST request body:**
```json
{
  "requirementIds": "uuid[] (optional — analyze all project requirements if omitted)"
}
```

**Response data includes:**
```json
{
  "analyses": [
    {
      "requirementId": "uuid",
      "netsuiteModule": "string",
      "fitAssessment": "FIT | GAP | PARTIAL_FIT",
      "clarityScore": "integer 0–100",
      "completenessScore": "integer 0–100",
      "confidenceScore": "integer 0–100",
      "confidenceLabel": "Low | Medium | High | Very High",
      "evidence": [{ "type": "string", "text": "string", "sourceId": "uuid?" }],
      "analysisNotes": "string?"
    }
  ],
  "outputId": "uuid (AiGeneratedOutput record)"
}
```

---

#### Pain Point Classification

| Method | Path | Purpose | Permission |
|---|---|---|---|
| POST | /api/projects/:projectId/ai/classify-pain-points | Run pain point classification for this project | `ai:write` |
| GET | /api/projects/:projectId/ai/pain-point-analysis | List stored pain point classifications | `ai:read` |

**POST request body:**
```json
{
  "painPointIds": "uuid[] (optional — classify all project pain points if omitted)"
}
```

**Response data includes:**
```json
{
  "classifications": [
    {
      "painPointId": "uuid",
      "businessArea": "string",
      "rootCause": "string",
      "recommendation": "string",
      "confidenceScore": "integer 0–100",
      "confidenceLabel": "string"
    }
  ],
  "outputId": "uuid"
}
```

---

#### Module Recommendations

| Method | Path | Purpose | Permission |
|---|---|---|---|
| POST | /api/projects/:projectId/ai/recommend-modules | Generate NetSuite module recommendations | `ai:write` |
| GET | /api/projects/:projectId/ai/module-recommendations | List stored module recommendations | `ai:read` |

**POST request body:**
```json
{
  "includeNiceToHave": "boolean (default: true)"
}
```

**Response data includes:**
```json
{
  "recommendations": [
    {
      "moduleName": "string",
      "catalogModuleId": "uuid",
      "priority": "MUST_HAVE | SHOULD_HAVE | NICE_TO_HAVE",
      "rationale": "string",
      "evidence": [{ "type": "string", "text": "string", "sourceId": "uuid?" }],
      "estimatedEffort": "string?",
      "confidenceScore": "integer 0–100",
      "confidenceLabel": "string"
    }
  ],
  "outputId": "uuid"
}
```

---

#### Scope Estimation

| Method | Path | Purpose | Permission |
|---|---|---|---|
| POST | /api/projects/:projectId/ai/estimate-scope | Generate implementation scope estimate | `ai:write` |
| GET | /api/projects/:projectId/ai/scope-estimations | List stored scope estimations | `ai:read` |

**POST:** No request body required — uses all project requirements, pain points, and module recommendations.

**Response data includes:**
```json
{
  "complexity": "SIMPLE | MODERATE | COMPLEX | HIGHLY_COMPLEX",
  "estimatedDurationWeeks": "integer",
  "estimatedTeamSize": "integer",
  "estimatedBudgetRange": "string?",
  "keyRisks": "string[]",
  "keyAssumptions": "string[]",
  "confidenceScore": "integer 0–100",
  "confidenceLabel": "string",
  "outputId": "uuid"
}
```

---

#### Proposal Draft Generation

| Method | Path | Purpose | Permission |
|---|---|---|---|
| POST | /api/projects/:projectId/ai/generate-proposal-draft | Generate a 9-section proposal draft | `ai:write` |
| GET | /api/projects/:projectId/ai/proposal-drafts | List stored proposal drafts | `ai:read` |

**POST:** No request body required — synthesizes all presales analyses for this project.

**Response data includes:**
```json
{
  "sections": [
    {
      "sectionType": "EXECUTIVE_SUMMARY | BUSINESS_CHALLENGES | PROPOSED_SOLUTION | SCOPE_AND_MODULES | IMPLEMENTATION_APPROACH | TEAM_AND_ROLES | TIMELINE | INVESTMENT_SUMMARY | NEXT_STEPS",
      "sectionTitle": "string",
      "content": "string",
      "orderIndex": "integer",
      "confidenceScore": "integer 0–100",
      "confidenceLabel": "string"
    }
  ],
  "outputId": "uuid"
}
```

---

#### NetSuite Module Catalog (System Level)

| Method | Path | Purpose | Permission |
|---|---|---|---|
| GET | /api/netsuite-catalog | List all NetSuite modules in the catalog | None (authenticated) |

**Response:** Paginated list of `NetsuiteModuleCatalog` records (id, name, category, description, typicalUseCases, isActive).

---

## Authentication Notes

- All endpoints (except `/api/auth/*`) require `Authorization: Bearer <token>`
- All endpoints are scoped to the user's organization via the JWT claims
- RBAC is enforced at the middleware level based on the user's role and permissions

---

## Prompt 12 — AI Continuous Improvement API Group

Base: `/api/projects/:projectId/continuous-improvement`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | PROJECT_READ | Summary: KPIs, latest scores, recent feedback, top recommendations |
| GET | `/feedback` | PROJECT_READ | List feedback entries (filter: feedbackType, severity) |
| POST | `/feedback` | PROJECT_WRITE | Create feedback entry |
| GET | `/recommendations` | PROJECT_READ | List recommendations (filter: recommendationType, status) |
| POST | `/recommendations` | PROJECT_WRITE | Create recommendation |
| PATCH | `/recommendations/:id` | PROJECT_WRITE | Update recommendation status |
| GET | `/scores` | PROJECT_READ | Calculate and return current optimization scores |
| GET | `/trends` | PROJECT_READ | Historical score trends (filter: metricType, timeRange) |

---

## Prompt 13 — SaaS Multi-Tenant API Groups

All SaaS admin endpoints require authentication and admin-grade organization write permission unless noted.

### Tenant Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tenants` | List tenants with organization, plan, invoice, usage, and role counts |
| POST | `/api/tenants` | Create one tenant for one organization |
| GET | `/api/tenants/:tenantId` | Fetch tenant detail |
| PATCH | `/api/tenants/:tenantId` | Update tenant name, domain, status, trial end, or plan |
| DELETE | `/api/tenants/:tenantId` | Delete tenant and cascading SaaS records |
| GET | `/api/tenants/:tenantId/usage` | Read tenant usage records and summary |
| POST | `/api/tenants/:tenantId/usage` | Record usage metric for billing/analytics |
| GET | `/api/tenants/:tenantId/roles` | List tenant roles |
| POST | `/api/tenants/:tenantId/roles` | Create tenant role |
| PATCH | `/api/tenants/:tenantId/roles/:roleId` | Update tenant role and permissions |
| GET | `/api/tenants/:tenantId/user-roles` | List user-role assignments |
| POST | `/api/tenants/:tenantId/user-roles` | Assign tenant role to a user in the same organization |

### Subscription Plans

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subscription-plans` | List plans and tenant counts |
| POST | `/api/subscription-plans` | Create plan with feature list and limits |
| PATCH | `/api/subscription-plans/:planId` | Update features, price, limits, or active flag |
| DELETE | `/api/subscription-plans/:planId` | Delete unused plan; active tenant plans must be deactivated instead |

### Billing

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/billing/create-invoice` | Create tenant-scoped invoice with valid period and active tenant validation |
| PATCH | `/api/billing/pay-invoice/:invoiceId` | Mark invoice paid and store payment method/notes |
| GET | `/api/billing/invoices/:tenantId` | List invoices for a tenant |

Compatibility routes also exist under `/api/admin/*` for the existing admin namespace.

---

## Prompt 14 — Deployment & DevOps API Group

Base: `/api/deployment`

All endpoints require authentication and admin-grade organization write permission.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/overview` | Deployment dashboard payload: environments, services, recent runs, open alerts, latest metrics |
| GET | `/environments` | List deployment environments with services and counts |
| GET | `/runs` | List deployment runs, filterable by environment/service |
| POST | `/trigger` | Trigger build/test/deploy/scale/self-heal run metadata and service state update |
| POST | `/rollback` | Trigger rollback run and restore last stable service image tag |
| POST | `/services/:serviceId/self-heal` | Restore desired replicas and healthy service state |
| GET | `/health` | Environment-level deployment health summary |
| GET | `/metrics` | List latest service metrics |
| POST | `/metrics` | Record service/environment metric sample |
| POST | `/alerts` | Create deployment alert |
| PATCH | `/alerts/:alertId` | Acknowledge or resolve deployment alert |

Tenant-aware validation:

- `tenantId` is optional for shared platform services.
- When provided, `tenantId` must belong to the actor's organization.
- Tenant-specific service actions must match the service's tenant scope.

---

## Prompt 15 — Security, Compliance & Data Protection API Group

Base: `/api/security`

All endpoints require authentication and admin-grade organization write permission.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/access-logs` | List access logs with filters: tenantId, projectId, result, actionType, since |
| GET | `/secrets` | List masked secrets scoped to actor organization and optional tenant |
| POST | `/secrets` | Store encrypted secret with rotation policy |
| PATCH | `/secrets/:secretId/rotate` | Rotate encrypted secret value |
| GET | `/encrypted-fields` | List registered encrypted/protected fields |
| GET | `/compliance-report` | GDPR/PDPA readiness report |

Security behavior:

- Secret values are never returned in plaintext.
- Tenant filters validate tenant ownership.
- Security operations create access logs and audit logs.

---

## Versioning

API versioning will be introduced when breaking changes are required. Initial version is unversioned (implicit v1). When versioning is introduced, the prefix will be `/api/v2/...`.
# Prompt 17 Global Admin APIs

- `GET /api/admin/global-dashboard`
- `GET /api/admin/tenants`
- `PATCH /api/admin/tenants/:tenantId/override-subscription`
- `PATCH /api/admin/tenants/:tenantId/status`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/role`
- `GET /api/admin/global-alerts`
- `POST /api/admin/deployments/trigger`

All endpoints require superuser access and log mutation actions to `SuperuserActionLog`.

## Roadmap Foundation Completion APIs

### Project Documents

Base: `/api/projects/:projectId/documents`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List project documents with status and type filters |
| POST | `/` | Create a versioned project document draft |
| GET | `/:documentId` | Read document sections, versions, and review comments |
| PATCH | `/:documentId` | Update document metadata, status, and sections; creates a new version |
| POST | `/:documentId/comments` | Add human review comment |

### Knowledge and RAG

Base: `/api/projects/:projectId/knowledge`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/sources` | List project knowledge sources |
| POST | `/sources` | Create project knowledge source |
| PATCH | `/sources/:sourceId` | Update source metadata/status |
| POST | `/documents` | Store a knowledge document and generate chunks |
| POST | `/retrieve` | Retrieve matching chunks and create retrieval logs |

### Evaluation

Base: `/api/projects/:projectId/evaluations`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cases` | List skill evaluation cases |
| POST | `/cases` | Create evaluation case |
| GET | `/runs` | List evaluation run history |
| POST | `/runs` | Record an evaluation run and score |

### AI Registry

Base: `/api/ai/registry`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List DB-backed agents and skills |
| POST | `/agents` | Superuser-only agent registration |
| POST | `/skills` | Superuser-only skill registration |

Isolation rule: all project endpoints validate `organizationId + projectId` before reading or mutating project-scoped records.
