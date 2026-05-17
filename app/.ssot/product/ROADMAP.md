# Product Roadmap

> Last updated: 2026-05-13 (updated Prompt 02)
> Current phase: **Phase 0 — Complete** (Prompt 02 additions committed)

> **Prompt 02 Update:** Project management is now a core product capability alongside AI assistance. The platform has two primary layers: (1) Portfolio / Project Management Layer for managing multiple implementation projects, and (2) Individual Project Workspace Layer for working inside a specific project. All future phases must support both layers.

---

## Phase 0 — Product Foundation & SSOT Setup
**Status: Complete**
**Goal:** Establish the repository structure, governance documentation, AI agent/skill skeleton, and development baseline before any code is written.

Deliverables:
- Monorepo directory structure
- SSOT documentation baseline (all files under `app/.ssot/`)
- AI agent definitions (6 agents)
- AI skill definitions (32 skills)
- Architecture Decision Records (initial set)
- README, .gitignore, .env.example
- Changelog initialized

---

## Phase 1 — Core Platform Foundation
**Status: Pending**
**Goal:** Build the foundational technical infrastructure — authentication, database, project portfolio management, and project workspace shell — that all future features depend on.

Deliverables:
- pnpm workspace initialization, TypeScript, ESLint, Prettier
- Docker Compose for local development (PostgreSQL, Redis, backend, frontend)
- Database schema (Prisma) — User, Organization, Role, Permission, Customer, Project, ProjectMember, ProjectTask, ProjectMilestone, RaidItem, Workstream, ProjectActivity, AuditLog
- Authentication system (JWT + RBAC)
- Backend API scaffold (Hono) with health check
- Project Portfolio API (CRUD + list with filters + health/status)
- Project Task API (CRUD)
- Project Milestone API (CRUD)
- RAID Log API (CRUD)
- Project Activity Feed API
- Audit logging infrastructure (immutable, org-scoped)
- Frontend scaffold (Next.js App Router)
- Global project portfolio page (`/projects`)
- Project workspace shell (`/projects/[id]` with sidebar navigation)
- Project overview page (`/projects/[id]/overview`)
- Project tasks page (`/projects/[id]/tasks`)
- Project milestones page (`/projects/[id]/milestones`)
- RAID log page (`/projects/[id]/raid`)
- Seed script with representative development data
- CI/CD pipeline baseline (GitHub Actions)
- Environment variable validation at startup

---

## Phase 2 — AI Agent & Skill Engine
**Status: Pending**
**Goal:** Build the AI orchestration layer that powers all agent-based workflows.

Deliverables:
- AI provider abstraction (Anthropic, OpenAI, Gemini)
- Agent runner infrastructure
- Skill invocation framework
- Conversation and output storage
- Draft output lifecycle management
- Human review queue
- Prompt template versioning

---

## Phase 3 — Presales Discovery MVP
**Status: Pending**
**Goal:** First user-facing AI-powered workflow — structured discovery sessions.

Deliverables:
- Discovery session creation and management
- AI-guided discovery question flows
- Session summary generation
- Module recommendation engine
- Qualification scoring
- BRD draft generation (initial)

---

## Phase 4 — Document Generation & Review Workflow
**Status: Pending**
**Goal:** Generalized document generation with structured human review.

Deliverables:
- Document template registry
- AI document generator (BRD, meeting minutes, proposals)
- Review workflow (submit → review → approve/reject → publish)
- Comment and annotation system
- Document versioning
- Export to PDF / DOCX

---

## Phase 5 — Solution Architecture & Fit-Gap Module
**Status: Pending**
**Goal:** AI-assisted fit-gap analysis and solution blueprint generation.

Deliverables:
- Requirements capture interface
- Fit-gap analysis engine
- Solution blueprint generator
- Module coverage mapping
- Integration architecture diagrams (text-based)
- Assumption and risk registry

---

## Phase 6 — Functional Delivery Module
**Status: Pending**
**Goal:** AI assistance for functional consultants during delivery.

Deliverables:
- Process design templates (P2P, O2C, R2R)
- Master data design assistant
- UAT script generator
- Training material generator
- Functional design document generator

---

## Phase 7 — Technical Delivery & Integration Assistant
**Status: Pending**
**Goal:** AI assistance for technical consultants building integrations and customizations.

Deliverables:
- SuiteScript helper (code scaffolding, review, documentation)
- RESTlet design assistant
- Integration mapping tool
- OAuth troubleshooting guide
- Payload validation helper
- Technical spec generator

---

## Phase 8 — PMO & Project Governance Module
**Status: Pending**
**Goal:** AI-assisted project management and governance tools.

Deliverables:
- Project plan generator
- RAID log management
- Meeting minutes generator
- Weekly status report generator
- Cutover checklist builder
- Hypercare tracker

---

## Phase 9 — Knowledge Base & RAG Layer
**Status: Pending**
**Goal:** Build the proprietary knowledge base that grounds AI agents in verified facts.

Deliverables:
- Knowledge ingestion pipeline
- NetSuite module knowledge base
- Implementation patterns library
- Industry-specific content library
- RAG retrieval integration into all agents
- Knowledge base maintenance workflows

---

## Phase 10 — Evaluation, QA & Hallucination Control
**Status: Pending**
**Goal:** Systematic quality control for all AI-generated content.

Deliverables:
- Evaluation test case library
- Golden answer baseline
- Hallucination detection layer
- Confidence scoring
- Quality score dashboard
- Agent performance metrics

---

## Phase 11 — Dashboard, Analytics & Management View
**Status: Pending**
**Goal:** Visibility into platform usage, delivery quality, and agent performance.

Deliverables:
- Practice dashboard (projects, health, workload)
- Agent usage analytics
- Document quality metrics
- Review cycle time tracking
- Knowledge base coverage gaps

---

## Phase 12 — NetSuite-Specific Advanced Intelligence
**Status: Pending**
**Goal:** Deep NetSuite domain expertise encoded into specialized AI capabilities.

Deliverables:
- Module-specific configuration intelligence
- NetSuite release notes monitoring
- Best practice configuration advisor
- Saved search and report builder assistant
- Roles and permissions design assistant

---

## Phase 13 — Implementation Automation & External Integrations
**Status: Pending**
**Goal:** Automate repetitive tasks and connect to external systems used in delivery.

Deliverables:
- NetSuite sandbox environment health checks
- Integration with project tools (Jira, Asana, Monday)
- CRM integration for presales pipeline
- Email/calendar integration for meeting minutes
- Automated report delivery

---

## Phase 14 — Security, Permission & Enterprise Readiness
**Status: Pending**
**Goal:** Harden the platform for enterprise clients and multi-tenant SaaS deployment.

Deliverables:
- Role-based access control (full RBAC)
- SSO / SAML / OIDC integration
- Data residency controls
- Security audit and penetration test
- SOC 2 readiness checklist
- Data retention and deletion policies

---

## Phase 15 — SaaS Packaging & Commercialization
**Status: Pending**
**Goal:** Package and launch the platform as a multi-tenant SaaS product.

Deliverables:
- Subscription and billing system
- Self-serve onboarding
- Tenant isolation validation
- Usage-based pricing model
- Partner onboarding portal
- Public documentation site
