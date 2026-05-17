# System Architecture

> Last updated: 2026-05-14 (updated Prompt 07)
> Status: Phase 1 — In Progress

> **Prompt 02 Update:** Architecture now explicitly includes two application layers: (1) Portfolio/Project Management Layer (global dashboard, multi-project overview), and (2) Project Workspace Layer (per-project isolated context). All project-related data access is scoped to `projectId` at the service layer.

> **Prompt 05 Update:** Added AI Discovery Workspace layer. Discovery sessions, AI conversations, AI-generated outputs, and human review records are all stored in the database (storage-first design). No ephemeral AI interactions exist — every conversation turn and every generated output is persisted and auditable. Project-scoped AI operations enforce org isolation at the service layer.

> **Prompt 06 Update:** Added AI Consulting Intelligence Layer. The Presales Agent is now ACTIVE with 5 live skills backed by real Anthropic Claude API calls (claude-sonnet-4-6). Domain knowledge is embedded directly in structured system prompts via the NetsuiteModuleCatalog. All presales AI outputs are stored in purpose-built analysis tables and linked to AiGeneratedOutput for review. Confidence scoring (0–100) and evidence tracking are first-class fields on analysis results.

> **Prompt 07 Update:** Added AI Functional Delivery Intelligence Layer. The Functional Consultant Agent is now ACTIVE with 3 live skills: generate-fit-gap, generate-uat, and generate-sop. Business processes are organized under functional workstreams. Fit-gap analysis uses a 7-category FitCategory enum covering the full spectrum from standard fit to out-of-scope. UAT scenarios carry navigable test steps. SOP documents auto-increment version when content changes. All functional outputs flow into the same AiGeneratedOutput review workflow.

---

## Architectural Principles

1. **SSOT-first** — All architectural decisions are documented before code is written.
2. **Phase-based** — Complexity is introduced only when the phase requires it.
3. **AI-native** — AI agents are first-class citizens, not bolted-on features.
4. **Human-in-the-loop** — Every AI output must pass through a review gate before use.
5. **Auditability** — Every significant action is logged with actor, timestamp, and context.
6. **Multi-tenancy from day one** — Organization isolation is enforced at the data layer.
7. **SaaS-ready** — Design for eventual multi-tenant SaaS deployment.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│              Next.js App Router (TypeScript)                    │
│     Auth Pages │ Dashboard │ Discovery │ Documents │ Review     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                       BACKEND API LAYER                         │
│              Node.js + Hono (TypeScript)                        │
│   Auth │ Orgs │ Customers │ Projects │ AI │ Docs │ Audit        │
│                    JWT + RBAC Middleware                        │
└──────┬─────────────────────┬───────────────────────────────────┘
       │                     │
┌──────▼──────┐   ┌──────────▼──────────────────────────────────┐
│  DATABASE   │   │            AI ORCHESTRATION LAYER            │
│  PostgreSQL │   │   Agent Runner │ Skill Invoker │ RAG Engine  │
│  via Prisma │   │   Conversation Store │ Output Lifecycle      │
└──────┬──────┘   └──────────┬───────────────────────────────────┘
       │                     │
┌──────▼──────┐   ┌──────────▼──────────────────────────────────┐
│    CACHE    │   │              AI PROVIDER LAYER               │
│    Redis    │   │   Anthropic (Claude) │ OpenAI │ Gemini       │
└─────────────┘   │              (abstracted)                    │
                  └──────────┬───────────────────────────────────┘
                             │
                  ┌──────────▼───────────────────────────────────┐
                  │            KNOWLEDGE BASE (RAG)               │
                  │   Vector Store │ Chunked Docs │ Embeddings   │
                  │   NetSuite KB │ Templates │ Industry Refs    │
                  └──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   REVIEW WORKFLOW LAYER                         │
│    Draft Output → Human Review Queue → Approve/Reject/Revise   │
│    Notification System │ Comment & Annotation │ Version Control │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  AUDIT & GOVERNANCE LAYER                       │
│    Immutable Audit Log │ AI Decision Trail │ Quality Scores     │
│    Hallucination Flags │ Approval Records │ Compliance Export  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### Frontend Layer
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui component library
- **State:** React Query (server state) + Zustand (client state)
- **Auth:** Custom JWT cookie handling
- **Key pages:**
  - Auth (login, register)
  - Global Project Portfolio (`/projects`) — list all projects, filter, search, create
  - Project Workspace Shell (`/projects/[id]`) — per-project isolated workspace with sidebar nav
  - Project Overview, Tasks, Milestones, RAID, Documents, AI, Settings pages
  - Review Queue (Phase 4)
  - Admin and Settings pages
- **Navigation model:** Global Portfolio → Select Project → Enter Workspace (isolated context)

### Backend API Layer
- **Framework:** Hono (TypeScript) on Node.js — lightweight, edge-ready, fast
- **Transport:** REST APIs with JSON; WebSockets for real-time review notifications
- **Auth:** JWT tokens with RBAC middleware
- **Validation:** Zod schemas at all API boundaries
- **Logging:** Structured JSON logs (Pino)

### Database Layer
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Multi-tenancy:** Organization-scoped rows enforced at query level
- **Migrations:** Prisma Migrate (version-controlled)
- **Seed:** Development seed script for representative test data

### AI Orchestration Layer
- **Agent Runner:** Custom orchestration engine that maps incoming requests to agent + skill combinations
- **Skill Invoker:** Executes specific skills by injecting context, knowledge, and the appropriate prompt
- **Conversation Store:** Persists all AI conversations and their outputs to the database
- **Output Lifecycle:** Draft → Under Review → Approved / Rejected / Revised

### AI Provider Layer
- **Abstraction:** Provider-agnostic interface so switching models does not require code changes
- **Primary:** Anthropic Claude (Sonnet for standard, Opus for complex reasoning)
- **Secondary:** OpenAI GPT-4o (fallback and specialized tasks)
- **Tertiary:** Google Gemini (optional, for long-context tasks)
- **Cost Control:** Usage tracking per organization, per agent, per skill

### RAG Layer
- **Vector Store:** pgvector (PostgreSQL extension) for Phase 9; may migrate to Pinecone or Weaviate at scale
- **Embeddings:** OpenAI text-embedding-3-small or equivalent
- **Chunking strategy:** Document type-aware chunking (tables, lists, paragraphs treated differently)
- **Knowledge domains:** NetSuite modules, implementation methodology, industry verticals, templates

### Review Workflow Layer
- **Flow:** AI generates output → stored as draft → reviewer notified → reviewer approves/rejects/comments → approved outputs become usable in deliverables
- **Version control:** All revisions to a reviewed document are tracked
- **Escalation:** Rejected outputs can be regenerated or manually overridden

### Audit & Governance Layer
- **Audit log:** Immutable append-only log of every significant action
- **Fields:** actor, action, resource type, resource ID, timestamp, IP, metadata
- **AI-specific:** Every AI invocation is logged with agent, skill, model, prompt hash, and output reference
- **Quality scoring:** Governance Agent evaluates outputs on rubric and records scores
- **Hallucination flags:** Suspicious claims are flagged for human review

---

## Deployment Architecture (Planned)

- Containerized: Docker + Docker Compose for local development
- Cloud: Vercel (frontend) + Fly.io or Railway (backend API) for early stages
- Database: Managed PostgreSQL (Supabase, Neon, or Railway)
- Cache: Managed Redis (Upstash)
- Long-term: Kubernetes-based for enterprise/SaaS

See `DEPLOYMENT.md` for detailed deployment plans.

---

## AI Discovery Workspace Layer (Added Prompt 05)

This layer describes the architectural pipeline from a discovery session through AI conversation to a reviewed, publishable output.

### Pipeline Overview

```
[Discovery Session]
       │
       ▼
[Discovery Questions + Answers]  ←── Facilitator captures structured Q&A
       │
       ▼
[Requirement / PainPoint Extraction]  ←── Manual or AI-assisted extraction
       │
       ▼
[AiConversation]  ←── Project-scoped; carries agentId + skillId attribution
       │
       ├── [AiMessage × N]  ←── Every turn stored (user + assistant alternating)
       │
       ▼
[AiGeneratedOutput]  ←── Single structured output (BRD, summary, fit-gap, etc.)
       │
       │  status: DRAFT
       ▼
[Human Review Gate]  ←── AiReview record created; reviewer assigned
       │
       ├── APPROVED  → status: PUBLISHED  (usable in deliverables)
       ├── REJECTED  → status: REJECTED   (must address root cause before regenerating)
       └── REVISED   → status: REVISED    → loops back to Human Review Gate
```

### Design Principles

1. **Storage-first AI** — No ephemeral AI interactions. Every conversation turn (`AiMessage`) and every generated output (`AiGeneratedOutput`) is written to the database before any response is returned to the client.
2. **Project-scoped operations** — All AI endpoints are prefixed with `/api/projects/:projectId/`. The service layer verifies `projectId` belongs to the caller's organization on every request.
3. **Agent and skill attribution** — Every `AiConversation` carries `agentId` and `skillId` (both required). Every `AiGeneratedOutput` references its conversation, preserving the full attribution chain: user → agent → skill → output → review.
4. **Human review gate** — An `AiGeneratedOutput` cannot reach `Published` status without a corresponding `AiReview` record with decision `APPROVED`. The API enforces this transition rule.
5. **Org isolation** — Discovery sessions, conversations, outputs, and reviews all carry `organizationId`. Service-layer queries always filter by the calling user's organization; cross-org data access is structurally impossible.

### Frontend AI Workspace Routes (Prompt 05)

| Route | Purpose |
|---|---|
| `/projects/[projectId]/ai` | AI workspace index / overview |
| `/projects/[projectId]/ai/discovery` | Discovery session list |
| `/projects/[projectId]/ai/discovery/[sessionId]` | Session detail: questions, answers |
| `/projects/[projectId]/ai/requirements` | Requirements list and management |
| `/projects/[projectId]/ai/pain-points` | Pain point list and management |
| `/projects/[projectId]/ai/conversations` | AI conversation list |
| `/projects/[projectId]/ai/conversations/[conversationId]` | Conversation thread and messages |
| `/projects/[projectId]/ai/outputs` | Generated output list |
| `/projects/[projectId]/ai/outputs/[outputId]` | Output detail and review submission |

---

## AI Consulting Intelligence Layer (Added Prompt 06)

This layer describes the architectural pipeline from a presales AI skill invocation through to a stored, reviewable analysis result. It is the first live implementation of the AI Agent + Skill engine.

### Skill Execution Pipeline

```
[API Request]  POST /api/projects/:projectId/ai/<skill-endpoint>
       │
       ▼
[Auth + Project Scope Check]  ←── projectId verified against caller's org
       │
       ▼
[AI Engine]  backend/src/lib/ai-engine.ts
       │  ├── ANTHROPIC_API_KEY present? → call Anthropic Claude API
       │  └── ANTHROPIC_API_KEY absent?  → return HTTP 503 (graceful degradation)
       │
       ▼
[Skill Implementation]  backend/src/lib/skills/<skill>.ts
       │  ├── Builds structured system prompt (NetSuite domain knowledge embedded)
       │  ├── Builds user prompt (project requirements / pain points / context)
       │  └── Calls Anthropic claude-sonnet-4-6 with structured JSON output schema
       │
       ▼
[AI Response Parsed + Validated]
       │
       ▼
[Analysis Stored in DB]  ←── written before response returned (storage-first)
       │  ├── Skill-specific table (e.g. RequirementAnalysis, ScopeEstimation)
       │  └── AiGeneratedOutput record (outputType + content + status: DRAFT)
       │
       ▼
[API Response]  returns stored analysis with confidenceScore + evidence
       │
       ▼
[Human Review Workflow]  ←── output enters standard DRAFT → IN_REVIEW → APPROVED pipeline
```

### AI Engine Design

| Concern | Implementation |
|---|---|
| Provider | Anthropic Claude (`@anthropic-ai/sdk`) |
| Model | `claude-sonnet-4-6` |
| Graceful degradation | Returns HTTP 503 when `ANTHROPIC_API_KEY` not set; no crash |
| Output format | Structured JSON schema enforced via prompt instruction |
| Domain context | NetSuite module knowledge embedded in each skill's system prompt |
| Module catalog | `NetsuiteModuleCatalog` table (20 seeded modules) injected into recommend-modules and estimate-scope prompts |
| Storage | Every result written to DB before response; no ephemeral AI |
| Attribution | All outputs linked to `AiGeneratedOutput` with `agentId` and `skillId` |

### Confidence Scoring

Every presales AI skill result carries a `confidenceScore` (integer 0–100) and a `confidenceLabel`:

| Score Range | Label |
|---|---|
| 0–39 | Low |
| 40–59 | Medium |
| 60–79 | High |
| 80–100 | Very High |

Confidence is assigned by the AI based on the completeness and clarity of the input data. Low-confidence outputs should be flagged for additional discovery before use in client deliverables.

### Evidence Tracking

`RequirementAnalysis.evidence` and `ModuleRecommendationAnalysis.evidence` are structured JSON arrays. Each evidence item must reference a specific requirement, pain point, or discovery answer that supports the AI's analysis. Evidence is required — generic outputs without evidence are rejected at the prompt layer.

### Frontend Presales AI Pages (Prompt 06)

| Route | Purpose |
|---|---|
| `/projects/[projectId]/ai/analyze` | Trigger and view requirement analysis results |
| `/projects/[projectId]/ai/pain-points/classify` | Trigger and view pain point classifications |
| `/projects/[projectId]/ai/modules` | View module recommendations |
| `/projects/[projectId]/ai/scope` | View scope estimation results |
| `/projects/[projectId]/ai/proposal` | View and manage generated proposal draft sections |
| `/projects/[projectId]/ai/catalog` | Browse the NetSuite module catalog |

---

## AI Functional Delivery Intelligence Layer (Added Prompt 07)

This layer describes the architectural pipeline from business process definition through fit-gap analysis, UAT scenario generation, and SOP authoring to a reviewed, publishable functional deliverable.

### Business Process → Fit-Gap → UAT → SOP Pipeline

```
[FunctionalWorkstream]   e.g. "Finance — P2P", "Operations — O2C"
       │
       ▼
[BusinessProcess × N]   e.g. "Vendor Invoice Approval", "PO Matching"
       │  (categorized by ProcessCategory enum)
       ├── [ProcessStep × N]   ordered steps with descriptions
       │
       ▼
[AI: generate-fit-gap]   POST /api/projects/:projectId/ai/generate-fit-gap
       │  Skill: generate-fit-gap.ts
       │  Each process assessed against specific NetSuite capability
       │  FitCategory: FIT_STANDARD | FIT_WITH_CONFIGURATION | FIT_WITH_WORKFLOW
       │              | FIT_WITH_CUSTOMIZATION | FIT_WITH_INTEGRATION | GAP | OUT_OF_SCOPE
       ▼
[FitGapAnalysis]   stored per process; linked to AiGeneratedOutput (DRAFT)
       │
       ▼
[AI: generate-uat]   POST /api/projects/:projectId/ai/generate-uat
       │  Skill: generate-uat.ts
       │  Each scenario includes navigable NetSuite test steps
       │  UatCategory: POSITIVE, NEGATIVE, EDGE_CASE, REGRESSION, INTEGRATION
       ▼
[UatScenario × N]   stored per process; UatScenarioStatus lifecycle
       │
       ▼
[AI: generate-sop]   POST /api/projects/:projectId/ai/generate-sop
       │  Skill: generate-sop.ts
       │  Each step references actual NetSuite screens and navigation paths
       │  SopStatus: DRAFT | IN_REVIEW | APPROVED | PUBLISHED
       ▼
[SopDocument]   stored per process; version auto-increments on content change
       │
       ▼
[FunctionalDeliverable]   tracks deliverable type, status, and linked outputs
       │  DeliverableType: FIT_GAP_REPORT | UAT_SCRIPT | SOP | PROCESS_DESIGN | TRAINING_MATERIAL
       │  FunctionalDeliverableStatus: NOT_STARTED | IN_PROGRESS | REVIEW | APPROVED | PUBLISHED
       ▼
[Human Review Workflow]   standard AiGeneratedOutput DRAFT → PUBLISHED pipeline
```

### Workstream Management Architecture

- `FunctionalWorkstream` is the top-level container for a delivery area (e.g., Finance, Supply Chain).
- Each workstream carries a `WorkstreamStatus` (PLANNED, IN_PROGRESS, ON_HOLD, COMPLETED).
- `BusinessProcess` entities are grouped under a workstream and classified by `ProcessCategory` (e.g., P2P, O2C, R2R, INVENTORY, HR, REPORTING, CUSTOM).
- `ProcessStep` records define the ordered steps within each process, providing the context that AI skills consume.

### Deliverable Versioning Strategy

- `SopDocument` carries an integer `version` field that auto-increments each time the `content` field changes.
- Version increment is enforced at the service layer (not by the AI or the client). The previous version is retained in the audit trail.
- `FitGapAnalysis` and `UatScenario` records are immutable once approved. Re-running the AI skill creates a new set of records linked to a new `AiGeneratedOutput`.
- `FunctionalDeliverable` acts as the versioned surface visible to the project team; it references the latest approved output for its type.

### Frontend Functional Delivery Pages (Prompt 07)

| Route | Purpose |
|---|---|
| `/projects/[projectId]/functional` | Functional delivery index / workstream overview |
| `/projects/[projectId]/functional/workstreams` | Manage functional workstreams and processes |
| `/projects/[projectId]/functional/fit-gap` | Trigger and review fit-gap analysis results |
| `/projects/[projectId]/functional/uat` | Trigger and review UAT scenarios |
| `/projects/[projectId]/functional/sop` | Trigger and review SOP documents |
| `/projects/[projectId]/functional/deliverables` | Track functional deliverable status |
## Prompt 13 — SaaS Multi-Tenant Operations Layer

The SaaS operations layer sits above the existing organization/project delivery model.

- Tenant identity: one `Tenant` per `Organization`, using `organizationId` as the primary partition boundary.
- Plan catalog: `SubscriptionPlan.features` provides feature gating and module entitlement metadata.
- Billing: tenant invoices are scoped by `tenantId`, tied to plan metadata, and audited on create/payment.
- Usage: metered usage records aggregate API usage, AI output count, storage, and active users.
- Tenant RBAC: tenant-specific roles and assignments supplement organization-level RBAC.
- Admin UI: `/admin/*` routes provide tenant registry, plan catalog, billing, usage, and role management dashboards.

Security rule: future modules must never query tenant-owned records without either `organizationId` validation or `tenantId` validation derived from the authenticated user's organization.

## Prompt 14 — Deployment & DevOps Layer

The deployment layer adds an operational control plane for environments, services, pipeline runs, metrics, alerts, and rollback/self-healing actions.

- CI/CD: GitHub Actions workflows validate Prisma, migrations, TypeScript, builds, tests, and container builds before deployment.
- Environments: development, staging, and production are represented in `DeploymentEnvironment` with registry, URL, region, and secret references.
- Runtime services: `DeploymentService` tracks service/module, image tag, replicas, status, health, and optional tenant affinity.
- Deployment history: `DeploymentRun` records build/test/deploy/rollback/scale/self-heal actions with actor, environment, tenant, logs, version, and status.
- Observability: Prometheus scrapes backend metrics; Loki/Promtail centralize Docker logs; dashboard surfaces metrics and alerts.
- Self-healing: local Compose restart policy and API-driven service recovery restore desired replicas and healthy status.
- Rollback: API and script hooks record rollback runs and restore stable image tags; production Compose overlay uses update rollback policy.
- Routing: production overlay includes Traefik labels for web/API routing and TLS termination.

## Prompt 15 — Security, Compliance & Data Protection Layer

The security layer adds encryption, secret governance, access logs, compliance reporting, and tenant-isolated security administration.

- Encryption: `SecretStore.secretValue` is encrypted using AES-256-GCM before persistence.
- Encryption registry: `EncryptedField` documents protected fields and planned/hardened encryption scope.
- Secret management: `SecretStore` scopes secrets by organization and optional tenant, stores rotation policy, and masks values in API responses.
- Access logs: `AccessLog` records actor, tenant, project, entity, action, result, IP, user agent, and timestamp.
- Compliance: `/api/security/compliance-report` reports GDPR/PDPA readiness indicators, retention policy, stale secrets, failed access, and critical alerts.
- RBAC: all security endpoints require authenticated admin-grade organization write permission.
- Tenant isolation: tenant-scoped security operations validate tenant ownership before read/write.
- CI/CD: `scripts/security-check.sh` is included in the CI workflow.
# Prompt 17 — Global Admin Architecture

The global admin layer extends the SaaS administration module with superuser-only APIs under `/api/admin`. Cross-tenant aggregation is centralized in the admin service and guarded by `requireSuperuser`, preserving tenant-scoped APIs for normal users. The frontend exposes dedicated `/admin/global-dashboard`, `/admin/users`, `/admin/tenants`, and `/admin/deployments` routes.
