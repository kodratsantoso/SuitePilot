# Skill: Hypercare Tracker

## Purpose

Create and maintain a hypercare issue tracker for the post-go-live period. Hypercare is the structured support period immediately after go-live during which the implementation team provides elevated support and tracks all issues through to resolution before transitioning to steady-state support.

## When To Use

Use at go-live to initialize the hypercare tracker. Use daily during the hypercare period to add new issues and update status. Hypercare typically lasts 2–4 weeks depending on the project.

## Required Inputs

- Project name and code
- Go-live date
- Hypercare end date (planned)
- Hypercare team roster (who is on support)
- Any issues identified during cutover that carried over into hypercare
- Daily issue updates (if updating an existing tracker)

## Process

1. Initialize the tracker with the project header and hypercare team.
2. Add all known cutover carry-over issues.
3. Structure the issue log by severity.
4. Track each issue through: OPEN → IN PROGRESS → RESOLVED → CLOSED.
5. Generate a daily hypercare status summary.

## Output Format

```markdown
# Hypercare Tracker

**Project:** [Name / Code]
**Customer:** [Name]
**Go-Live Date:** [Date]
**Hypercare End Date (Planned):** [Date]
**Last Updated:** [Date]
**Updated By:** [Name]

---

## Hypercare Team

| Name | Role | Contact | Coverage Hours |
|---|---|---|---|

---

## Issue Log

| ID | Title | Severity | Category | Reported By | Date Raised | Owner | Status | Resolution | Date Closed |
|---|---|---|---|---|---|---|---|---|---|
| HC-001 | [Issue title] | CRITICAL/HIGH/MED/LOW | [Functional/Technical/Data/Integration] | [Name] | [Date] | [Name] | OPEN/IN PROGRESS/RESOLVED/CLOSED | [Resolution] | [Date or —] |

---

## Summary Dashboard

| Severity | Open | In Progress | Resolved | Closed | Total |
|---|---|---|---|---|---|
| CRITICAL | | | | | |
| HIGH | | | | | |
| MEDIUM | | | | | |
| LOW | | | | | |
| **Total** | | | | | |

---

## Daily Hypercare Standup Summary

### [Date]

**Overall Status:** 🟢 / 🟡 / 🔴
**Summary:** [2–3 sentence summary of hypercare health]
**CRITICAL/HIGH Issues Open:** [Count and brief description]
**Escalations:** [Any items escalated to Engagement Manager or client leadership]
**Expected to Close Today:** [Issue IDs]

---

## Hypercare Exit Criteria

- [ ] No CRITICAL issues open
- [ ] No HIGH issues open (or documented acceptance by client)
- [ ] All data integrity issues resolved
- [ ] All integrations operating stably for [X] consecutive business days
- [ ] Client confirms acceptance of hypercare exit
- [ ] Transition to steady-state support team completed

---

## Hypercare Exit Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| PM | | | |
| Client Sponsor | | | |
| Engagement Manager | | | |
```

## Validation Rules

- Every CRITICAL issue must have an owner and an active resolution plan within 4 hours of being raised
- Severity must be assigned based on business impact: CRITICAL = business cannot operate; HIGH = major process blocked; MEDIUM = workaround available; LOW = minor inconvenience
- Exit criteria must all be met before hypercare is closed

## Risk Checks

- Flag if a CRITICAL issue has been OPEN for more than 24 hours without escalation
- Flag if total open issues (CRITICAL + HIGH) exceeds 5 one week after go-live
- Flag if any integration is in a failed state for more than 1 business day

## Do Not Do

- Do not close hypercare before all CRITICAL and HIGH issues are resolved
- Do not mark an issue as RESOLVED without confirming the fix with the user who reported it

## Example Output

> HC-003: Vendor Bill approval workflow not triggering for bills under $1,000. Severity: HIGH (AP team cannot process low-value invoices without manual override). Category: Functional. Owner: Functional Consultant. Status: IN PROGRESS. Resolution: Approval routing configuration missing the sub-$1,000 rule. Fix applied to sandbox — testing in production tonight. Expected close: 2026-05-14.
