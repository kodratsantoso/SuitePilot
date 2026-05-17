# Skill: Module Recommendation

## Purpose

Recommend the appropriate NetSuite modules and editions for a specific customer based on their industry, business processes, pain points, size, and implementation risk profile. Recommendations must be grounded in discovery evidence and stated clearly as recommendations, not guarantees.

## When To Use

Use after at least one discovery session has been completed and discovery has been summarized. Use to produce a module recommendation report that guides the solution architecture phase and informs commercial scoping.

## Required Inputs

- Discovery session summary
- Customer industry (e.g., manufacturing, wholesale distribution, SaaS, professional services, retail)
- Customer size (headcount and/or revenue range)
- Business processes explicitly in scope (from discovery)
- Pain points identified
- Current systems in use and known limitations
- Any modules or capabilities the customer specifically requested
- Any modules the customer has explicitly excluded
- Known regulatory or compliance requirements

## Process

1. Map each in-scope business process to the standard NetSuite module(s) that address it.
2. For each module recommendation, state: the process it addresses, the evidence from discovery that supports the recommendation, the implementation risk level, and any assumptions.
3. Identify modules that may be needed but were not explicitly discussed (based on industry patterns) — flag these as "consider" rather than "recommend."
4. Identify any standard NetSuite functionality that does NOT cover a discovered requirement — flag these as gaps for solution architect review.
5. Note any modules that the customer explicitly excluded and confirm whether the gap implications have been addressed.
6. Produce a structured recommendation report.

## Output Format

```markdown
# NetSuite Module Recommendation Report

**Customer:** [Name]
**Industry:** [Industry]
**Date:** [Date]
**Status:** DRAFT — Pending Senior Consultant Review

> This report is a draft recommendation based on discovery evidence.
> All recommendations must be validated by a qualified NetSuite consultant
> before inclusion in any commercial proposal or statement of work.

## Recommended Modules

| Module | Justification | Discovery Evidence | Risk Level | Assumption |
|---|---|---|---|---|
| [Module Name] | [Why needed] | [Specific discovery point] | LOW/MED/HIGH | [Any assumption] |

## Modules to Consider (Not Explicitly Requested but Industry-Relevant)

| Module | Rationale | Next Step |
|---|---|---|

## Identified Gaps (Requirements Not Met by Standard NetSuite)

| Requirement | Gap Description | Suggested Path |
|---|---|---|

## Excluded Modules and Implications

| Module Excluded | Implication | Confirmed with Customer? |
|---|---|---|

## Implementation Risk Summary

[2–3 sentences on the overall risk profile of the module set recommended]

## Assumptions

[All assumptions made in producing this recommendation]

## NetSuite Version Note

> This recommendation is based on NetSuite functionality as understood at the time of this report.
> Feature availability may vary by edition (Standard, Premium, Enterprise) and release version.
> Confirm specific feature availability with Oracle NetSuite or your NetSuite partner before committing.
```

## Validation Rules

- Every recommendation must have at least one discovery evidence reference
- Every HIGH risk module recommendation must have an explicit assumption and risk note
- Gaps section must not be left empty if discovery revealed any unaddressed requirements
- The NetSuite version disclaimer is mandatory
- Status must be DRAFT

## Risk Checks

- Flag if more than 8 core modules are being recommended for a first-phase implementation (scope risk)
- Flag if advanced modules (Advanced Revenue Management, OneWorld, SuitePeople) are recommended without confirming the customer understands the additional complexity and licensing cost
- Flag if the customer is in a regulated industry (financial services, healthcare, public sector) — compliance requirements need specialist review
- Flag any recommendation made with "LOW" confidence due to thin discovery evidence

## Do Not Do

- Do not recommend modules that were not at all discussed or implied in discovery
- Do not claim a module "solves" a problem — use "addresses" or "supports" language
- Do not include Oracle NetSuite list prices or licensing costs
- Do not skip the Gaps section if gaps exist
- Do not omit the version disclaimer

## Example Output

> For Acme Manufacturing (mid-market, discrete manufacturing): recommend core modules including Financial Management, Inventory Management, Order Management, and Procurement. Consider Advanced Manufacturing (WIP, work orders) based on their production management pain point. Flag gap: customer wants multi-entity consolidation but only one legal entity confirmed in discovery — clarify before recommending OneWorld. Assumption: customer operates in a single country, single currency.
