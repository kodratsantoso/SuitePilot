# Skill: Discovery

## Purpose

Structure and summarize a presales discovery session into a consistent, searchable format that captures the customer's business context, pain points, process scope, technical landscape, and open questions.

## When To Use

Use this skill after a presales discovery call or workshop to transform raw notes into a structured discovery summary. Also use to generate follow-up questions for an incomplete discovery.

## Required Inputs

- Customer name and industry
- Customer size (headcount, revenue range if known)
- Attendees (customer-side roles and names; consultant names)
- Discovery session date
- Raw notes from the session (or transcript)
- Current systems in use (ERP, CRM, eCommerce, WMS, etc.)
- Business processes discussed (which areas: finance, procurement, sales, inventory, etc.)
- Any pain points or problems explicitly mentioned
- Any open questions noted during the session

## Process

1. Parse the raw notes and organize content by topic: company overview, current systems, business processes, pain points, requirements mentioned, open questions.
2. Identify any gaps — process areas mentioned but not explored; questions raised but not answered.
3. Structure output into the defined discovery summary format.
4. Generate a list of recommended follow-up questions for any gaps identified.
5. Flag any unusual requirements or red flags that should be noted by the presales consultant.

## Output Format

```markdown
# Discovery Session Summary

**Customer:** [Name]
**Industry:** [Industry]
**Session Date:** [Date]
**Attendees:** [List]
**Conducted By:** [Consultant Name]
**Status:** DRAFT — Pending Presales Lead Review

## Company Overview
[2–4 sentences: what the company does, size, key business model characteristics]

## Current Systems Landscape
| System | Type | Use | Notes |
|---|---|---|---|

## Business Processes in Scope
[Bullet list of process areas discussed with brief description of current state]

## Pain Points & Business Drivers
[Numbered list with context for each pain point]

## Requirements Captured
[Numbered list of requirements mentioned, even informally]

## Open Questions
[Numbered list of questions that need answers in the next session]

## Red Flags / Risks Noted
[Any concerns identified: complexity, scope risk, readiness issues, etc.]

## Recommended Follow-Up Questions
[Questions the AI recommends asking to fill gaps in the discovery]

## Assumptions
[What the AI assumed when interpreting unclear notes]
```

## Validation Rules

- Output must include all sections; none may be empty or omitted
- Pain points must be specific, not generic (e.g., "manual AP invoice processing taking 3 days" not just "slow processes")
- Open questions must be actionable — each must have a clear intended answerer (customer, consultant, partner)
- Assumptions section must list every inference made from ambiguous input
- Status must always be "DRAFT — Pending Presales Lead Review"

## Risk Checks

- Flag if fewer than 3 pain points are captured (likely incomplete discovery)
- Flag if no current systems are identified (may indicate customer is not ready for discovery)
- Flag if the scope mentioned is unusually broad for the timeline or budget signals provided
- Flag any mention of regulatory requirements (multi-entity consolidation, multi-currency, IFRS, tax compliance) for early architect attention

## Do Not Do

- Do not invent pain points not present in the notes
- Do not assume a module is "definitely" needed based on vague signals — use "may require" language
- Do not include pricing estimates or commercial language
- Do not omit the assumptions section

## Example Output

> A discovery summary for "Acme Manufacturing" would list their current use of QuickBooks and Excel, pain points around manual purchase order processing and lack of real-time inventory visibility, processes in scope (P2P, inventory management, basic financials), and open questions such as "What is the expected number of purchase orders per month?" and "Do they require multi-location inventory tracking?" All entries are sourced from the provided notes with assumptions clearly noted.
