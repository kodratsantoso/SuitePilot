# Review Workflow

> Last updated: 2026-05-14 (updated Prompt 06)
> Status: **INFRASTRUCTURE IMPLEMENTED** — AiReview entity, review API endpoint, and status transitions are implemented as of Prompt 05. UI review surfaces and notification system remain planned for Phase 4.

---

## Workflow States

Every AI-generated output moves through the following lifecycle:

```
[DRAFT] → [GOVERNANCE_CHECK] → [UNDER_REVIEW] → [APPROVED] or [REJECTED] or [REVISION_REQUESTED]
                                                         ↓
                                                   [REVISED] → [UNDER_REVIEW] (loop)
                                                         ↓
                                                   [ARCHIVED]
```

---

## State Definitions

| State | Meaning |
|---|---|
| DRAFT | AI has generated the output; no human has reviewed it |
| GOVERNANCE_CHECK | Governance Agent is evaluating the output for quality and hallucinations |
| UNDER_REVIEW | Assigned to a human reviewer; awaiting decision |
| APPROVED | Reviewer has approved; output may be used in deliverables |
| REJECTED | Reviewer has rejected; output is not usable and should not be regenerated without addressing root cause |
| REVISION_REQUESTED | Reviewer has requested changes; output is returned for regeneration or manual edit |
| REVISED | Output has been updated; returns to UNDER_REVIEW |
| ARCHIVED | Output is no longer active but retained for audit purposes |

---

## Review Assignment Rules

- Outputs from the Presales Agent → assigned to Presales Lead or Engagement Manager
- Outputs from the Solution Architect Agent → assigned to Senior Solution Architect or Engagement Manager
- Outputs from the Functional Consultant Agent → assigned to Senior Functional Consultant
- Outputs from the Technical Consultant Agent → assigned to Senior Technical Consultant
- High-risk outputs (flagged by Governance Agent) → must be reviewed by Engagement Manager regardless of type

---

## Review SLA (Recommended)

| Output Type | Target Review Time |
|---|---|
| Discovery summary | 4 hours |
| Module recommendation | 24 hours |
| BRD draft | 48 hours |
| Fit-gap analysis | 48 hours |
| Technical design | 48 hours |
| UAT scripts | 24 hours |
| Meeting minutes | 2 hours |

---

## Escalation

If a review is not completed within the SLA, the system should:
1. Send a reminder notification to the reviewer
2. After 2x SLA, notify the engagement manager
3. Never allow an unreviewed output to be used in a client deliverable

---

## Audit

Every state transition is logged in the AuditLog with:
- Actor (user or system)
- Previous state
- New state
- Timestamp
- Comments (if provided)

---

## AI Output Review Workflow (Implemented Prompt 05)

This section describes the implemented review workflow for AI-generated outputs, backed by the `AiReview` entity and the `AiGeneratedOutput` status machine.

### Implemented Status Transitions

```
[DRAFT]
   │  (output owner submits for review)
   ▼
[IN_REVIEW]
   │
   ├──(reviewer decision: APPROVED)──────────► [APPROVED]
   │                                                │
   │                                     (owner publishes)
   │                                                ▼
   │                                          [PUBLISHED]
   │
   ├──(reviewer decision: REJECTED)─────────► [REJECTED]
   │
   └──(reviewer decision: REVISION_REQUESTED)─► [REVISED]
                                                    │
                                         (owner resubmits)
                                                    ▼
                                              [IN_REVIEW]  (loop)
```

### AiReview Entity

Each review action creates a new, immutable `AiReview` record:

| Field | Description |
|---|---|
| `id` | UUID (PK) |
| `outputId` | FK to AiGeneratedOutput |
| `organizationId` | FK to Organization (org isolation) |
| `reviewerId` | FK to User — the named human reviewer |
| `decision` | `APPROVED`, `REJECTED`, or `REVISION_REQUESTED` |
| `comments` | Optional free-text reviewer comments |
| `rubricScores` | Optional JSON — structured Governance Agent rubric evaluation |
| `createdAt` | Immutable timestamp of the review decision |

### Review Rules

1. Only named `User` records can be reviewers — anonymous or system reviews are not accepted.
2. `AiReview` records are immutable. If a reviewer changes their mind, a new review must be submitted (which creates a new record and advances the output status).
3. Publication gate: `PUBLISHED` status requires `AiReview.decision = APPROVED` to exist for the current output version. The API enforces this and returns 422 if attempted without an approved review.
4. The reviewer's identity is written to both `AiReview.reviewerId` and `AiGeneratedOutput.reviewedById` for rapid lookup without a join.
5. All status transitions trigger an `AuditLog` entry: actor = reviewer, action = `ai_output.status_changed`, resource = `AiGeneratedOutput`.

### API Endpoint

`POST /api/projects/:projectId/ai/generated-outputs/:outputId/reviews`

Requires: `ai:review` permission. Creates `AiReview` record and updates `AiGeneratedOutput.status` atomically in a single database transaction.

---

## Presales Output Review Workflow (Added Prompt 06)

As of Prompt 06, the Presales Agent produces 5 categories of AI output that enter the review workflow. This section defines the reviewer assignments, SLAs, and review checklist for each presales output type.

### Presales Output Types and Reviewer Assignments

| Output Type | `AiGeneratedOutput.outputType` | Assigned Reviewer | Escalation |
|---|---|---|---|
| Requirement Analysis | `REQUIREMENT_ANALYSIS` | Presales Consultant or Solution Architect | Engagement Manager if overall confidence < 60 |
| Pain Point Classification | `PAIN_POINT_CLASSIFICATION` | Presales Consultant | Engagement Manager if severity contains CRITICAL items |
| Module Recommendations | `MODULE_RECOMMENDATIONS` | Senior Presales Consultant or Solution Architect | Engagement Manager always required for MUST_HAVE modules |
| Scope Estimation | `SCOPE_ESTIMATION` | Engagement Manager | Senior Leadership if complexity is HIGHLY_COMPLEX |
| Proposal Draft | `PROPOSAL_DRAFT` | Engagement Manager + Presales Lead | Both must approve; last APPROVED AiReview triggers publish eligibility |

### Presales Review SLAs

| Output Type | Target Review Time |
|---|---|
| Requirement Analysis | 4 hours |
| Pain Point Classification | 4 hours |
| Module Recommendations | 24 hours |
| Scope Estimation | 24 hours |
| Proposal Draft | 48 hours |

### Presales Reviewer Checklist

When reviewing presales AI outputs, reviewers must verify:

**For Requirement Analysis:**
- [ ] Each requirement maps to a plausible NetSuite module (not generic)
- [ ] GAP and PARTIAL_FIT assessments are justified, not just defaulted
- [ ] Evidence cited for each mapping is traceable to actual requirement text
- [ ] Clarity and completeness scores are consistent with the requirement description
- [ ] Any requirement with clarityScore < 40 is flagged for re-discovery before proceeding

**For Pain Point Classification:**
- [ ] Business area assignment is accurate and not catch-all ("General")
- [ ] Root cause is specific and actionable
- [ ] Recommendation is specific to NetSuite capabilities (not generic ERP advice)
- [ ] CRITICAL severity pain points have explicit recommendations

**For Module Recommendations:**
- [ ] Every MUST_HAVE module is directly supported by requirements and pain points
- [ ] No module is recommended without at least one evidence item
- [ ] NICE_TO_HAVE modules have clear rationale and are not scope-creep risks
- [ ] Estimated effort figures are reasonable for the modules listed
- [ ] Modules not in the catalog but essential to the solution are noted in comments

**For Scope Estimation:**
- [ ] Complexity tier is appropriate for the number and type of modules recommended
- [ ] Duration and team size are internally consistent
- [ ] Budget range is consistent with the firm's standard rates for this complexity tier
- [ ] Key risks cover the most significant delivery risks for this scope
- [ ] Assumptions are stated and can be validated with the customer before proposal submission

**For Proposal Draft:**
- [ ] Executive Summary accurately reflects the customer's pain points and proposed solution
- [ ] Business Challenges section is customer-specific (not boilerplate)
- [ ] Proposed Solution directly addresses the listed challenges
- [ ] Scope and Modules section matches the module recommendations
- [ ] Timeline section is consistent with scope estimation
- [ ] Investment Summary is present but contains placeholder ranges only (no binding commitments)
- [ ] Next Steps are actionable and correctly dated

### Confidence Score Thresholds for Review Decisions

| Confidence | Recommended Reviewer Action |
|---|---|
| Very High (80–100) | Standard review — approve if checklist passes |
| High (60–79) | Standard review — approve if checklist passes; note any concerns |
| Medium (40–59) | Heightened review — additional verification required; consider requesting more discovery before approval |
| Low (0–39) | Do not approve — return as REVISION_REQUESTED with instruction to gather more inputs before re-running the skill |

### Prohibited Actions on Presales Outputs

- Do not approve a Proposal Draft if the Scope Estimation has not also been approved.
- Do not publish a Module Recommendations output if Requirement Analysis is still in DRAFT.
- Do not submit a Proposal Draft to a client before all 5 output types for the project have reached APPROVED or PUBLISHED status.
- Do not override the confidence score when submitting an AiReview — record concerns in `comments` instead.
