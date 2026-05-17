# AI Agent Status

> Last updated: 2026-05-14 (updated Prompt 07)

This file tracks the operational readiness of each AI agent. An agent is not considered "active" until its definition file is complete, its skills are registered, its prompts are written, its outputs have been evaluated, and it has been connected to the orchestration layer.

---

## Status Legend

| Status | Meaning |
|---|---|
| `DEFINED` | Agent definition file exists in `ai/agents/` |
| `SKILLS_DEFINED` | All skill files for this agent exist in `ai/skills/` |
| `PROMPTS_WRITTEN` | System prompts and workflow prompts exist in `ai/prompts/` |
| `EVALUATED` | Golden answer baselines and evaluation tests exist |
| `CONNECTED` | Agent is wired into the AI orchestration layer |
| `ACTIVE` | Agent is available to users in the platform |

---

## Implementation Agent Status (NetSuite Delivery)

| Agent | Definition | Skills | Prompts | Evaluated | Connected | Active |
|---|---|---|---|---|---|---|
| Presales Agent | DEFINED | SKILLS_DEFINED | PROMPTS_WRITTEN | Pending | CONNECTED | **Yes** |
| Solution Architect Agent | DEFINED | SKILLS_DEFINED | Pending | Pending | Pending | No |
| Functional Consultant Agent | DEFINED | SKILLS_DEFINED | PROMPTS_WRITTEN | Pending | CONNECTED | **Yes** |
| Technical Consultant Agent | DEFINED | SKILLS_DEFINED | Pending | Pending | Pending | No |
| PMO Agent | DEFINED | SKILLS_DEFINED | Pending | Pending | Pending | No |
| Governance Agent | DEFINED | SKILLS_DEFINED | Pending | Pending | Pending | No |

## Development Agent Status (Platform Engineering)

Development agents are used to build the platform itself. They do not require the same activation path as implementation agents — they are invoked during the development process by the engineering team.

| Agent | Definition | Skills | Status |
|---|---|---|---|
| Product Architect Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| Frontend Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| Backend Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| Database/Prisma Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| AI Orchestration Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| DevOps/Deployment Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| QA/Test Automation Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |
| Security/Governance Developer Agent | DEFINED | SKILLS_DEFINED | Ready for use in development |

---

## Prompt 05 Updates

### Discovery Agent (Platform Layer)

Prompt 05 laid the foundation for the Discovery Agent by implementing the full storage and API layer it will operate over. The following platform capabilities are now in place:

| Capability | Status |
|---|---|
| DiscoverySession storage and CRUD API | IMPLEMENTED |
| DiscoveryQuestion storage and API | IMPLEMENTED |
| DiscoveryAnswer storage and API | IMPLEMENTED |
| Requirement extraction and storage | IMPLEMENTED |
| PainPoint capture and storage | IMPLEMENTED |
| AiConversation storage with agent/skill attribution | IMPLEMENTED |
| AiMessage storage per conversation | IMPLEMENTED |
| Frontend AI workspace pages (9 pages) | IMPLEMENTED |

The Discovery Agent (maps to AGT-001 Presales Agent and AGT-003 Functional Consultant Agent for discovery-phase work) will be wired to these endpoints when the AI provider layer is connected in Prompt 06.

### AI Output Review Agent (Platform Layer)

The full review lifecycle infrastructure is now implemented:

| Capability | Status |
|---|---|
| AiGeneratedOutput model with status lifecycle | IMPLEMENTED |
| AiReview model with decision and comments | IMPLEMENTED |
| POST /api/projects/:projectId/ai/generated-outputs/:outputId/reviews | IMPLEMENTED |
| Status transitions: Draft → In_Review → Approved/Rejected/Revised → Published | IMPLEMENTED |
| Human review gate: Published requires approved AiReview | IMPLEMENTED |
| Reviewer attribution (named User) on all reviews | IMPLEMENTED |

The Governance Agent (AGT-006) review automation will be wired to these endpoints in Phase 2.

---

## Notes

- All implementation agents are defined and skills are defined as of Phase 0.
- The Governance Agent must be the first implementation agent to reach `ACTIVE` status in production.
- Development agents are available immediately to assist with platform engineering from Phase 1 onwards.
- As of Prompt 05, the discovery and review storage layers are fully implemented.
- As of Prompt 06, the Presales Agent (AGT-001) is ACTIVE with 5 skills.
- As of Prompt 07, the Functional Consultant Agent (AGT-003) is ACTIVE with 3 skills.
- As of Prompt 13, the platform has an operational SaaS administration layer for tenant isolation, subscription plans, billing, usage tracking, and tenant RBAC. Governance and Security developer agents should treat tenant isolation as a mandatory review gate for future modules.
- As of Prompt 14, DevOps deployment operations are modeled and exposed through admin APIs and UI. The DevOps Deployment Developer Agent should treat CI/CD, health checks, rollback hooks, logging, and tenant-aware runtime isolation as active operating responsibilities.
- As of Prompt 15, the Security/Governance Developer Agent has active platform responsibilities for encrypted secret storage, access logs, security audit trails, tenant-isolated secret operations, and GDPR/PDPA readiness reporting.

---

---

## Prompt 07 Updates

### Functional Consultant Agent (AGT-003) — Now ACTIVE

As of Prompt 07, the Functional Consultant Agent is connected to the Anthropic Claude API and is ACTIVE for the following capabilities:

| Capability | Skill | Implementation File | Status |
|---|---|---|---|
| Generate fit-gap analysis against NetSuite capabilities | generate-fit-gap | `backend/src/lib/skills/generate-fit-gap.ts` | ACTIVE |
| Generate UAT scenarios with navigable test steps | generate-uat | `backend/src/lib/skills/generate-uat.ts` | ACTIVE |
| Generate SOPs with NetSuite screen-referenced steps | generate-sop | `backend/src/lib/skills/generate-sop.ts` | ACTIVE |

**Functional Delivery Data Layer:**
- `FunctionalWorkstream` — workstream management with WorkstreamStatus lifecycle
- `BusinessProcess` — business processes per workstream with ProcessCategory classification
- `ProcessStep` — ordered steps per process
- `FitGapAnalysis` — per-process fit-gap with 7-category FitCategory enum
- `UatScenario` — UAT scenarios with UatScenarioStatus and UatCategory
- `SopDocument` — SOPs with auto-incrementing version on content change (SopStatus lifecycle)
- `FunctionalDeliverable` — deliverable tracking with DeliverableType and FunctionalDeliverableStatus

**Fit-Gap Categories (FitCategory enum):**
`FIT_STANDARD`, `FIT_WITH_CONFIGURATION`, `FIT_WITH_WORKFLOW`, `FIT_WITH_CUSTOMIZATION`, `FIT_WITH_INTEGRATION`, `GAP`, `OUT_OF_SCOPE`

---

## Prompt 06 Updates

### Presales Agent (AGT-001) — Now ACTIVE

As of Prompt 06, the Presales Agent is connected to the Anthropic Claude API and is ACTIVE for the following capabilities:

| Capability | Skill | Implementation File | Status |
|---|---|---|---|
| Analyze requirements for NetSuite module mapping | analyze-requirements | `backend/src/lib/skills/analyze-requirements.ts` | ACTIVE |
| Classify pain points by business area and root cause | classify-pain-points | `backend/src/lib/skills/classify-pain-points.ts` | ACTIVE |
| Recommend NetSuite modules with rationale and evidence | recommend-modules | `backend/src/lib/skills/recommend-modules.ts` | ACTIVE |
| Estimate implementation scope and complexity | estimate-scope | `backend/src/lib/skills/estimate-scope.ts` | ACTIVE |
| Generate 9-section proposal drafts | generate-proposal-draft | `backend/src/lib/skills/generate-proposal-draft.ts` | ACTIVE |

**AI Engine:**
- `backend/src/lib/ai-engine.ts` — central engine wrapping `@anthropic-ai/sdk`
- Model: `claude-sonnet-4-6`
- Graceful degradation: returns HTTP 503 when `ANTHROPIC_API_KEY` is not set
- All skill calls use structured JSON prompting with embedded NetSuite domain knowledge
- All outputs are stored in DB immediately (storage-first; no ephemeral AI responses)
- All outputs are linked to `AiGeneratedOutput` for the human review workflow

**NetSuite Module Catalog:**
- `NetsuiteModuleCatalog` table seeded with 20 real NetSuite modules
- Catalog is accessible system-wide via `GET /api/netsuite-catalog`
- Skills draw on catalog data as domain context in structured prompts
# Prompt 17 Agent Status

- Backend Developer: Implemented global admin APIs and superuser audit logging.
- Frontend Developer: Implemented global admin dashboard, user management, tenant controls, and deployment oversight views.
- Database/Prisma Developer: Added `SuperuserActionLog` and `GlobalAnalyticsSnapshot`.
- Security Governance Developer: Added superuser-only enforcement through `SUPERUSER` role or `SUPERUSER_EMAILS`.
- DevOps Developer: Validated Docker environment variable support and migration path.
