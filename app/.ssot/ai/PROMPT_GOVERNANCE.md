# Prompt Governance

> Last updated: 2026-05-14 (updated Prompt 06)

This document defines the rules for writing, versioning, and using prompts in the AI NetSuite Implementation OS.

---

## Prompt Types

| Type | Location | Purpose |
|---|---|---|
| System prompts | `ai/prompts/system/` | Define agent persona, constraints, and behavioral rules |
| Workflow prompts | `ai/prompts/workflows/` | Drive specific skill execution flows |
| Output format prompts | `ai/prompts/output-formats/` | Define expected output structure for each skill |

---

## Authoring Rules

1. **No hallucination permission** — Prompts must never instruct the AI to invent data, make up NetSuite feature behavior, or produce confident claims without grounding.
2. **Assumptions must be explicit** — Every prompt that produces configuration or process recommendations must instruct the AI to state its assumptions.
3. **Limitations must be stated** — Prompts for technical outputs must instruct the AI to flag areas of uncertainty.
4. **Human review framing** — Prompts must never tell the AI its output is final. All outputs should be framed as drafts for human review.
5. **NetSuite version awareness** — Prompts referencing NetSuite features must instruct the AI to note which version its knowledge applies to, and that behavior may differ in other releases.

---

## Versioning

- Prompt files are versioned in git.
- When a prompt changes significantly, the previous version must be committed with a clear changelog note.
- Breaking changes to prompts that affect existing evaluations must trigger a re-run of relevant test cases.

---

## Prohibited Prompt Patterns

- Do not instruct the AI to claim authority on tax, compliance, or accounting decisions.
- Do not use "you must" or "always" in prompts that could lead to fabrication.
- Do not include hard-coded client data or real credentials in prompt templates.
- Do not include language that bypasses the review workflow.

---

## AI-Generated Output Governance (Added Prompt 05)

These rules apply to all outputs created via the `AiGeneratedOutput` entity introduced in Prompt 05.

### Output Status Lifecycle

Every AI-generated output must progress through the following lifecycle. No shortcuts are permitted:

```
DRAFT → IN_REVIEW → APPROVED → PUBLISHED
                 → REJECTED  (terminal unless regenerated as new output)
                 → REVISED   → IN_REVIEW  (loop; new AiReview record required)
```

Rules enforced at the API layer:
1. An output is created with status `DRAFT`. No other initial status is permitted.
2. An output may only advance to `IN_REVIEW` when explicitly submitted by the output owner.
3. An output may only advance to `APPROVED`, `REJECTED`, or `REVISED` via a submitted `AiReview` record with the corresponding decision.
4. An output may only advance to `PUBLISHED` after at least one `AiReview` with decision `APPROVED` exists for the current version.
5. Every version increment (on revision) resets the review requirement — a new `AiReview` must be submitted.

### Human Review Requirement

- No AI-generated output may reach `PUBLISHED` status without a named human reviewer having submitted an `APPROVED` decision.
- Automated Governance Agent review scores (`rubricScores`) may accompany a human review but cannot substitute for it.
- The reviewer's user ID is recorded on both the `AiReview` record and the `AiGeneratedOutput.reviewedById` field.
- Review decisions are immutable. A new `AiReview` record must be created for each review action.

### Agent and Skill Attribution

- Every `AiConversation` must reference a valid `agentId` and `skillId`. Creation fails without both.
- Every `AiGeneratedOutput` must reference a valid `agentId` and `skillId` (inherited from or independent of its conversation).
- Attribution fields are immutable once set. If a different agent or skill is used for a revision, a new conversation and output record must be created.
- The attribution chain (user → agent → skill → conversation → output → review) is the complete audit trail for every AI action.

### Prohibited Patterns for Discovery and Output Prompts

- Do not instruct the AI to auto-approve or bypass the review gate.
- Do not generate outputs with status other than `DRAFT` as the initial value.
- Do not allow the AI to set `confidenceScore` above 0.8 without explicit governance rubric evaluation.
- Do not store AI responses outside the `AiMessage` and `AiGeneratedOutput` tables (no ephemeral/in-memory AI).

---

---

## Presales AI Skill Governance (Added Prompt 06)

These rules apply specifically to the 5 active presales intelligence skills (SKL-PI01 through SKL-PI05).

### Evidence Requirement

Every presales skill output that makes a claim (module fit, pain point classification, module recommendation) must include a populated `evidence` array. The evidence array must contain at least one item that references a specific input (requirement title, pain point description, or discovery answer text).

**Rejected output patterns:**
- "This requirement maps to Accounts Payable" — without citing which requirement text led to that conclusion.
- Module recommendation with empty `evidence` array.
- Scope estimate with no `keyAssumptions` listed.

**Enforcement:** Skill implementations validate that the AI response includes non-empty evidence before storing. If evidence is missing, the skill returns a 422 error and does not store the result.

### Confidence Score Assignment

- Every stored analysis record must have a `confidenceScore` (0–100 integer) set by the AI.
- Prompts instruct the AI to score conservatively: a score above 80 requires comprehensive, unambiguous inputs.
- The AI must set a lower score (under 60) when:
  - Input requirements are vague or lack detail
  - Fewer than 3 requirements or pain points are available
  - The project context (industry, company size) is unknown
- `confidenceLabel` is derived server-side from `confidenceScore` (not set by the AI):
  - 0–39: Low; 40–59: Medium; 60–79: High; 80–100: Very High

### Generic Output Rejection

Prompts for all 5 presales skills explicitly instruct the AI that generic NetSuite boilerplate is unacceptable. Each output must be specific to the project's requirements and pain points. Outputs that could apply to any customer without modification are considered failed outputs.

**Specific prohibitions:**
- Do not produce module recommendations that are not directly traceable to at least one requirement or pain point.
- Do not produce proposal sections that lack specific references to the project's discovery findings.
- Do not assign FIT status to a requirement that lacks sufficient detail to assess.

### All Outputs Stored and Reviewable

- Every presales skill execution writes to a skill-specific analysis table AND creates an `AiGeneratedOutput` record.
- `AiGeneratedOutput` starts in `DRAFT` status and must progress through the standard review workflow.
- Presales outputs (proposals, scope estimates, module recommendations) are assigned to Presales Lead or Engagement Manager for review.
- No presales AI output may be shared with a client before reaching `PUBLISHED` status via an approved `AiReview`.

### Prompt Injection Protection

- Module catalog data injected into prompts must be sanitized. No raw user input may be injected directly into system prompts without escaping.
- Customer names and project names in proposal prompts must be passed as variables in the user message, not embedded in the system prompt template.

---

## Prompt Review Process

New or modified system prompts must be:
1. Written by a prompt engineer or senior consultant
2. Reviewed by the Governance Agent lead
3. Tested against at least 3 evaluation cases before use in production
4. Logged in the CHANGELOG
