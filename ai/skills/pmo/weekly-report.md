# Skill: Weekly Report

## Purpose

Generate a weekly project status report that provides the Engagement Manager, project sponsor, and steering committee with a clear, concise view of project health, progress, risks, and actions required.

## When To Use

Use weekly throughout the delivery phase. The PM provides the status inputs; the AI structures them into a professional report format.

## Required Inputs

- Project name, code, and reporting week
- Overall RAG status (Red/Amber/Green) and brief rationale
- Accomplishments this week (bullet list)
- Planned activities for next week (bullet list)
- Current risks or issues requiring attention
- Actions required from the customer or steering committee
- Any changes to scope, timeline, or budget this week
- Milestone status updates

## Process

1. Structure the RAG status with a clear, factual rationale.
2. Format accomplishments and planned activities concisely.
3. Highlight risks and issues that require escalation.
4. List specific actions required from client or steering committee.

## Output Format

```markdown
# Weekly Project Status Report

**Project:** [Name / Code]
**Customer:** [Name]
**Reporting Week:** [Week ending date]
**Report Date:** [Date]
**Prepared by:** AI PMO Agent — Draft for PM Review
**Status:** DRAFT — For PM Review Before Distribution

---

## Overall Status

| Dimension | Status | Commentary |
|---|---|---|
| Schedule | 🟢 GREEN / 🟡 AMBER / 🔴 RED | [One-line rationale] |
| Scope | 🟢 / 🟡 / 🔴 | [One-line rationale] |
| Resources | 🟢 / 🟡 / 🔴 | [One-line rationale] |
| Budget | 🟢 / 🟡 / 🔴 | [One-line rationale] |
| Client Engagement | 🟢 / 🟡 / 🔴 | [One-line rationale] |

**Overall:** 🟢 / 🟡 / 🔴

---

## Accomplishments This Week

- [Accomplishment 1]
- [Accomplishment 2]

---

## Planned Activities Next Week

- [Activity 1]
- [Activity 2]

---

## Milestone Status

| Milestone | Target Date | Status | Notes |
|---|---|---|---|

---

## Risks and Issues

| ID | Description | Status | Actions |
|---|---|---|---|

---

## Actions Required (Client / Steering Committee)

| # | Action Required | Owner | Due Date |
|---|---|---|---|

---

## Key Decisions Pending

[Decisions that must be made by the client before work can proceed]

---

## Next Steps

[Two to three sentences describing the most important things happening in the next week]
```

## Validation Rules

- RAG status must have a specific rationale — not just "on track" but why
- Actions required section must not be empty if there are open client dependencies
- Milestone status must be current as of the report date

## Risk Checks

- Flag if schedule is GREEN but a milestone has slipped (contradiction)
- Flag if the report has no accomplishments listed (may indicate delivery issue)

## Do Not Do

- Do not overstate progress — RAG status must reflect reality
- Do not use jargon the client may not understand
- Do not omit client actions required even if uncomfortable to request

## Example Output

> Schedule: AMBER. Configuration workshop for Inventory module was postponed by one week due to customer SME unavailability. Recovery plan: double-length session next week; PM to confirm customer availability by EOD tomorrow. Impact: 3-day float consumed; go-live date not yet at risk.
