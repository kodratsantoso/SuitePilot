# Skill: Qualification

## Purpose

Assess a sales opportunity against a structured qualification framework to determine whether the customer is a good fit for a NetSuite implementation and to surface any disqualifying factors or significant risks early in the sales process.

## When To Use

Use after the initial discovery session(s) when enough information is available to make a structured qualification judgment. Use again if material new information emerges that changes the qualification picture.

## Required Inputs

- Discovery session summary (or equivalent structured input)
- Customer industry and size
- Customer's stated timeline for go-live
- Customer's implementation budget range (even approximate)
- Customer's current systems and data quality situation
- Decision-makers identified and their engagement level
- Any known competing factors (other vendors, internal IT projects, business disruptions)

## Process

1. Score the opportunity across six qualification dimensions (see Output Format).
2. For each dimension, provide a score (1–5) and a one-line rationale based on the evidence.
3. Compute an overall qualification score (average of six dimensions).
4. Based on the score, assign a qualification tier: STRONG FIT / QUALIFIED / CAUTION / DISQUALIFIED.
5. List the top 3 risks from a delivery perspective.
6. List recommended next actions for the presales team.

## Output Format

```markdown
# Opportunity Qualification Assessment

**Customer:** [Name]
**Date:** [Date]
**Assessed By:** AI Presales Agent
**Status:** DRAFT — Pending Presales Lead Review

## Qualification Scores

| Dimension | Score (1–5) | Rationale |
|---|---|---|
| Business Need Clarity | | |
| Budget Alignment | | |
| Timeline Realism | | |
| Decision-Maker Access | | |
| Technical Readiness | | |
| Organizational Change Readiness | | |

**Overall Score:** [Average] / 5
**Qualification Tier:** [STRONG FIT / QUALIFIED / CAUTION / DISQUALIFIED]

## Score Interpretation
- 4.0–5.0: STRONG FIT — pursue actively
- 3.0–3.9: QUALIFIED — proceed with defined conditions
- 2.0–2.9: CAUTION — significant risks; escalate to Engagement Manager before proceeding
- Below 2.0: DISQUALIFIED — do not proceed without senior management review

## Top Delivery Risks
1. [Risk description]
2. [Risk description]
3. [Risk description]

## Recommended Next Actions
[Numbered list for presales team]

## Assumptions
[List of assumptions made where input data was missing or ambiguous]
```

## Validation Rules

- All six dimensions must be scored with rationale
- Rationale must reference specific evidence from the input, not generic statements
- A DISQUALIFIED recommendation must be escalated before the presales team proceeds
- Assumptions section is mandatory

## Risk Checks

- Flag if timeline is under 3 months for a multi-module implementation
- Flag if no identified executive sponsor is present
- Flag if customer has not done any data cleanup or is relying on migrating all historical data
- Flag if the customer has a competing internal IT project running concurrently
- Flag if the budget range does not align with the stated scope

## Do Not Do

- Do not score dimensions as 5 without specific strong evidence
- Do not recommend proceeding with a DISQUALIFIED opportunity
- Do not include budget numbers unless the customer has explicitly stated them
- Do not guarantee successful implementation even for STRONG FIT assessments

## Example Output

> Acme Manufacturing would score 3.8 overall: strong business need (4) and executive sponsor identified (4), but timeline of 4 months for a 3-module implementation is aggressive (2), and their data is described as "a bit messy" (3). Qualification tier: CAUTION. Recommended action: discuss timeline with customer to confirm flexibility; request sample data extract for data quality assessment before proceeding.
