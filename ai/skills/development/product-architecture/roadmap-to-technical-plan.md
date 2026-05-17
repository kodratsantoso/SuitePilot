# Skill: Roadmap to Technical Plan

## Purpose

Translate a SSOT roadmap phase into a concrete, actionable technical implementation plan that development agents can execute. The plan specifies which files to create, in which order, with which dependencies, assigning each task to the correct development agent role.

## When To Use

Use at the start of each new roadmap phase, after the SSOT has been updated with the phase scope. Do not begin implementation without a technical plan.

## Required Inputs

- Phase definition from `app/.ssot/product/ROADMAP.md`
- Current phase task list from `app/.ssot/product/TASKS.md`
- Data model additions for this phase from `app/.ssot/architecture/DATA_MODEL.md`
- API contract additions for this phase from `app/.ssot/architecture/API_CONTRACTS.md`
- Module boundary map for this phase (from `module-boundary-design` skill)

## Process

1. List all deliverables for the phase (backend, frontend, database, infra, docs).
2. Sequence them: database schema → backend services → API routes → frontend pages → tests.
3. Assign each task to the responsible development agent role.
4. Identify blocking dependencies between tasks.
5. Estimate complexity tier for each task (S/M/L/XL).
6. Identify risks specific to this phase's implementation.

## Output Format

```markdown
# Technical Implementation Plan — Phase [N]: [Name]

**Date:** [Date]
**Based on SSOT phase:** [Phase name and number]
**Status:** DRAFT — For Engineering Lead Review

## Sequenced Task List

### Stage 1 — Database Schema (Database/Prisma Developer Agent)
| # | Task | File(s) | Complexity | Blocked By |
|---|---|---|---|---|
| DB-001 | Add ProjectTask model to Prisma schema | `app/prisma/schema.prisma` | S | — |

### Stage 2 — Backend Services (Backend Developer Agent)
| # | Task | File(s) | Complexity | Blocked By |
|---|---|---|---|---|

### Stage 3 — API Routes (Backend Developer Agent)
| # | Task | File(s) | Complexity | Blocked By |
|---|---|---|---|---|

### Stage 4 — Frontend Pages (Frontend Developer Agent)
| # | Task | File(s) | Complexity | Blocked By |
|---|---|---|---|---|

### Stage 5 — Tests (QA/Test Automation Developer Agent)
| # | Task | File(s) | Complexity | Blocked By |
|---|---|---|---|---|

### Stage 6 — DevOps (DevOps Developer Agent)
| # | Task | File(s) | Complexity | Blocked By |
|---|---|---|---|---|

## Phase Risks

| Risk | Severity | Mitigation |
|---|---|---|

## Definition of Done for This Phase

[Checklist: what must be true for this phase to be considered complete]
```

## Validation Rules

- Every roadmap deliverable must map to at least one task in the plan
- Every task must have a clear owner (development agent role)
- Blocking dependencies must be explicit — no implicit ordering
- "Definition of Done" must be specific and testable

## Risk Checks

- Flag if Stage 1 (database) tasks are not completed before Stage 3 (routes) begins
- Flag if any task has no assigned agent role
- Flag if complexity is XL without breaking it down further

## Do Not Do

- Do not assign tasks to the wrong agent role (UI in backend, schema in frontend)
- Do not produce a plan that starts with frontend before database and backend are ready
- Do not leave "Definition of Done" as vague statements

## Example Output

> DB-001: Add ProjectTask model. File: `app/prisma/schema.prisma`. Complexity: S. Blocked by: nothing. Agent: Database/Prisma Developer Agent. Done when: migration runs without error; Prisma client generates correctly; all required fields per DATA_MODEL.md are present.
