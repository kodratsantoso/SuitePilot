# Skill: Project Plan

## Purpose

Generate an initial project plan structure for a NetSuite implementation based on the implementation strategy, scope, go-live date, and team roster. The plan provides phases, milestones, key tasks, owners, and durations in a structured format suitable for review by the PM and Engagement Manager.

## When To Use

Use after the implementation strategy has been reviewed and approved. The project plan is a living document — use this skill to generate the initial draft; the PM maintains and updates it throughout delivery.

## Required Inputs

- Implementation strategy document (phases, sequencing)
- Project scope (modules, process areas, integrations)
- Target go-live date
- Team roster (PM, consultants, client team members and their roles)
- Customer availability constraints (blackout periods, business peak seasons)
- Client involvement expectations (workshops, reviews, decisions)
- Any fixed milestones (contract dates, regulatory deadlines)

## Process

1. Structure the plan by phase from the implementation strategy.
2. Within each phase, list key tasks by workstream (functional, technical, PMO, client).
3. Assign owners and estimate durations for each task.
4. Place milestones at key decision and delivery points.
5. Flag the critical path.
6. Identify resource loading conflicts if team roster is provided.

## Output Format

```markdown
# Project Plan

**Project:** [Name]
**Customer:** [Name]
**Target Go-Live:** [Date]
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending PM and Engagement Manager Review

> Durations are estimates. All dates must be confirmed by the PM.
> This plan is a starting point, not a committed schedule.

## Milestone Summary

| Milestone | Target Date | Owner | Status |
|---|---|---|---|
| Kickoff | [Date] | PM | Planned |
| Discovery Complete | [Date] | Presales / Functional Lead | Planned |
| BRD Approved | [Date] | Functional Lead | Planned |
| Fit-Gap Complete | [Date] | Solution Architect | Planned |
| Solution Blueprint Approved | [Date] | Solution Architect | Planned |
| Configuration Complete | [Date] | Functional Lead | Planned |
| UAT Start | [Date] | PM | Planned |
| UAT Sign-Off | [Date] | Customer | Planned |
| Go-Live | [Date] | PM | Planned |
| Hypercare End | [Date] | PM | Planned |

## Phase Plan

### Phase 1: [Name]
**Duration:** [X weeks]
**Objective:** [What must be complete at the end of this phase]

| Task | Workstream | Owner | Duration | Dependencies |
|---|---|---|---|---|
| [Task] | [Functional/Technical/PMO/Client] | [Name or role] | [X days] | [Task IDs] |

[Repeat for each phase]

## Assumptions

[All planning assumptions: team availability, client responsiveness, no scope changes]

## Risks to Timeline

| Risk | Impact | Mitigation |
|---|---|---|
```

## Validation Rules

- Every milestone from the implementation strategy must appear in the plan
- Every task must have an owner (name or role)
- Assumptions section must address client availability and decision-making speed
- Version must be 0.1 for the initial AI draft

## Risk Checks

- Flag if UAT is allocated less than 3 weeks
- Flag if data migration tasks have no dedicated track in the plan
- Flag if the total plan duration is less than the implementation strategy indicated

## Do Not Do

- Do not commit to specific dates without PM confirmation
- Do not assign individuals to tasks that have not been confirmed as team members

## Example Output

> Task: Fit-Gap Analysis Workshop. Workstream: Functional. Owner: Senior Functional Consultant. Duration: 3 days. Dependencies: BRD approved, solution architect available. Note: requires customer SMEs to attend — PM to confirm availability.
