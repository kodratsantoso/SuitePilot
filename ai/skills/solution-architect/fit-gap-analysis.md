# Skill: Fit-Gap Analysis

## Purpose

Analyze each confirmed business requirement against standard NetSuite functionality to determine whether it is a Fit (met by standard configuration), a Gap (not met by standard functionality), or a Partial Fit (met with workarounds or configuration effort). The output provides the solution architect and project sponsor with a clear picture of what custom development or process changes will be required.

## When To Use

Use after the BRD has been reviewed and requirements are confirmed. The fit-gap analysis is a critical input to the solution blueprint and must be completed before functional design begins.

## Required Inputs

- Confirmed requirements list (from approved or near-approved BRD)
- NetSuite modules in scope
- Customer's edition (Standard, Premium, Enterprise, OneWorld) if known
- Any constraints on customization (e.g., customer wants no SuiteScript, wants vanilla NetSuite)
- Any pre-existing NetSuite configurations or existing accounts

## Process

1. For each requirement, evaluate whether standard NetSuite configuration satisfies it fully, partially, or not at all.
2. For partial fits, describe what native functionality covers and what the gap is.
3. For gaps, identify the potential resolution path: SuiteScript customization, third-party SuiteApp, process change, or out of scope.
4. Assign an effort estimate tier to each gap: LOW / MEDIUM / HIGH.
5. Summarize the overall fit profile and highlight the highest-risk gaps.

## Output Format

```markdown
# Fit-Gap Analysis Report

**Project:** [Project Name]
**Customer:** [Name]
**Version:** 0.1 (Draft)
**Date:** [Date]
**Status:** DRAFT — Pending Solution Architect Review

> This analysis is based on standard NetSuite capabilities as understood at the time of writing.
> Feature behavior may vary by edition and release version.
> All gaps flagged as HIGH effort require Senior Technical Consultant review.

## Summary

| Category | Count |
|---|---|
| Full Fit | |
| Partial Fit | |
| Gap | |
| **Total Requirements Analyzed** | |

## Detailed Analysis

| Req ID | Requirement | Fit Status | Native Coverage | Gap Description | Resolution Path | Effort |
|---|---|---|---|---|---|---|
| FR-001 | [Requirement] | FIT / PARTIAL / GAP | [What NetSuite covers] | [What it doesn't cover] | [Config / SuiteScript / SuiteApp / Process Change / OOS] | LOW/MED/HIGH |

## High-Priority Gaps

[Narrative summary of the most significant gaps and their implications for the project]

## Assumptions

[All assumptions made in evaluating fit, especially about edition or release version]

## Recommendations for Solution Architect Review

[Specific items requiring architect decision before functional design can proceed]
```

## Validation Rules

- Every confirmed requirement must appear in the analysis — none may be skipped
- Partial Fit entries must describe both what is covered and what the gap is
- HIGH effort gaps must have an explicit recommendation for next steps
- Assumptions section must be present and specific (not generic)

## Risk Checks

- Flag if more than 30% of requirements are GAP or PARTIAL FIT (high customization risk)
- Flag if any GAP resolution path is "SuiteScript" — these must be reviewed by Technical Consultant
- Flag if any requirement touches financial close, tax calculation, or revenue recognition — requires specialist review
- Flag if the analysis was performed without a confirmed edition — edition significantly affects feature availability

## Do Not Do

- Do not mark requirements as FIT without evidence from NetSuite documentation or knowledge base
- Do not estimate development hours — use effort tiers only (LOW/MEDIUM/HIGH)
- Do not assume a third-party SuiteApp exists for a gap without verifying it is a real, available product
- Do not leave any requirement row in the analysis table empty

## Example Output

> FR-001 (Electronic invoice approval with two-level approval for invoices over $10,000): FIT. NetSuite's Approval Routing feature in Accounts Payable supports multi-level approval workflows with amount thresholds. No customization required. Assumption: Standard edition or higher is used (Basic edition does not include Approval Routing). Effort: N/A (standard config).
