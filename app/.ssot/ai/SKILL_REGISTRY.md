# AI Skill Registry

> Last updated: 2026-05-14 (updated Prompt 06)
> This is the authoritative list of all AI skills. Do not implement a skill without registering it here.

---

## Presales Agent Skills (AGT-001)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-P01 | Discovery | `presales/discovery` | `ai/skills/presales/discovery.md` | DEFINED |
| SKL-P02 | Qualification | `presales/qualification` | `ai/skills/presales/qualification.md` | DEFINED |
| SKL-P03 | Proposal Generation | `presales/proposal-generation` | `ai/skills/presales/proposal-generation.md` | DEFINED |
| SKL-P04 | Module Recommendation | `presales/module-recommendation` | `ai/skills/presales/module-recommendation.md` | DEFINED |
| SKL-P05 | BRD Generation | `presales/brd-generation` | `ai/skills/presales/brd-generation.md` | DEFINED |

### Presales Intelligence Skills (Implemented — Prompt 06)

These 5 skills are fully implemented as TypeScript skill files wired to the Anthropic Claude API. They supersede / fulfill the intent of the above DEFINED skills for the presales intelligence workflow.

| Skill ID | Name | Implementation File | Input | Output | Status |
|---|---|---|---|---|---|
| SKL-PI01 | Analyze Requirements | `backend/src/lib/skills/analyze-requirements.ts` | Requirement[] | RequirementAnalysis[] + AiGeneratedOutput | **ACTIVE** |
| SKL-PI02 | Classify Pain Points | `backend/src/lib/skills/classify-pain-points.ts` | PainPoint[] | PainPointClassification[] + AiGeneratedOutput | **ACTIVE** |
| SKL-PI03 | Recommend Modules | `backend/src/lib/skills/recommend-modules.ts` | Requirements + PainPoints + Catalog | ModuleRecommendationAnalysis[] + AiGeneratedOutput | **ACTIVE** |
| SKL-PI04 | Estimate Scope | `backend/src/lib/skills/estimate-scope.ts` | Requirements + PainPoints + Modules | ScopeEstimation + AiGeneratedOutput | **ACTIVE** |
| SKL-PI05 | Generate Proposal Draft | `backend/src/lib/skills/generate-proposal-draft.ts` | All presales analyses | ProposalDraftSection[9] + AiGeneratedOutput | **ACTIVE** |

#### SKL-PI01 — Analyze Requirements

**Purpose:** Maps each requirement to the most appropriate NetSuite module, assesses clarity and completeness, and identifies gaps.

**Input schema:**
```typescript
{
  requirements: Array<{
    id: string
    title: string
    description: string
    category: string
    priority: string
  }>
  projectContext: {
    industry: string?
    customerSize: string?
  }
}
```

**Output schema:**
```typescript
{
  analyses: Array<{
    requirementId: string
    netsuiteModule: string
    fitAssessment: "FIT" | "GAP" | "PARTIAL_FIT"
    clarityScore: number       // 0–100
    completenessScore: number  // 0–100
    confidenceScore: number    // 0–100
    confidenceLabel: string    // Low | Medium | High | Very High
    evidence: Array<{ type: string; text: string; sourceId?: string }>
    analysisNotes: string?
  }>
}
```

**Prompt strategy:** System prompt includes NetSuite module taxonomy and examples of well-mapped vs. poorly-mapped requirements. AI is instructed to be conservative and flag ambiguous requirements as GAP rather than FIT.

---

#### SKL-PI02 — Classify Pain Points

**Purpose:** Categorizes each pain point by business area, identifies root cause, and provides a NetSuite-specific recommendation.

**Input schema:**
```typescript
{
  painPoints: Array<{
    id: string
    title: string
    description: string
    severity: string
    category: string?
  }>
}
```

**Output schema:**
```typescript
{
  classifications: Array<{
    painPointId: string
    businessArea: string
    rootCause: string
    recommendation: string
    confidenceScore: number
    confidenceLabel: string
  }>
}
```

**Prompt strategy:** System prompt includes a taxonomy of NetSuite-addressable business areas (Finance, Supply Chain, CRM, HR, Reporting, Integrations). AI is instructed to provide actionable, specific recommendations, not generic advice.

---

#### SKL-PI03 — Recommend Modules

**Purpose:** Recommends specific NetSuite modules with priority, rationale, and evidence tied to project requirements and pain points.

**Input schema:**
```typescript
{
  requirements: Requirement[]
  painPoints: PainPoint[]
  moduleCatalog: NetsuiteModuleCatalog[]   // injected from DB
  includeNiceToHave: boolean
}
```

**Output schema:**
```typescript
{
  recommendations: Array<{
    moduleName: string
    priority: "MUST_HAVE" | "SHOULD_HAVE" | "NICE_TO_HAVE"
    rationale: string
    evidence: Array<{ type: string; text: string; sourceId?: string }>
    estimatedEffort: string?
    confidenceScore: number
    confidenceLabel: string
  }>
}
```

**Prompt strategy:** Module catalog is injected into the system prompt as a structured list. AI is instructed to justify every recommendation with evidence from the project inputs, and to reject modules with no supporting evidence.

---

#### SKL-PI04 — Estimate Scope

**Purpose:** Produces a high-level implementation scope estimate including complexity, duration, team size, budget range, risks, and assumptions.

**Input schema:**
```typescript
{
  requirements: Requirement[]
  painPoints: PainPoint[]
  recommendedModules: ModuleRecommendationAnalysis[]
  projectContext: { industry?: string; customerSize?: string }
}
```

**Output schema:**
```typescript
{
  complexity: "SIMPLE" | "MODERATE" | "COMPLEX" | "HIGHLY_COMPLEX"
  estimatedDurationWeeks: number
  estimatedTeamSize: number
  estimatedBudgetRange: string?
  keyRisks: string[]
  keyAssumptions: string[]
  confidenceScore: number
  confidenceLabel: string
}
```

**Prompt strategy:** System prompt includes reference ranges for NetSuite implementations by complexity tier. AI is instructed to list explicit assumptions and flag inputs that reduce estimation confidence.

---

#### SKL-PI05 — Generate Proposal Draft

**Purpose:** Synthesizes all presales intelligence into a 9-section structured proposal draft.

**Input schema:**
```typescript
{
  project: { name: string; customer: string; industry?: string }
  requirementAnalyses: RequirementAnalysis[]
  painPointClassifications: PainPointClassification[]
  moduleRecommendations: ModuleRecommendationAnalysis[]
  scopeEstimation: ScopeEstimation
}
```

**Output schema:**
```typescript
{
  sections: Array<{
    sectionType: ProposalSectionType
    sectionTitle: string
    content: string
    orderIndex: number
    confidenceScore: number
    confidenceLabel: string
  }>
}
// 9 sections: EXECUTIVE_SUMMARY, BUSINESS_CHALLENGES, PROPOSED_SOLUTION,
//             SCOPE_AND_MODULES, IMPLEMENTATION_APPROACH, TEAM_AND_ROLES,
//             TIMELINE, INVESTMENT_SUMMARY, NEXT_STEPS
```

**Prompt strategy:** System prompt includes proposal writing guidelines for NetSuite implementation engagements. Each section is generated with individual confidence scoring. AI is instructed to flag sections where input data is insufficient and recommend additional discovery.

---

## Solution Architect Agent Skills (AGT-002)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-SA01 | Fit-Gap Analysis | `solution-architect/fit-gap-analysis` | `ai/skills/solution-architect/fit-gap-analysis.md` | DEFINED |
| SKL-SA02 | Solution Blueprint | `solution-architect/solution-blueprint` | `ai/skills/solution-architect/solution-blueprint.md` | DEFINED |
| SKL-SA03 | Implementation Strategy | `solution-architect/implementation-strategy` | `ai/skills/solution-architect/implementation-strategy.md` | DEFINED |
| SKL-SA04 | Integration Architecture | `solution-architect/integration-architecture` | `ai/skills/solution-architect/integration-architecture.md` | DEFINED |

---

## Functional Consultant Agent Skills (AGT-003)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-FC01 | P2P Process Design | `functional-consultant/p2p-process-design` | `ai/skills/functional-consultant/p2p-process-design.md` | DEFINED |
| SKL-FC02 | O2C Process Design | `functional-consultant/o2c-process-design` | `ai/skills/functional-consultant/o2c-process-design.md` | DEFINED |
| SKL-FC03 | R2R Process Design | `functional-consultant/r2r-process-design` | `ai/skills/functional-consultant/r2r-process-design.md` | DEFINED |
| SKL-FC04 | Master Data Design | `functional-consultant/master-data-design` | `ai/skills/functional-consultant/master-data-design.md` | DEFINED |
| SKL-FC05 | UAT Generation | `functional-consultant/uat-generation` | `ai/skills/functional-consultant/uat-generation.md` | DEFINED |
| SKL-FC06 | Training Material | `functional-consultant/training-material` | `ai/skills/functional-consultant/training-material.md` | DEFINED |

---

## Technical Consultant Agent Skills (AGT-004)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-TC01 | RESTlet Design | `technical-consultant/restlet-design` | `ai/skills/technical-consultant/restlet-design.md` | DEFINED |
| SKL-TC02 | SuiteScript Helper | `technical-consultant/suitescript-helper` | `ai/skills/technical-consultant/suitescript-helper.md` | DEFINED |
| SKL-TC03 | Integration Mapping | `technical-consultant/integration-mapping` | `ai/skills/technical-consultant/integration-mapping.md` | DEFINED |
| SKL-TC04 | OAuth Troubleshooting | `technical-consultant/oauth-troubleshooting` | `ai/skills/technical-consultant/oauth-troubleshooting.md` | DEFINED |
| SKL-TC05 | Payload Validation | `technical-consultant/payload-validation` | `ai/skills/technical-consultant/payload-validation.md` | DEFINED |

---

## PMO Agent Skills (AGT-005)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-PM01 | Project Plan | `pmo/project-plan` | `ai/skills/pmo/project-plan.md` | DEFINED |
| SKL-PM02 | RAID Log | `pmo/raid-log` | `ai/skills/pmo/raid-log.md` | DEFINED |
| SKL-PM03 | Meeting Minutes | `pmo/meeting-minutes` | `ai/skills/pmo/meeting-minutes.md` | DEFINED |
| SKL-PM04 | Weekly Report | `pmo/weekly-report` | `ai/skills/pmo/weekly-report.md` | DEFINED |
| SKL-PM05 | Cutover Checklist | `pmo/cutover-checklist` | `ai/skills/pmo/cutover-checklist.md` | DEFINED |
| SKL-PM06 | Hypercare Tracker | `pmo/hypercare-tracker` | `ai/skills/pmo/hypercare-tracker.md` | DEFINED |

---

## Governance Agent Skills (AGT-006)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-GV01 | Hallucination Check | `governance/hallucination-check` | `ai/skills/governance/hallucination-check.md` | DEFINED |
| SKL-GV02 | Risk Review | `governance/risk-review` | `ai/skills/governance/risk-review.md` | DEFINED |
| SKL-GV03 | Approval Gate | `governance/approval-gate` | `ai/skills/governance/approval-gate.md` | DEFINED |
| SKL-GV04 | Audit Trail | `governance/audit-trail` | `ai/skills/governance/audit-trail.md` | DEFINED |
| SKL-GV05 | Quality Score | `governance/quality-score` | `ai/skills/governance/quality-score.md` | DEFINED |

---

## Development Agent Skills (Platform Engineering)

### Product Architect Developer Agent Skills (AGT-DEV-001)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-DA01 | Module Boundary Design | `development/product-architecture/module-boundary-design` | `ai/skills/development/product-architecture/module-boundary-design.md` | DEFINED |
| SKL-DA02 | Roadmap to Technical Plan | `development/product-architecture/roadmap-to-technical-plan` | `ai/skills/development/product-architecture/roadmap-to-technical-plan.md` | DEFINED |
| SKL-DA03 | SSOT Maintenance | `development/product-architecture/ssot-maintenance` | `ai/skills/development/product-architecture/ssot-maintenance.md` | DEFINED |

### Frontend Developer Agent Skills (AGT-DEV-002)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-FE01 | Responsive Layout | `development/frontend/responsive-layout` | `ai/skills/development/frontend/responsive-layout.md` | DEFINED |
| SKL-FE02 | Project Dashboard UI | `development/frontend/project-dashboard-ui` | `ai/skills/development/frontend/project-dashboard-ui.md` | DEFINED |
| SKL-FE03 | Workspace Navigation | `development/frontend/workspace-navigation` | `ai/skills/development/frontend/workspace-navigation.md` | DEFINED |
| SKL-FE04 | Form and Table CRUD | `development/frontend/form-and-table-crud` | `ai/skills/development/frontend/form-and-table-crud.md` | DEFINED |
| SKL-FE05 | Design System Consistency | `development/frontend/design-system-consistency` | `ai/skills/development/frontend/design-system-consistency.md` | DEFINED |

### Backend Developer Agent Skills (AGT-DEV-003)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-BE01 | API Contract Design | `development/backend/api-contract-design` | `ai/skills/development/backend/api-contract-design.md` | DEFINED |
| SKL-BE02 | Service Layer Pattern | `development/backend/service-layer-pattern` | `ai/skills/development/backend/service-layer-pattern.md` | DEFINED |
| SKL-BE03 | Validation and Error Handling | `development/backend/validation-and-error-handling` | `ai/skills/development/backend/validation-and-error-handling.md` | DEFINED |
| SKL-BE04 | Audit Log Implementation | `development/backend/audit-log-implementation` | `ai/skills/development/backend/audit-log-implementation.md` | DEFINED |

### Database/Prisma Developer Agent Skills (AGT-DEV-004)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-DB01 | Prisma Schema Design | `development/database/prisma-schema-design` | `ai/skills/development/database/prisma-schema-design.md` | DEFINED |
| SKL-DB02 | Migration Planning | `development/database/migration-planning` | `ai/skills/development/database/migration-planning.md` | DEFINED |
| SKL-DB03 | Relational Data Modeling | `development/database/relational-data-modeling` | `ai/skills/development/database/relational-data-modeling.md` | DEFINED |
| SKL-DB04 | Seed Data Strategy | `development/database/seed-data-strategy` | `ai/skills/development/database/seed-data-strategy.md` | DEFINED |

### AI Orchestration Developer Agent Skills (AGT-DEV-005)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-AO01 | Agent Registry Loader | `development/ai-orchestration/agent-registry-loader` | `ai/skills/development/ai-orchestration/agent-registry-loader.md` | DEFINED |
| SKL-AO02 | Skill Registry Loader | `development/ai-orchestration/skill-registry-loader` | `ai/skills/development/ai-orchestration/skill-registry-loader.md` | DEFINED |
| SKL-AO03 | Prompt Routing | `development/ai-orchestration/prompt-routing` | `ai/skills/development/ai-orchestration/prompt-routing.md` | DEFINED |
| SKL-AO04 | AI Output Review Workflow | `development/ai-orchestration/ai-output-review-workflow` | `ai/skills/development/ai-orchestration/ai-output-review-workflow.md` | DEFINED |

### DevOps/Deployment Developer Agent Skills (AGT-DEV-006)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-DO01 | Docker Compose Setup | `development/devops/docker-compose-setup` | `ai/skills/development/devops/docker-compose-setup.md` | DEFINED |
| SKL-DO02 | Environment Management | `development/devops/environment-management` | `ai/skills/development/devops/environment-management.md` | DEFINED |
| SKL-DO03 | Deployment Validation | `development/devops/deployment-validation` | `ai/skills/development/devops/deployment-validation.md` | DEFINED |
| SKL-DO04 | Healthcheck Design | `development/devops/healthcheck-design` | `ai/skills/development/devops/healthcheck-design.md` | DEFINED |

### QA/Test Automation Developer Agent Skills (AGT-DEV-007)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-QA01 | API Test Design | `development/qa/api-test-design` | `ai/skills/development/qa/api-test-design.md` | DEFINED |
| SKL-QA02 | E2E Test Design | `development/qa/e2e-test-design` | `ai/skills/development/qa/e2e-test-design.md` | DEFINED |
| SKL-QA03 | Regression Checklist | `development/qa/regression-checklist` | `ai/skills/development/qa/regression-checklist.md` | DEFINED |
| SKL-QA04 | Acceptance Criteria Validation | `development/qa/acceptance-criteria-validation` | `ai/skills/development/qa/acceptance-criteria-validation.md` | DEFINED |

### Security/Governance Developer Agent Skills (AGT-DEV-008)

| Skill ID | Name | Slug | File | Status |
|---|---|---|---|---|
| SKL-SE01 | RBAC Design | `development/security/rbac-design` | `ai/skills/development/security/rbac-design.md` | DEFINED |
| SKL-SE02 | Tenant Isolation | `development/security/tenant-isolation` | `ai/skills/development/security/tenant-isolation.md` | DEFINED |
| SKL-SE03 | Secret Management | `development/security/secret-management` | `ai/skills/development/security/secret-management.md` | DEFINED |
| SKL-SE04 | Audit and Compliance | `development/security/audit-and-compliance` | `ai/skills/development/security/audit-and-compliance.md` | DEFINED |

---

## Discovery Skills (Added Prompt 05)

These skills map to the AI Discovery Workspace infrastructure implemented in Prompt 05. They are pre-registered here for use when the AI provider layer is connected. Skills are attributed to the appropriate implementation agents.

| Skill ID | Name | Slug | Agent | File | Status |
|---|---|---|---|---|---|
| SKL-DX01 | Session Create | `discovery/session.create` | AGT-001 (Presales) | `ai/skills/discovery/session-create.md` | DEFINED |
| SKL-DX02 | Question Generate | `discovery/question.generate` | AGT-001 (Presales) | `ai/skills/discovery/question-generate.md` | DEFINED |
| SKL-DX03 | Requirement Extract | `discovery/requirement.extract` | AGT-003 (Functional) | `ai/skills/discovery/requirement-extract.md` | DEFINED |
| SKL-DX04 | Pain Point Identify | `discovery/painpoint.identify` | AGT-003 (Functional) | `ai/skills/discovery/painpoint-identify.md` | DEFINED |
| SKL-DX05 | Module Recommend | `discovery/module.recommend` | AGT-002 (Solution Architect) | `ai/skills/discovery/module-recommend.md` | DEFINED |

## AI Output Lifecycle Skills (Added Prompt 05)

These skills govern the creation and review of AI-generated outputs. Attribution of both agent and skill is required on every `AiConversation` and `AiGeneratedOutput` record.

| Skill ID | Name | Slug | Agent | File | Status |
|---|---|---|---|---|---|
| SKL-AO05 | Output Create | `ai/output.create` | Any agent | `ai/skills/ai-output/output-create.md` | DEFINED |
| SKL-AO06 | Output Review | `ai/output.review` | AGT-006 (Governance) | `ai/skills/ai-output/output-review.md` | DEFINED |
| SKL-AO07 | Output Publish | `ai/output.publish` | AGT-006 (Governance) | `ai/skills/ai-output/output-publish.md` | DEFINED |

---

## Skill Totals

### Implementation Skills (NetSuite Delivery)

| Role | Count |
|---|---|
| Presales | 5 |
| Solution Architect | 4 |
| Functional Consultant | 6 |
| Technical Consultant | 5 |
| PMO | 6 |
| Governance | 5 |
| **Subtotal** | **31** |

### Discovery Skills (AI Discovery Workspace — Prompt 05)

| Category | Count |
|---|---|
| Discovery | 5 |
| AI Output Lifecycle | 3 |
| **Subtotal** | **8** |

### Development Skills (Platform Engineering)

| Role | Count |
|---|---|
| Product Architecture | 3 |
| Frontend | 5 |
| Backend | 4 |
| Database | 4 |
| AI Orchestration | 4 |
| DevOps | 4 |
| QA | 4 |
| Security | 4 |
| **Subtotal** | **32** |

### Presales Intelligence Skills (Active — Prompt 06)

| Category | Count |
|---|---|
| Presales Intelligence (ACTIVE) | 5 |
| **Subtotal** | **5** |

**Grand Total: 76 skills (71 defined + 5 active presales intelligence)**
## Prompt 13 Skill Registry Update

SaaS multi-tenant implementation uses these development skills as active review references:

- `development/security/tenant-isolation.md`
- `development/security/rbac-design.md`
- `development/security/audit-and-compliance.md`
- `development/backend/api-contract-design.md`
- `development/backend/validation-and-error-handling.md`
- `development/database/prisma-schema-design.md`
- `development/frontend/form-and-table-crud.md`

Future skills for payment gateway webhook handling and automated usage metering should be added in Prompt 14+.
# Prompt 17 Skill Registry Update

Added global admin operating procedures for cross-tenant analytics, tenant lifecycle management, superuser RBAC, deployment oversight, and audit review. These workflows reference `SAAS_GLOBAL_ADMIN.md`.
## Runtime Registry

The runtime skill registry is database-backed by `AiSkill`.

Skill markdown files remain under `ai/skills/` as controlled source definitions. Runtime application configuration and visibility are served by:

- `GET /api/ai/registry`
- `POST /api/ai/registry/skills`

Only superusers can mutate runtime skill records. Generated AI outputs must record the skill name used.
