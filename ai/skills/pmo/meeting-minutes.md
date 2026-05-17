# Skill: Meeting Minutes

## Purpose

Transform raw meeting notes or a transcript into structured, professional meeting minutes that capture decisions, action items, and discussion points in a format suitable for distribution to all attendees and project stakeholders.

## When To Use

Use after any project meeting (status call, design workshop, steering committee, issue resolution meeting) to produce distributable minutes within 2 hours of meeting completion.

## Required Inputs

- Meeting title and type (e.g., Weekly Status Call, AP Design Workshop, Steering Committee)
- Date and time of meeting
- Attendees list (names and roles/organizations)
- Facilitator name
- Raw notes or transcript from the meeting
- Action items noted during the meeting (with owners if captured)
- Any decisions made during the meeting

## Process

1. Extract and structure: meeting header, attendees, agenda (if present), discussion points by topic, decisions, action items.
2. Write discussion summaries concisely (2–4 sentences per topic) without editorializing.
3. Format action items with owner, due date, and status (new).
4. Flag any items that were raised but not resolved (parking lot).

## Output Format

```markdown
# Meeting Minutes

**Meeting:** [Title]
**Date:** [Date]
**Time:** [Time and timezone]
**Facilitator:** [Name]
**Minutes prepared by:** AI PMO Agent (Draft)
**Status:** DRAFT — Pending Facilitator Review Before Distribution

---

## Attendees

| Name | Organization | Role |
|---|---|---|

**Apologies / Absent:** [Names if noted]

---

## Agenda

1. [Agenda item 1]
2. [...]

---

## Discussion

### 1. [Topic]

[2–4 sentence summary of what was discussed, what was presented, and what was concluded]

### 2. [Topic]

[...]

---

## Decisions Made

| # | Decision | Decision Maker | Date |
|---|---|---|---|
| 1 | [Decision] | [Name] | [Date] |

---

## Action Items

| ID | Action | Owner | Due Date | Status |
|---|---|---|---|---|
| AI-001 | [Action description] | [Name] | [Date] | NEW |

---

## Parking Lot

[Items raised but not resolved; to be addressed in a future meeting or offline]

---

## Next Meeting

**Date:** [Date]
**Time:** [Time]
**Agenda:** [Topics for next meeting if confirmed]
```

## Validation Rules

- Every action item must have an owner and a due date — unowned actions are not acceptable
- Decisions section must be present; if no decisions were made, write "No decisions made in this meeting"
- Minutes must not attribute opinions or positions to individuals unless clearly stated as a direct quote or confirmed decision
- Status must be DRAFT until the facilitator reviews and approves

## Risk Checks

- Flag if action items have no due dates
- Flag if more than 10 action items were generated in one meeting (meeting was likely unfocused)
- Flag if no decisions were made in a design workshop meeting (may indicate workshop was inconclusive)

## Do Not Do

- Do not editorialize or add interpretations beyond what was discussed
- Do not remove parking lot items — they must be tracked
- Do not distribute minutes without facilitator review (status must be DRAFT until then)

## Example Output

> Decision 1: The customer's finance team confirmed they will use a calendar fiscal year (January to December) for the initial implementation. Multi-currency will be deferred to Phase 2. Decision maker: CFO Jane Smith. Date: 2026-05-13.
> Action AI-003: Functional consultant to update the Master Data Design Document to reflect calendar fiscal year and single-currency configuration. Owner: Functional Consultant (John Doe). Due: 2026-05-20. Status: NEW.
