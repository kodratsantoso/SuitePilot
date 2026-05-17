# Skill: RAID Log

## Purpose

Create and maintain a structured RAID (Risks, Assumptions, Issues, Dependencies) log for a NetSuite implementation project. The RAID log is a central governance artifact that the PM uses to track, manage, and communicate project health.

## When To Use

Use at project kickoff to create the initial RAID log structure and populate it from the implementation strategy, fit-gap analysis, and qualification assessment. Use throughout delivery to add new entries or update existing ones.

## Required Inputs

- For initial creation: implementation strategy, qualification assessment, fit-gap analysis (as sources of initial items)
- For updates: description of new items to add; status updates for existing items
- Project name and code
- Date of update

## Process

1. Extract risks, assumptions, issues (if any), and dependencies from provided documents.
2. Categorize each item (R/A/I/D).
3. Assign severity/priority.
4. Assign owner for each item.
5. Define mitigation or resolution steps.

## Output Format

```markdown
# RAID Log

**Project:** [Name / Code]
**Customer:** [Name]
**Last Updated:** [Date]
**Updated By:** [Name]
**Status:** DRAFT — Pending PM Review

---

## Risks

| ID | Description | Category | Probability | Impact | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|---|
| R-001 | [Risk] | [Scope/Technical/Resource/Timeline/Compliance/Data] | HIGH/MED/LOW | HIGH/MED/LOW | [Name] | [Mitigation] | OPEN |

---

## Assumptions

| ID | Description | Owner | Validated? | Validation Date | Notes |
|---|---|---|---|---|---|
| A-001 | [Assumption] | [Name] | YES/NO/PENDING | [Date or —] | |

---

## Issues

| ID | Description | Severity | Owner | Resolution | Status | Date Raised | Date Closed |
|---|---|---|---|---|---|---|---|
| I-001 | [Issue] | HIGH/MED/LOW | [Name] | [Resolution description] | OPEN/IN PROGRESS/CLOSED | [Date] | [Date or —] |

---

## Dependencies

| ID | Description | Dependent On | Owner | Due Date | Status |
|---|---|---|---|---|---|
| D-001 | [Dependency] | [Person/Team/System] | [Name] | [Date] | OPEN/MET/AT RISK |

---

## Summary

| Category | Total | Open | In Progress | Closed |
|---|---|---|---|---|
| Risks | | | | |
| Assumptions | | | | |
| Issues | | | | |
| Dependencies | | | | |
```

## Validation Rules

- Every item must have an ID, description, and owner
- Every OPEN risk must have a mitigation plan — "TBD" is not acceptable
- Assumption IDs must be cross-referenced with the solution blueprint where assumptions were first stated
- Issues with HIGH severity must have an escalation note

## Risk Checks

- Flag if any OPEN risk has no mitigation plan
- Flag if any unvalidated assumption is older than 2 weeks
- Flag if the number of OPEN issues exceeds 10 (project health concern)

## Do Not Do

- Do not create RAID entries for items that have been resolved and closed without noting the resolution
- Do not mark risks as LOW probability without justification

## Example Output

> R-003: Customer's finance team has limited availability for workshops due to ongoing year-end close. Category: Resource. Probability: HIGH. Impact: HIGH. Owner: PM. Mitigation: Schedule all financial design workshops outside of close period (avoid first 2 weeks of each month); confirm availability schedule with CFO. Status: OPEN.
