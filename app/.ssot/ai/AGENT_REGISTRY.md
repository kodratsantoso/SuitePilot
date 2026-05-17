# AI Agent Registry

> Last updated: 2026-05-14 (updated Prompt 06)
> This is the authoritative list of all AI agents in the platform.
> Do not add agents to the codebase without registering them here first.

---

## Implementation Agents (NetSuite Delivery)

| ID | Name | Slug | Definition File | Status | Phase Introduced |
|---|---|---|---|---|---|
| AGT-001 | Presales Agent | `presales` | `ai/agents/presales.agent.md` | **ACTIVE** | Phase 0 |
| AGT-002 | Solution Architect Agent | `solution-architect` | `ai/agents/solution-architect.agent.md` | DEFINED | Phase 0 |
| AGT-003 | Functional Consultant Agent | `functional-consultant` | `ai/agents/functional-consultant.agent.md` | DEFINED | Phase 0 |
| AGT-004 | Technical Consultant Agent | `technical-consultant` | `ai/agents/technical-consultant.agent.md` | DEFINED | Phase 0 |
| AGT-005 | PMO Agent | `pmo` | `ai/agents/pmo.agent.md` | DEFINED | Phase 0 |
| AGT-006 | Governance Agent | `governance` | `ai/agents/governance.agent.md` | DEFINED | Phase 0 |

---

## Development Agents (Platform Engineering)

Development agents assist with building and maintaining the AI NetSuite Implementation OS platform itself. They do not assist with client NetSuite implementations — they assist with the engineering work of the platform.

| ID | Name | Slug | Definition File | Status | Phase Introduced |
|---|---|---|---|---|---|
| AGT-DEV-001 | Product Architect Developer Agent | `dev/product-architect` | `ai/agents/development/product-architect-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-002 | Frontend Developer Agent | `dev/frontend` | `ai/agents/development/frontend-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-003 | Backend Developer Agent | `dev/backend` | `ai/agents/development/backend-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-004 | Database/Prisma Developer Agent | `dev/database` | `ai/agents/development/database-prisma-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-005 | AI Orchestration Developer Agent | `dev/ai-orchestration` | `ai/agents/development/ai-orchestration-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-006 | DevOps/Deployment Developer Agent | `dev/devops` | `ai/agents/development/devops-deployment-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-007 | QA/Test Automation Developer Agent | `dev/qa` | `ai/agents/development/qa-test-automation-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |
| AGT-DEV-008 | Security/Governance Developer Agent | `dev/security` | `ai/agents/development/security-governance-developer.agent.md` | DEFINED | Phase 0 (Prompt 02) |

---

## Agent Descriptions

### AGT-001 — Presales Agent  *(ACTIVE as of Prompt 06)*
Assists presales consultants during customer discovery and qualification. Generates module recommendations, BRD drafts, and proposal content based on structured discovery inputs. Must not make pricing or contractual commitments.

**Implemented skills (Prompt 06):**

| Skill | Implementation | API Endpoint |
|---|---|---|
| Analyze Requirements | `backend/src/lib/skills/analyze-requirements.ts` | POST /api/projects/:projectId/ai/analyze-requirements |
| Classify Pain Points | `backend/src/lib/skills/classify-pain-points.ts` | POST /api/projects/:projectId/ai/classify-pain-points |
| Recommend Modules | `backend/src/lib/skills/recommend-modules.ts` | POST /api/projects/:projectId/ai/recommend-modules |
| Estimate Scope | `backend/src/lib/skills/estimate-scope.ts` | POST /api/projects/:projectId/ai/estimate-scope |
| Generate Proposal Draft | `backend/src/lib/skills/generate-proposal-draft.ts` | POST /api/projects/:projectId/ai/generate-proposal-draft |

**AI Engine:** `backend/src/lib/ai-engine.ts` — wraps `@anthropic-ai/sdk`, model `claude-sonnet-4-6`, graceful 503 degradation.

### AGT-002 — Solution Architect Agent
Produces fit-gap analyses, solution blueprints, and integration architecture designs based on confirmed requirements. All outputs are drafts pending architect review.

### AGT-003 — Functional Consultant Agent
Assists functional consultants with process design, UAT script generation, and training material creation. Outputs must align with confirmed requirements and be reviewed by a qualified NetSuite consultant before use.

### AGT-004 — Technical Consultant Agent
Assists technical consultants with SuiteScript scaffolding, RESTlet design, integration mapping, and OAuth troubleshooting. All generated code is explicitly marked as a draft and must be reviewed before deployment.

### AGT-005 — PMO Agent
Generates project management artifacts including project plans, RAID logs, meeting minutes, weekly reports, and cutover checklists. Timeline and resource assumptions must be validated by the PM before sharing with clients.

### AGT-006 — Governance Agent
Evaluates outputs from other agents for quality, accuracy, and risk. Flags hallucinations, inconsistencies, and high-risk claims. Must be the first agent to reach ACTIVE status.

### AGT-DEV-001 — Product Architect Developer Agent
Defines module boundaries, translates SSOT roadmap items into technical implementation plans, and maintains architectural consistency across the codebase. Operates before all other development agents.

### AGT-DEV-002 — Frontend Developer Agent
Builds Next.js pages, layouts, components, and React Query hooks. Responsible for all user-facing UI from the global portfolio dashboard to individual project workspaces.

### AGT-DEV-003 — Backend Developer Agent
Implements Hono API routes, service layer logic, Zod validation, audit log integration, and RBAC enforcement. Every API endpoint follows the contracts defined in SSOT.

### AGT-DEV-004 — Database/Prisma Developer Agent
Designs and maintains the Prisma schema, writes migrations, and produces seed data. Ensures organization-scoped isolation at the database level.

### AGT-DEV-005 — AI Orchestration Developer Agent
Builds the custom AI orchestration layer: agent registry, skill registry, prompt routing, output lifecycle management, and review workflow integration.

### AGT-DEV-006 — DevOps/Deployment Developer Agent
Creates Docker setup, CI/CD pipelines, health checks, deployment validation scripts, and environment variable management.

### AGT-DEV-007 — QA/Test Automation Developer Agent
Designs and implements unit tests, API integration tests, E2E tests, regression checklists, and acceptance criteria validation.

### AGT-DEV-008 — Security/Governance Developer Agent
Implements RBAC, enforces multi-tenant isolation, manages secret handling, maintains the immutable audit log, and prepares the platform for enterprise security requirements.

---

## Prompt 06 Updates — Presales Agent Activation

### AGT-001 Presales Agent — ACTIVE

The Presales Agent reached ACTIVE status in Prompt 06. It is the first implementation agent to be connected to the live Anthropic Claude API provider. All 5 presales intelligence skills are implemented, wired, and producing storable, reviewable outputs.

**Activation summary:**

| Milestone | Status |
|---|---|
| Agent definition exists | DONE (Phase 0) |
| Skills defined | DONE (Phase 0) |
| Storage and API infrastructure | DONE (Prompt 05) |
| Live AI provider wired | DONE (Prompt 06) |
| Skill implementations complete | DONE (Prompt 06) |
| Outputs enter review workflow | DONE (Prompt 06) |
| Confidence scoring on all outputs | DONE (Prompt 06) |
| Evidence tracking on analysis outputs | DONE (Prompt 06) |
| Frontend pages for all skills | DONE (Prompt 06) |

**Remaining gap to full production readiness:**
- Golden answer baselines (evaluation test suite — Phase 10)
- Governance Agent rubric evaluation on presales outputs (Phase 2)
- Notification system for review queue (Phase 4)

---

## Prompt 05 Updates — Discovery and Review Platform Layer

### Discovery Agent (Platform Role)

The Discovery Agent is a platform-layer role (not a separate registered agent) fulfilled by AGT-001 (Presales Agent) and AGT-003 (Functional Consultant Agent) during the discovery phase. As of Prompt 05, the full storage and API infrastructure for discovery is implemented. The Discovery Agent's responsibilities are:

| Responsibility | API Surface | Status |
|---|---|---|
| Facilitate discovery sessions | POST /api/projects/:projectId/discovery-sessions | INFRASTRUCTURE READY |
| Generate discovery questions | POST /api/discovery-sessions/:sessionId/questions (source: AI_GENERATED) | INFRASTRUCTURE READY |
| Extract requirements from answers | POST /api/projects/:projectId/requirements | INFRASTRUCTURE READY |
| Identify pain points | POST /api/projects/:projectId/pain-points | INFRASTRUCTURE READY |
| Produce discovery summary output | POST /api/projects/:projectId/ai/generated-outputs (outputType: DISCOVERY_SUMMARY) | INFRASTRUCTURE READY |

Agent wiring to live AI provider: **Completed in Prompt 06.** See AGT-001 skill table above.

### AI Output Review Agent (Platform Role)

The AI Output Review Agent is the platform-layer enforcement of the human review gate. It is backed by the Governance Agent (AGT-006) for automated rubric evaluation, and by named human reviewers for final approval decisions. As of Prompt 05, the review infrastructure is fully implemented:

| Responsibility | API Surface | Status |
|---|---|---|
| Queue outputs for review | PATCH .../generated-outputs/:outputId (status → IN_REVIEW) | IMPLEMENTED |
| Submit review decision | POST .../generated-outputs/:outputId/reviews | IMPLEMENTED |
| Approve output for publication | review.decision = APPROVED → output.status = APPROVED | IMPLEMENTED |
| Reject output | review.decision = REJECTED → output.status = REJECTED | IMPLEMENTED |
| Request revision | review.decision = REVISION_REQUESTED → output.status = REVISED | IMPLEMENTED |
| Block publication without approval | status = PUBLISHED requires approved AiReview | ENFORCED BY API |

---

## Governance Rules

- No implementation agent may claim final authority on accounting, tax, compliance, or licensing decisions.
- Every implementation agent output is a draft until reviewed by a qualified human.
- High-risk outputs (compliance, security, financial) require review by a senior consultant or engagement manager.
- Generated technical scripts and code are always marked as draft until approved by a technical consultant.
- NetSuite configuration guidance must include explicit assumptions and validation notes.
- Development agents produce code for the platform itself — their outputs follow the same SSOT-first, review-required principles.
## Prompt 13 Agent Operating Notes

The Security/Governance and Product Architecture developer agents now have an explicit SaaS responsibility:

- Review all future data models for tenant or organization partition keys.
- Ensure AI agent outputs, feedback loops, and generated artifacts remain scoped to the authenticated tenant/organization.
- Treat cross-tenant data access as a critical defect.
- Require audit logging for tenant lifecycle, billing, subscription, role, and usage mutations.
# Prompt 17 Registry Update

Global Admin/Superuser workflows are supported by the Governance Agent, PMO Agent, and DevOps Deployment Developer for cross-tenant oversight, deployment control, audit review, and enterprise exception handling.
