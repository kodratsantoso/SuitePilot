# Skill: Acceptance Criteria Validation

## Purpose

Validate that a completed feature meets its acceptance criteria before it is marked done — confirming that the implementation matches what was specified in TASKS.md and SSOT, not just that the code compiles and tests pass.

## When To Use

Use when a feature implementation is complete and ready for review. The developer self-certifies against the acceptance criteria; the reviewer independently validates.

## Required Inputs

- Feature task description from `app/.ssot/product/TASKS.md`
- Acceptance criteria for the task (if defined in the task or the API contract)
- The implemented feature (endpoint, page, component)

## Process

1. List each acceptance criterion for the feature.
2. For each criterion, describe how it was verified (automated test, manual check, or code review).
3. For any unmet criterion, document the gap and the decision (fix, defer, or out-of-scope).
4. Sign off when all criteria are met or gaps are documented.

## Output Format

```markdown
# Acceptance Criteria Validation — [Feature Name]

**Task:** [TASKS.md task ID and description]
**Date:** [Date]
**Verified By:** [Developer name]

## Criteria

| # | Criterion | Verified By | Result | Notes |
|---|---|---|---|---|
| 1 | GET /api/projects returns all projects for the authenticated org | Automated test (project.test.ts:45) | ✓ PASS | |
| 2 | Response includes status, health, progress, PM, and customer fields | Code review of service function | ✓ PASS | |
| 3 | Filtering by status works correctly | Automated test (project.test.ts:67) | ✓ PASS | |
| 4 | Projects from other orgs are not returned | Automated test (project.test.ts:89 — IDOR test) | ✓ PASS | |
| 5 | Audit log entry is created on project create | Automated test (project.test.ts:102) | ✓ PASS | |

## Gaps or Deferred Items

[None — or list of items not meeting criteria with decision]

## Sign-Off

Developer: [Name] — [Date]
Reviewer: [Name] — [Date]
```

## Validation Rules

- Every criterion must have a verification method (not "assumed to work")
- At least one acceptance criterion per feature must be an automated test
- Deferred criteria must be added to TASKS.md as new tasks, not silently dropped

## Risk Checks

- Flag if a feature is marked done without any acceptance criteria being listed
- Flag if all criteria are verified only by code review (no automated tests)

## Do Not Do

- Do not mark features as done if they meet the technical implementation but miss a usability requirement
- Do not sign off on your own work without a second reviewer

## Example Output

> Task: "Implement project task creation API". 5 criteria: all PASS. Automated tests cover: valid creation, 422 validation, 401 auth, 404 IDOR, audit log entry. Manual verification: response shape matches API contract. Sign-off: Developer (2026-05-13), Reviewer (2026-05-13).
