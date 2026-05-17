# Skill: Cutover Checklist

## Purpose

Generate a comprehensive go-live cutover checklist tailored to the project's module scope, integration landscape, and organizational context. The cutover checklist is the operational playbook for the go-live weekend and must be reviewed and rehearsed before the actual cutover.

## When To Use

Use approximately 4–6 weeks before go-live, after UAT sign-off is expected and the cutover approach has been agreed with the customer. The checklist should be rehearsed in a mock cutover before the actual go-live.

## Required Inputs

- Module scope (which NetSuite modules are going live)
- Integration list (which integrations are going live, inbound and outbound)
- Data migration scope (which data entities are being migrated)
- Go-live date and cutover window (start and end time)
- Team roster for cutover (who is responsible for which workstream)
- Old system decommission plan (what happens to the legacy system at go-live)
- Key contacts and escalation path for cutover

## Process

1. Structure the checklist by phase: Pre-Cutover, Cutover Day 1, Cutover Day 2 (if applicable), Go-Live Day, Post-Go-Live.
2. Within each phase, group tasks by workstream (functional, technical, data, client, PMO).
3. Include rollback decision point with criteria.
4. Include a sign-off grid for each major milestone.

## Output Format

```markdown
# Cutover Checklist

**Project:** [Name]
**Go-Live Date:** [Date]
**Cutover Window:** [Start datetime] to [End datetime]
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending PM, Client, and Workstream Lead Review

> This checklist must be reviewed by all workstream leads and rehearsed
> in a mock cutover before the actual go-live.

## Cutover Team

| Role | Name | Contact | Responsibility |
|---|---|---|---|

## Rollback Criteria

> If any of the following conditions occur, the PM and Engagement Manager will assess whether to proceed or rollback:

- [ ] [Condition 1 — e.g., critical data migration failure]
- [ ] [Condition 2 — e.g., critical integration not operational by [time]]
- [ ] [Condition 3 — e.g., blocking defect discovered in production]

---

## Pre-Cutover (T-2 weeks)

| # | Task | Workstream | Owner | Due | Complete |
|---|---|---|---|---|---|
| PC-001 | Confirm cutover team and contacts | PMO | PM | [Date] | ☐ |
| PC-002 | Complete mock cutover rehearsal | All | PM | [Date] | ☐ |
| PC-003 | Freeze legacy system changes | Client | Client Lead | [Date] | ☐ |

---

## Cutover Day (T-0)

| # | Task | Workstream | Owner | Time | Complete |
|---|---|---|---|---|---|
| CO-001 | Lock legacy system for new transactions | Client | [Name] | [Time] | ☐ |
| CO-002 | Run final data extracts from legacy system | Data | [Name] | [Time] | ☐ |
| CO-003 | Execute data migration load — [Entity] | Data | [Name] | [Time] | ☐ |
| CO-004 | Validate migrated data — [Entity] | Functional | [Name] | [Time] | ☐ |
| CO-005 | Enable/disable integrations as planned | Technical | [Name] | [Time] | ☐ |
| CO-006 | Verify integration connectivity | Technical | [Name] | [Time] | ☐ |
| CO-007 | Perform smoke test — [Process] | Functional | [Name] | [Time] | ☐ |
| CO-008 | **GO/NO-GO DECISION** | All | PM + Client | [Time] | ☐ |
| CO-009 | Announce go-live to business | PMO | PM | [Time] | ☐ |

---

## Post-Go-Live (T+1 week)

| # | Task | Owner | Due | Complete |
|---|---|---|---|---|
| PG-001 | Monitor transaction volume and errors | [Name] | Daily | ☐ |
| PG-002 | Daily hypercare standup | PM | Daily | ☐ |
| PG-003 | Confirm legacy system decommission | Client | [Date] | ☐ |

---

## Sign-Off Grid

| Checkpoint | Signed Off By | Date/Time |
|---|---|---|
| Data Migration Complete | | |
| Integration Testing Complete | | |
| Smoke Test Complete | | |
| Go/No-Go Decision | | |
```

## Validation Rules

- Rollback criteria must be defined before the checklist is used in mock cutover
- GO/NO-GO decision task must be present
- Every task must have an owner
- Smoke test tasks must cover at least one transaction per in-scope process area

## Risk Checks

- Flag if the cutover window is less than 8 hours for a multi-module implementation
- Flag if no mock cutover is scheduled before go-live
- Flag if data migration validation is less than 2 hours

## Do Not Do

- Do not commit to specific times without the PM and client confirming the cutover plan
- Do not include tasks for modules that are not in the current go-live scope

## Example Output

> CO-003: Execute data migration load — Open Purchase Orders. Data workstream. Owner: Data Migration Lead. Time: 10:00 PM. Complete: ☐. Note: estimated load time 90 minutes for 2,400 records. If load is not complete by 11:30 PM, PM to assess rollback.
