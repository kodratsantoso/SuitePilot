# AI NetSuite Implementation Operating System

> **Status: Phase 0 — Product Foundation & SSOT Setup (Bootstrap Complete)**
> This repository is in its foundational state. No business features have been implemented yet.

---

## Overview

The **AI NetSuite Implementation Operating System** is an enterprise-grade platform designed to support the full lifecycle of NetSuite ERP implementations — from presales discovery through hypercare — powered by AI agents, structured workflows, and a human-review governance layer.

This is not a generic project management tool. It is purpose-built for NetSuite implementation partners and teams, encoding decades of ERP delivery expertise into AI-assisted workflows that reduce risk, improve consistency, and accelerate delivery.

---

## Problem Statement

NetSuite implementations are complex, high-stakes engagements that require:

- Consistent discovery and scoping across sales and delivery teams
- Structured fit-gap analysis and solution blueprints
- Repeatable document generation (BRDs, solution designs, test scripts)
- Cross-functional coordination between presales, architects, consultants, and PMOs
- Auditability and governance for AI-generated recommendations

Currently, most of this work is done ad-hoc, leading to scope creep, inconsistent quality, and significant rework.

---

## Repository Structure

```
.
├── README.md                    # This file
├── .gitignore
├── .env.example                 # Environment variable template
│
├── app/                         # Application source code
│   ├── frontend/                # Next.js or React frontend (Phase 1+)
│   ├── backend/                 # Node.js / Hono API backend (Phase 1+)
│   ├── prisma/                  # Database schema and migrations
│   ├── packages/                # Shared packages (monorepo)
│   ├── docs/                    # App-level technical docs
│   ├── scripts/                 # Utility and automation scripts
│   ├── tests/                   # Integration and E2E tests
│   └── .ssot/                   # Single Source of Truth governance
│       ├── product/             # Vision, roadmap, phases, tasks
│       ├── architecture/        # Architecture, data model, API contracts
│       ├── ai/                  # Agent registry, skill registry, governance
│       ├── delivery/            # Implementation method, quality gates
│       ├── decisions/           # Architecture Decision Records (ADRs)
│       ├── validation/          # Test plan, deployment validation
│       └── logs/                # Changelog, release notes
│
└── ai/                          # AI agent and skill definitions
    ├── agents/                  # Agent role definitions
    ├── skills/                  # Skill definitions by agent role
    │   ├── presales/
    │   ├── solution-architect/
    │   ├── functional-consultant/
    │   ├── technical-consultant/
    │   ├── pmo/
    │   └── governance/
    ├── prompts/                 # System prompts, workflow prompts, output formats
    ├── evaluations/             # Evaluation test cases and golden answers
    └── knowledge/               # Domain knowledge base for RAG
        ├── netsuite/
        ├── implementation/
        ├── industry/
        └── templates/
```

---

## SSOT Governance

All product decisions, architecture choices, and AI definitions are maintained in `app/.ssot/`. This is the **Single Source of Truth** for the platform. Before modifying architecture, adding agents, or changing workflows, the relevant SSOT file must be updated first.

Key SSOT files:
- [`app/.ssot/product/VISION.md`](app/.ssot/product/VISION.md) — Product vision and strategic positioning
- [`app/.ssot/product/ROADMAP.md`](app/.ssot/product/ROADMAP.md) — Phase-based delivery roadmap
- [`app/.ssot/product/TASKS.md`](app/.ssot/product/TASKS.md) — Current tasks and status
- [`app/.ssot/architecture/ARCHITECTURE.md`](app/.ssot/architecture/ARCHITECTURE.md) — System architecture
- [`app/.ssot/ai/AGENT_REGISTRY.md`](app/.ssot/ai/AGENT_REGISTRY.md) — All registered AI agents
- [`app/.ssot/ai/SKILL_REGISTRY.md`](app/.ssot/ai/SKILL_REGISTRY.md) — All registered AI skills

---

## AI Agents

Six specialized AI agents orchestrate the platform's intelligence:

| Agent | Role |
|---|---|
| Presales Agent | Discovery, qualification, proposal generation, module recommendations |
| Solution Architect Agent | Fit-gap analysis, solution blueprints, integration architecture |
| Functional Consultant Agent | Process design, UAT generation, training materials |
| Technical Consultant Agent | SuiteScript helpers, integration mapping, OAuth troubleshooting |
| PMO Agent | Project plans, RAID logs, meeting minutes, cutover checklists |
| Governance Agent | Hallucination checks, risk review, approval gates, audit trails |

See [`ai/agents/`](ai/agents/) for full agent definitions.

---

## Development Phases

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Product Foundation & SSOT Setup | **Complete** |
| Phase 1 | Core Platform Foundation | Pending |
| Phase 2 | AI Agent & Skill Engine | Pending |
| Phase 3 | Presales Discovery MVP | Pending |
| Phase 4 | Document Generation & Review Workflow | Pending |
| Phase 5 | Solution Architecture & Fit-Gap Module | Pending |
| Phase 6 | Functional Delivery Module | Pending |
| Phase 7 | Technical Delivery & Integration Assistant | Pending |
| Phase 8 | PMO & Project Governance Module | Pending |
| Phase 9 | Knowledge Base & RAG Layer | Pending |
| Phase 10 | Evaluation, QA & Hallucination Control | Pending |
| Phase 11 | Dashboard, Analytics & Management View | Pending |
| Phase 12 | NetSuite-Specific Advanced Intelligence | Pending |
| Phase 13 | Implementation Automation & External Integrations | Pending |
| Phase 14 | Security, Permission & Enterprise Readiness | Pending |
| Phase 15 | SaaS Packaging & Commercialization | Pending |

---

## Current Status

**Phase 0 is complete.**

The repository now contains:
- Full directory structure for a production-grade monorepo
- SSOT governance documentation baseline
- All AI agent role definitions
- All AI skill definitions (32 skills across 6 roles)
- Architecture Decision Records
- Roadmap and task tracking baseline
- Changelog initialized

**No application code has been written yet.** The next step is Phase 1: Core Platform Foundation.

---

## Next Steps

Proceed to **Prompt 02 — Build Core Platform Foundation**:

> Build Auth, Database Schema, Workspace, Customer, Project, and Audit Log infrastructure.

---

## Setup Notes

1. Copy `.env.example` to `.env` and fill in your values.
2. No package manager has been initialized yet — this will happen in Phase 1.
3. The `app/prisma/` folder will receive the database schema in Phase 1.
4. See [`app/.ssot/product/TASKS.md`](app/.ssot/product/TASKS.md) for the full task list.

---

## Governance Rules

- All AI-generated outputs are drafts until reviewed by a qualified human.
- AI agents must not claim final authority on accounting, tax, compliance, or licensing.
- NetSuite configuration guidance must include assumptions and validation notes.
- Generated technical scripts must be marked as draft until a technical consultant approves them.
- All decisions of consequence must be logged in the audit trail.
