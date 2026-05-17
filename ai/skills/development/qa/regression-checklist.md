# Skill: Regression Checklist

## Purpose

Generate and maintain a regression checklist for each phase of the AI NetSuite Implementation OS — a structured list of critical behaviors that must be verified before a new phase or release is deployed, to ensure existing functionality has not broken.

## When To Use

Use at the end of each phase before deployment, and after any significant refactor or dependency upgrade.

## Required Inputs

- Features implemented in all previous phases
- Current test coverage report
- Any known fragile areas or previous regression incidents

## Process

1. List all previously working features that could have been affected by recent changes.
2. Categorize by risk level (HIGH = broken would block users completely, MEDIUM = degraded experience, LOW = minor issue).
3. For each item, note whether automated tests cover it or if manual verification is required.
4. Execute the checklist and record results.

## Output Format

```markdown
# Regression Checklist — Phase [N] Release

**Date:** [Date]
**Executed By:** [Name]
**Environment:** [Staging / Production]

## Authentication
- [ ] (HIGH) Login with valid credentials succeeds and returns JWT
- [ ] (HIGH) Login with wrong password returns 401
- [ ] (HIGH) Access protected endpoint without token returns 401
- [ ] (MEDIUM) Password reset flow sends email

## Project Portfolio
- [ ] (HIGH) /projects page loads and shows project list
- [ ] (HIGH) Creating a project works and redirects to workspace
- [ ] (MEDIUM) Project filters work (status, health, type)
- [ ] (MEDIUM) Search by project name works

## Project Workspace
- [ ] (HIGH) Navigating to /projects/:id/overview shows project details
- [ ] (HIGH) All workspace navigation links work
- [ ] (MEDIUM) "Back to All Projects" link works

## Tasks
- [ ] (HIGH) Task list loads for a project
- [ ] (HIGH) Create task works
- [ ] (MEDIUM) Edit task works
- [ ] (MEDIUM) Delete task shows confirmation and removes task

## Audit Log
- [ ] (HIGH) Creating a project generates an audit log entry
- [ ] (HIGH) Audit log is readable by authorized users

## Results
| Item | Result | Notes |
|---|---|---|
```

## Validation Rules

- All HIGH items must pass before deployment
- Any MEDIUM item that fails must have a documented decision (defer or fix)
- Checklist must be executed fresh in the staging environment, not skipped because "we tested locally"

## Risk Checks

- Flag if authentication regression tests are missing
- Flag if multi-tenant isolation is not on the regression checklist

## Do Not Do

- Do not skip the regression checklist because "nothing changed in that area"
- Do not auto-pass items without actually testing them

## Example Output

> Phase 1 regression checklist executed on staging: 12/12 HIGH items pass, 8/10 MEDIUM items pass (2 deferred: search debouncing and password reset email). Deployment approved.
