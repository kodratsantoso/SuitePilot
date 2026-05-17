# Data Model

> Last updated: 2026-05-16 (updated Prompt 12)
> Status: **IMPLEMENTED** — Prisma schema at `app/prisma/schema.prisma`. 60 models. Client generated.

> **Prompt 02 Update:** Added Project Management entities (ProjectTask, ProjectMilestone, RaidItem, Workstream, ProjectActivity). Updated Project entity with status/health/type enums and project management fields. Every project-related entity is scoped to `projectId` for workspace-level separation.

> **Prompt 05 Update:** Added 12 new AI Discovery Workspace entities: DiscoverySession, DiscoveryQuestion, DiscoveryAnswer, Requirement (expanded), PainPoint, Assumption (expanded), DiscoveryRisk, RecommendedModule, AiConversation (expanded), AiMessage, AiGeneratedOutput (expanded), AiReview (expanded). All new entities are scoped to `organizationId` and `projectId`.

> **Prompt 06 Update:** Added 7 new AI Presales Intelligence entities: RequirementCategory, RequirementAnalysis, PainPointClassification, NetsuiteModuleCatalog, ModuleRecommendationAnalysis, ScopeEstimation, ProposalDraftSection. Added 2 new enums: EstimatedComplexity, ProposalSectionType.

This document defines the planned data entities. All entities will be implemented using Prisma ORM against PostgreSQL.

---

## Core Principles

- Every entity belongs to an `Organization` (multi-tenancy)
- Every write operation creates an `AuditLog` entry
- Soft-delete (`deletedAt`) preferred over hard-delete for entities with audit significance
- AI-generated content is always stored as a separate `AiGeneratedOutput` entity with lifecycle status
- Timestamps: `createdAt`, `updatedAt` on all entities

---

## Entities

### User
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
email           String (unique per org)
hashedPassword  String
firstName       String
lastName        String
avatarUrl       String?
isActive        Boolean
lastLoginAt     DateTime?
createdAt       DateTime
updatedAt       DateTime
deletedAt       DateTime?
```

### Organization
```
id          UUID (PK)
name        String
slug        String (unique)
logoUrl     String?
plan        Enum (TRIAL, STARTER, PROFESSIONAL, ENTERPRISE)
isActive    Boolean
createdAt   DateTime
updatedAt   DateTime
```

### Role
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
name            String
description     String
isSystem        Boolean  // system roles cannot be deleted
createdAt       DateTime
updatedAt       DateTime
```

### Permission
```
id          UUID (PK)
roleId      UUID (FK → Role)
resource    String   // e.g. "project", "discovery_session"
action      String   // e.g. "read", "write", "approve", "delete"
createdAt   DateTime
```

### Customer
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
name            String
industry        String?
size            Enum (SMB, MID_MARKET, ENTERPRISE)?
country         String?
notes           String?
status          Enum (PROSPECT, ACTIVE, CHURNED)
createdAt       DateTime
updatedAt       DateTime
deletedAt       DateTime?
```

### Project
```
id                  UUID (PK)
organizationId      UUID (FK → Organization)
customerId          UUID (FK → Customer)
name                String
code                String       // short project code, e.g. "AME-001"
type                Enum (NEW_IMPLEMENTATION, OPTIMIZATION, INTEGRATION, SUPPORT, UPGRADE, ASSESSMENT)
phase               Enum (PRESALES, DISCOVERY, DESIGN, BUILD, UAT, CUTOVER, HYPERCARE, CLOSED)
status              Enum (DRAFT, PLANNED, ACTIVE, ON_HOLD, AT_RISK, DELAYED, COMPLETED, CANCELLED)
health              Enum (GREEN, AMBER, RED, UNKNOWN)
startDate           Date?
targetGoLiveDate    Date?
progressPercent     Int          // 0–100
description         String?
projectManagerId    UUID? (FK → User)
functionalLeadId    UUID? (FK → User)
technicalLeadId     UUID? (FK → User)
createdById         UUID (FK → User)
createdAt           DateTime
updatedAt           DateTime
deletedAt           DateTime?
```

### ProjectMember
```
id          UUID (PK)
projectId   UUID (FK → Project)
userId      UUID (FK → User)
roleId      UUID (FK → Role)
joinedAt    DateTime
leftAt      DateTime?
```

### ProjectTask
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
workstreamId    UUID? (FK → Workstream)
title           String
description     String?
status          Enum (BACKLOG, TODO, IN_PROGRESS, BLOCKED, IN_REVIEW, DONE, CANCELLED)
priority        Enum (LOW, MEDIUM, HIGH, CRITICAL)
ownerId         UUID? (FK → User)
startDate       Date?
dueDate         Date?
completedDate   Date?
dependsOnId     UUID? (FK → ProjectTask, self-reference)
tags            String[]
relatedDeliverable String?
createdById     UUID (FK → User)
updatedById     UUID? (FK → User)
createdAt       DateTime
updatedAt       DateTime
deletedAt       DateTime?
```

### ProjectMilestone
```
id                  UUID (PK)
organizationId      UUID (FK → Organization)
projectId           UUID (FK → Project)
name                String
description         String?
phase               String?
targetDate          Date
actualDate          Date?
status              Enum (NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED, AT_RISK, CANCELLED)
ownerId             UUID? (FK → User)
completionPercent   Int           // 0–100
createdById         UUID (FK → User)
updatedById         UUID? (FK → User)
createdAt           DateTime
updatedAt           DateTime
```

### RaidItem
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
type            Enum (RISK, ASSUMPTION, ISSUE, DEPENDENCY, DECISION)
title           String
description     String
severity        Enum (LOW, MEDIUM, HIGH, CRITICAL)?
probability     Enum (LOW, MEDIUM, HIGH)?
impact          Enum (LOW, MEDIUM, HIGH)?
status          Enum (OPEN, MONITORING, MITIGATED, RESOLVED, CLOSED, ESCALATED)
ownerId         UUID? (FK → User)
mitigationPlan  String?
dueDate         Date?
decisionRequired Boolean
resolution      String?
createdById     UUID (FK → User)
updatedById     UUID? (FK → User)
createdAt       DateTime
updatedAt       DateTime
```

### Workstream
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
name            String      // e.g. "Functional — Finance", "Technical — Integrations"
type            Enum (FUNCTIONAL, TECHNICAL, PMO, DATA, TESTING, CUTOVER)
leadId          UUID? (FK → User)
createdAt       DateTime
updatedAt       DateTime
```

### ProjectActivity
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
actorId         UUID (FK → User)
action          String      // e.g. "task.created", "milestone.status_changed"
resourceType    String
resourceId      UUID?
description     String      // human-readable activity description
metadata        JSON?
createdAt       DateTime    // immutable
```

### AuditLog
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
actorId         UUID? (FK → User, null for system actions)
actorType       Enum (USER, SYSTEM, AI_AGENT)
action          String     // e.g. "project.created", "document.approved"
resourceType    String     // e.g. "Project", "AiGeneratedOutput"
resourceId      UUID?
metadata        JSON?
ipAddress       String?
userAgent       String?
createdAt       DateTime   // immutable — no updatedAt
```

### AiAgent
```
id              UUID (PK)
organizationId  UUID? (FK → Organization, null = system-level)
name            String     // e.g. "Presales Agent"
slug            String     // e.g. "presales"
description     String
isActive        Boolean
createdAt       DateTime
updatedAt       DateTime
```

### AiSkill
```
id              UUID (PK)
agentId         UUID (FK → AiAgent)
name            String     // e.g. "Module Recommendation"
slug            String     // e.g. "module-recommendation"
description     String
promptTemplatePath String  // reference to prompt file
isActive        Boolean
createdAt       DateTime
updatedAt       DateTime
```

### AiConversation
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID? (FK → Project)
agentId         UUID (FK → AiAgent)
skillId         UUID? (FK → AiSkill)
initiatedById   UUID (FK → User)
model           String     // e.g. "claude-sonnet-4-6"
status          Enum (IN_PROGRESS, COMPLETED, FAILED)
inputTokens     Int?
outputTokens    Int?
createdAt       DateTime
updatedAt       DateTime
```

### AiGeneratedOutput
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
conversationId  UUID (FK → AiConversation)
projectId       UUID? (FK → Project)
outputType      String     // e.g. "BRD", "FIT_GAP", "UAT_SCRIPT"
title           String
content         Text
status          Enum (DRAFT, UNDER_REVIEW, APPROVED, REJECTED, ARCHIVED)
confidenceScore Decimal?   // 0.0–1.0 from governance agent
reviewedById    UUID? (FK → User)
reviewedAt      DateTime?
version         Int        // increment on each revision
createdAt       DateTime
updatedAt       DateTime
```

### AiReview
```
id              UUID (PK)
outputId        UUID (FK → AiGeneratedOutput)
reviewerId      UUID (FK → User)
decision        Enum (APPROVED, REJECTED, REVISION_REQUESTED)
comments        Text?
rubricScores    JSON?     // structured rubric evaluation
createdAt       DateTime
```

### DiscoverySession
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
customerId      UUID (FK → Customer)
facilitatorId   UUID (FK → User)
title           String
status          Enum (DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED)
sessionDate     DateTime?
notes           Text?
createdAt       DateTime
updatedAt       DateTime
```

### Requirement
```
id                  UUID (PK)
organizationId      UUID (FK → Organization)
projectId           UUID (FK → Project)
discoverySessionId  UUID? (FK → DiscoverySession)
category            Enum (FUNCTIONAL, TECHNICAL, INTEGRATION, REPORTING, MIGRATION)
title               String
description         Text
priority            Enum (MUST_HAVE, SHOULD_HAVE, NICE_TO_HAVE)
status              Enum (CAPTURED, ANALYSED, CONFIRMED, DEFERRED, OUT_OF_SCOPE)
netsuiteModule      String?   // e.g. "Accounts Payable"
fitStatus           Enum (FIT, GAP, PARTIAL_FIT)?
createdAt           DateTime
updatedAt           DateTime
```

### Risk
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
title           String
description     Text
category        Enum (SCOPE, TECHNICAL, RESOURCE, TIMELINE, COMPLIANCE, DATA)
probability     Enum (LOW, MEDIUM, HIGH)
impact          Enum (LOW, MEDIUM, HIGH)
status          Enum (OPEN, MITIGATED, ACCEPTED, CLOSED)
owner           UUID? (FK → User)
mitigationPlan  Text?
createdAt       DateTime
updatedAt       DateTime
```

### Assumption
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
title           String
description     Text
status          Enum (OPEN, VALIDATED, INVALIDATED)
validatedById   UUID? (FK → User)
validatedAt     DateTime?
createdAt       DateTime
updatedAt       DateTime
```

### ProjectDocument
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
title           String
documentType    String    // e.g. "BRD", "SOW", "FDD", "UAT_SCRIPT"
source          Enum (AI_GENERATED, HUMAN_AUTHORED, IMPORTED)
outputId        UUID? (FK → AiGeneratedOutput)
fileUrl         String?
status          Enum (DRAFT, IN_REVIEW, APPROVED, PUBLISHED)
version         Int
createdById     UUID (FK → User)
createdAt       DateTime
updatedAt       DateTime
```

---

## AI Discovery Workspace Entities (Added Prompt 05)

### DiscoverySession
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
customerId      UUID (FK → Customer)
facilitatorId   UUID (FK → User)
title           String
status          Enum (DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED)
sessionDate     DateTime?
notes           Text?
createdAt       DateTime
updatedAt       DateTime
```

### DiscoveryQuestion
```
id                UUID (PK)
sessionId         UUID (FK → DiscoverySession)
organizationId    UUID (FK → Organization)
projectId         UUID (FK → Project)
questionText      String
category          String?    // e.g. "Finance", "Operations", "Integration"
orderIndex        Int        // display order within session
source            Enum (AI_GENERATED, HUMAN_AUTHORED)
createdAt         DateTime
updatedAt         DateTime
```

### DiscoveryAnswer
```
id                UUID (PK)
questionId        UUID (FK → DiscoveryQuestion)
sessionId         UUID (FK → DiscoverySession)
organizationId    UUID (FK → Organization)
projectId         UUID (FK → Project)
answerText        Text
recordedById      UUID (FK → User)
createdAt         DateTime
updatedAt         DateTime
```

### Requirement (expanded from planned entity)
```
id                    UUID (PK)
organizationId        UUID (FK → Organization)
projectId             UUID (FK → Project)
discoverySessionId    UUID? (FK → DiscoverySession)
sourceAnswerId        UUID? (FK → DiscoveryAnswer)
category              Enum (FUNCTIONAL, TECHNICAL, INTEGRATION, REPORTING, MIGRATION)
title                 String
description           Text
priority              Enum (MUST_HAVE, SHOULD_HAVE, NICE_TO_HAVE)
status                Enum (CAPTURED, ANALYSED, CONFIRMED, DEFERRED, OUT_OF_SCOPE)
netsuiteModule        String?
fitStatus             Enum (FIT, GAP, PARTIAL_FIT)?
extractedByAgentId    UUID? (FK → AiAgent)
createdById           UUID (FK → User)
createdAt             DateTime
updatedAt             DateTime
```

### PainPoint
```
id                UUID (PK)
organizationId    UUID (FK → Organization)
projectId         UUID (FK → Project)
sessionId         UUID? (FK → DiscoverySession)
title             String
description       Text
severity          Enum (LOW, MEDIUM, HIGH, CRITICAL)
category          String?    // e.g. "Process", "Data Quality", "Reporting"
status            Enum (OPEN, ACKNOWLEDGED, ADDRESSED)
createdById       UUID (FK → User)
createdAt         DateTime
updatedAt         DateTime
```

### Assumption (expanded from planned entity)
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
sessionId       UUID? (FK → DiscoverySession)
title           String
description     Text
status          Enum (OPEN, VALIDATED, INVALIDATED)
validatedById   UUID? (FK → User)
validatedAt     DateTime?
createdById     UUID (FK → User)
createdAt       DateTime
updatedAt       DateTime
```

### DiscoveryRisk
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
sessionId       UUID? (FK → DiscoverySession)
title           String
description     Text
category        Enum (SCOPE, TECHNICAL, RESOURCE, TIMELINE, COMPLIANCE, DATA)
probability     Enum (LOW, MEDIUM, HIGH)
impact          Enum (LOW, MEDIUM, HIGH)
status          Enum (OPEN, MITIGATED, ACCEPTED, CLOSED)
ownerId         UUID? (FK → User)
mitigationPlan  Text?
createdById     UUID (FK → User)
createdAt       DateTime
updatedAt       DateTime
```

### RecommendedModule
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
sessionId       UUID? (FK → DiscoverySession)
moduleName      String     // e.g. "Accounts Payable", "Fixed Assets"
rationale       Text
priority        Enum (MUST_HAVE, SHOULD_HAVE, NICE_TO_HAVE)
sourceAgentId   UUID? (FK → AiAgent)
outputId        UUID? (FK → AiGeneratedOutput)
createdAt       DateTime
updatedAt       DateTime
```

### AiConversation (expanded from planned entity)
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
agentId         UUID (FK → AiAgent)         // required — must attribute to an agent
skillId         UUID (FK → AiSkill)         // required — must attribute to a skill
sessionId       UUID? (FK → DiscoverySession)
initiatedById   UUID (FK → User)
title           String?
model           String     // e.g. "claude-sonnet-4-6"
status          Enum (IN_PROGRESS, COMPLETED, FAILED)
inputTokens     Int?
outputTokens    Int?
createdAt       DateTime
updatedAt       DateTime
```

### AiMessage
```
id              UUID (PK)
conversationId  UUID (FK → AiConversation)
organizationId  UUID (FK → Organization)
role            Enum (USER, ASSISTANT, SYSTEM)
content         Text
orderIndex      Int        // sequence within conversation
inputTokens     Int?
outputTokens    Int?
createdAt       DateTime   // immutable
```

### AiGeneratedOutput (expanded from planned entity)
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
conversationId  UUID (FK → AiConversation)
agentId         UUID (FK → AiAgent)         // attribution
skillId         UUID (FK → AiSkill)         // attribution
outputType      String     // e.g. "BRD", "FIT_GAP", "DISCOVERY_SUMMARY", "MODULE_RECOMMENDATION"
title           String
content         Text
status          Enum (DRAFT, IN_REVIEW, APPROVED, REJECTED, REVISED, PUBLISHED)
confidenceScore Decimal?   // 0.0–1.0 from governance evaluation
reviewedById    UUID? (FK → User)
reviewedAt      DateTime?
publishedAt     DateTime?
version         Int        // increments on each revision
createdAt       DateTime
updatedAt       DateTime
```

### AiReview (expanded from planned entity)
```
id              UUID (PK)
outputId        UUID (FK → AiGeneratedOutput)
organizationId  UUID (FK → Organization)
reviewerId      UUID (FK → User)
decision        Enum (APPROVED, REJECTED, REVISION_REQUESTED)
comments        Text?
rubricScores    JSON?      // structured rubric evaluation from governance agent
createdAt       DateTime   // immutable — reviews are not edited; new review on revision
```

---

## AI Presales Intelligence Entities (Added Prompt 06)

### RequirementCategory
```
id              UUID (PK)
organizationId  UUID (FK → Organization)
projectId       UUID (FK → Project)
name            String     // e.g. "Finance", "Supply Chain", "Reporting"
description     String?
createdAt       DateTime
updatedAt       DateTime
```

### RequirementAnalysis
```
id                    UUID (PK)
organizationId        UUID (FK → Organization)
projectId             UUID (FK → Project)
requirementId         UUID (FK → Requirement)
outputId              UUID (FK → AiGeneratedOutput)
netsuiteModule        String     // mapped NetSuite module name
fitAssessment         String     // FIT | GAP | PARTIAL_FIT
clarityScore          Int        // 0–100
completenessScore     Int        // 0–100
confidenceScore       Int        // 0–100
confidenceLabel       String     // Low | Medium | High | Very High
evidence              JSON       // array of evidence items citing source requirements/answers
analysisNotes         String?
createdAt             DateTime
updatedAt             DateTime
```

### PainPointClassification
```
id                    UUID (PK)
organizationId        UUID (FK → Organization)
projectId             UUID (FK → Project)
painPointId           UUID (FK → PainPoint)
outputId              UUID (FK → AiGeneratedOutput)
businessArea          String     // e.g. "Accounts Payable", "Order Management"
rootCause             String
recommendation        String
confidenceScore       Int        // 0–100
confidenceLabel       String
createdAt             DateTime
updatedAt             DateTime
```

### NetsuiteModuleCatalog
```
id              UUID (PK)
name            String (unique)   // e.g. "Accounts Payable"
category        String            // e.g. "Financial", "Supply Chain", "CRM"
description     String
typicalUseCases String[]
isActive        Boolean
createdAt       DateTime
updatedAt       DateTime
```
Note: Seeded with 20 real NetSuite modules at application bootstrap.

### ModuleRecommendationAnalysis
```
id                    UUID (PK)
organizationId        UUID (FK → Organization)
projectId             UUID (FK → Project)
catalogModuleId       UUID (FK → NetsuiteModuleCatalog)
outputId              UUID (FK → AiGeneratedOutput)
priority              Enum (MUST_HAVE, SHOULD_HAVE, NICE_TO_HAVE)
rationale             String
evidence              JSON       // array referencing specific requirements/pain points
estimatedEffort       String?    // e.g. "2–4 weeks"
confidenceScore       Int        // 0–100
confidenceLabel       String
createdAt             DateTime
updatedAt             DateTime
```

### ScopeEstimation
```
id                    UUID (PK)
organizationId        UUID (FK → Organization)
projectId             UUID (FK → Project)
outputId              UUID (FK → AiGeneratedOutput)
complexity            Enum (EstimatedComplexity: SIMPLE, MODERATE, COMPLEX, HIGHLY_COMPLEX)
estimatedDurationWeeks Int
estimatedTeamSize     Int
estimatedBudgetRange  String?    // e.g. "$150k–$250k"
keyRisks              String[]
keyAssumptions        String[]
confidenceScore       Int        // 0–100
confidenceLabel       String
createdAt             DateTime
updatedAt             DateTime
```

### ProposalDraftSection
```
id                UUID (PK)
organizationId    UUID (FK → Organization)
projectId         UUID (FK → Project)
outputId          UUID (FK → AiGeneratedOutput)
sectionType       Enum (ProposalSectionType)
sectionTitle      String
content           Text
orderIndex        Int
confidenceScore   Int        // 0–100
confidenceLabel   String
createdAt         DateTime
updatedAt         DateTime
```

**ProposalSectionType enum values:**
`EXECUTIVE_SUMMARY`, `BUSINESS_CHALLENGES`, `PROPOSED_SOLUTION`, `SCOPE_AND_MODULES`, `IMPLEMENTATION_APPROACH`, `TEAM_AND_ROLES`, `TIMELINE`, `INVESTMENT_SUMMARY`, `NEXT_STEPS`

**EstimatedComplexity enum values:**
`SIMPLE`, `MODERATE`, `COMPLEX`, `HIGHLY_COMPLEX`

---

## Relationships Summary

```
Organization ─── has many ─── User
Organization ─── has many ─── Customer
Organization ─── has many ─── Project
Organization ─── has many ─── AuditLog
Project ─── belongs to ─── Customer
Project ─── has many ─── ProjectMember
Project ─── has many ─── ProjectTask
Project ─── has many ─── ProjectMilestone
Project ─── has many ─── RaidItem
Project ─── has many ─── Workstream
Project ─── has many ─── ProjectActivity
Project ─── has many ─── DiscoverySession
Project ─── has many ─── Requirement
Project ─── has many ─── PainPoint
Project ─── has many ─── Assumption
Project ─── has many ─── DiscoveryRisk
Project ─── has many ─── RecommendedModule
Project ─── has many ─── AiConversation
Project ─── has many ─── AiGeneratedOutput
Project ─── has many ─── ProjectDocument
DiscoverySession ─── has many ─── DiscoveryQuestion
DiscoverySession ─── has many ─── DiscoveryAnswer
DiscoverySession ─── has many ─── Requirement
DiscoverySession ─── has many ─── PainPoint
DiscoverySession ─── has many ─── Assumption
DiscoverySession ─── has many ─── DiscoveryRisk
DiscoveryQuestion ─── has many ─── DiscoveryAnswer
AiConversation ─── belongs to ─── AiAgent
AiConversation ─── belongs to ─── AiSkill
AiConversation ─── has many ─── AiMessage
AiConversation ─── has many ─── AiGeneratedOutput
AiGeneratedOutput ─── belongs to ─── AiAgent
AiGeneratedOutput ─── belongs to ─── AiSkill
AiGeneratedOutput ─── has many ─── AiReview
RecommendedModule ─── optionally belongs to ─── AiGeneratedOutput
ProjectDocument ─── optionally belongs to ─── AiGeneratedOutput
RequirementAnalysis ─── belongs to ─── Requirement
RequirementAnalysis ─── belongs to ─── AiGeneratedOutput
PainPointClassification ─── belongs to ─── PainPoint
PainPointClassification ─── belongs to ─── AiGeneratedOutput
ModuleRecommendationAnalysis ─── belongs to ─── NetsuiteModuleCatalog
ModuleRecommendationAnalysis ─── belongs to ─── AiGeneratedOutput
ScopeEstimation ─── belongs to ─── AiGeneratedOutput
ProposalDraftSection ─── belongs to ─── AiGeneratedOutput
Project ─── has many ─── RequirementAnalysis
Project ─── has many ─── PainPointClassification
Project ─── has many ─── ModuleRecommendationAnalysis
Project ─── has many ─── ScopeEstimation
Project ─── has many ─── ProposalDraftSection
Project ─── has many ─── FeedbackEntry
Project ─── has many ─── OptimizationRecommendation
Project ─── has many ─── OptimizationScore
User    ─── has many ─── FeedbackEntry (as creator)
User    ─── has many ─── OptimizationRecommendation (as creator)
AiGeneratedOutput ─── has many ─── FeedbackEntry
```

### Prompt 12 Models

| Model | Purpose |
|---|---|
| `FeedbackEntry` | Feedback from human review, governance flags, hypercare outcomes, task outcomes, risk observations, AI output performance |
| `OptimizationRecommendation` | AI-generated or manually created recommendations with human review workflow (DRAFT→REVIEWED→APPROVED→IMPLEMENTED) |
| `OptimizationScore` | Point-in-time optimization score per metric type (EFFICIENCY, ACCURACY, RISK_MITIGATION, AI_OUTPUT_QUALITY) with RAG status |
## Prompt 13 — SaaS Multi-Tenant Models

| Model | Purpose | Isolation |
|---|---|---|
| `SubscriptionPlan` | Defines feature gates, prices, and user/project limits | System-level catalog |
| `Tenant` | SaaS tenant wrapper for one organization | Unique `organizationId` |
| `TenantUsage` | Metered usage for billing and analytics | `tenantId` |
| `BillingInvoice` | Tenant invoices and payment status | `tenantId` |
| `TenantRole` | Tenant-specific roles and permission keys | `tenantId` |
| `TenantUserRole` | Tenant role assignment to users | `tenantId + userId + roleId` |

### Isolation Constraints

- `Tenant.organizationId` is unique; each organization can have only one SaaS tenant record.
- `TenantUsage`, `BillingInvoice`, `TenantRole`, and `TenantUserRole` cascade on tenant delete.
- `TenantUserRole` uses a compound unique key to prevent duplicate assignments.
- Application service logic validates that assigned users belong to the same organization as the tenant.

### Enums

- `TenantStatus`: ACTIVE, SUSPENDED, CANCELLED, TRIAL
- `UsageMetricType`: AI_OUTPUT_COUNT, API_USAGE, STORAGE_USED, ACTIVE_USERS
- `InvoiceStatus`: PENDING, PAID, FAILED, VOID

## Prompt 14 — Deployment & DevOps Models

| Model | Purpose | Isolation |
|---|---|---|
| `DeploymentEnvironment` | development/staging/production runtime definitions | System-level |
| `DeploymentService` | service/module deployment state, replicas, image tag, health | Environment + optional `tenantId` |
| `DeploymentRun` | CI/CD action history for build/test/deploy/rollback/scale/self-heal | `organizationId` + optional `tenantId` |
| `ServiceMetric` | operational metric samples for services/environments | Environment + optional service/tenant |
| `DeploymentAlert` | alert records for health, error, and performance issues | Environment + optional service/tenant |

Tenant-aware deployment rule:

- If a deployment action includes `tenantId`, service logic must validate tenant ownership against the actor's `organizationId`.
- Dedicated tenant services are represented by `DeploymentService.tenantId`.
- Shared platform services use `tenantId = null` and must not include tenant secrets.

Enums:

- `DeploymentEnvironmentType`: DEVELOPMENT, STAGING, PRODUCTION
- `DeploymentActionType`: BUILD, TEST, DEPLOY, ROLLBACK, SCALE, SELF_HEAL
- `DeploymentRunStatus`: QUEUED, RUNNING, SUCCESS, FAILED, CANCELLED, ROLLED_BACK
- `ServiceMetricType`: CPU_USAGE, MEMORY_USAGE, LATENCY_MS, ERROR_RATE, UPTIME_SECONDS

## Prompt 15 — Security & Compliance Models

| Model | Purpose | Isolation |
|---|---|---|
| `EncryptedField` | Registry of encrypted/protected data fields | System-level |
| `AccessLog` | Security access trail for critical operations | `organizationId`, optional `tenantId`, optional `projectId` |
| `SecretStore` | Encrypted secret and credential storage | `organizationId`, optional `tenantId` |

Security constraints:

- `SecretStore.secretValue` stores ciphertext only.
- `SecretStore` has a compound unique key on `organizationId + tenantId + secretName`.
- `AccessLog` indexes actor, tenant, project, action type, result, and timestamp for audit queries.
- Tenant-scoped reads and writes must validate `Tenant.organizationId` against the authenticated user.

Enums:

- `EncryptionMethod`: AES_256_GCM, RSA, HASHED
- `SecretType`: API_KEY, DB_PASSWORD, TOKEN, WEBHOOK_SECRET, OAUTH_CLIENT_SECRET
- `RotationPolicy`: MANUAL, DAYS_30, DAYS_60, DAYS_90
- `AccessActionType`: READ, CREATE, UPDATE, DELETE, EXPORT, ROTATE_SECRET, REVOKE_SECRET, LOGIN, LOGOUT, SECURITY_CHECK
- `AccessResult`: SUCCESS, FAILURE
- `SecretStatus`: ACTIVE, ROTATED, REVOKED
# Prompt 17 Data Model

- `SuperuserActionLog`: immutable record of master actions with actor, action type, tenant/project target, description, and timestamp.
- `GlobalAnalyticsSnapshot`: typed JSON analytics snapshot for cross-tenant KPI, AI output quality, RAG distribution, and usage summaries.
- Relations were added from `User`, `Tenant`, and `Project` for auditability and drill-down.
