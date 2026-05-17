# Skill: Hallucination Check

## Purpose

Detect potentially hallucinated, fabricated, or unsupported claims in AI-generated outputs before they enter the human review queue. A hallucination in this context is any claim that cannot be supported by the provided inputs, the knowledge base, or known NetSuite facts.

## When To Use

This skill is invoked automatically by the Governance Agent for every AI-generated output before it moves to UNDER_REVIEW status. It may also be invoked manually by a reviewer who suspects an output contains inaccurate content.

## Required Inputs

- The full text of the AI-generated output
- The original inputs provided to the generating agent and skill
- The skill slug (to know what type of output to check)
- Knowledge base context used (if RAG was applied)

## Process

1. Compare claims in the output against the provided inputs — flag any claim that goes beyond what the inputs support.
2. Identify NetSuite-specific claims and check them against the knowledge base.
3. Flag claims that assert specific NetSuite feature behavior without stating version assumptions.
4. Flag fabricated data (invented names, numbers, dates, IDs not present in inputs).
5. Flag claims in restricted domains (tax, compliance, accounting, licensing) that assert authority.
6. Produce a hallucination report with specific flagged passages and severity.

## Output Format

```markdown
# Hallucination Check Report

**Output ID:** [ID]
**Skill:** [Skill slug]
**Date:** [Date]
**Status:** [PASSED / FAILED / PASSED WITH WARNINGS]

## Summary

[1–2 sentences on overall hallucination risk assessment]

## Flagged Items

| # | Location in Output | Flagged Text | Flag Type | Severity | Recommendation |
|---|---|---|---|---|---|
| 1 | [Section name / line] | "[Flagged text excerpt]" | [UNSUPPORTED_CLAIM / FABRICATED_DATA / AUTHORITY_CLAIM / VERSION_ASSUMPTION / UNKNOWN_FEATURE] | HIGH/MED/LOW | [Recommended action] |

## Flag Types

- **UNSUPPORTED_CLAIM**: Claim not supported by provided inputs or knowledge base
- **FABRICATED_DATA**: Data (names, IDs, numbers, dates) not present in inputs
- **AUTHORITY_CLAIM**: AI claims authority on tax, compliance, accounting, or licensing
- **VERSION_ASSUMPTION**: NetSuite feature claim without version qualification
- **UNKNOWN_FEATURE**: References a NetSuite feature not found in knowledge base

## Decision

**Pass / Block:** [PASS / BLOCK]
**Reason for Block (if applicable):** [Explanation]

## Items for Human Reviewer Attention

[Specific items the human reviewer must verify even if the output is not blocked]
```

## Validation Rules

- Every flagged item must have a specific location and text excerpt — vague flags are not acceptable
- HIGH severity flags must result in a BLOCK decision
- The decision must be explicit (PASS or BLOCK), never ambiguous
- Items for human reviewer attention must be populated even for PASS decisions if warnings exist

## Risk Checks

- Automatically flag any output that claims a specific NetSuite version as the basis for advice
- Automatically flag any output that gives tax rates, accounting journal entries, or compliance conclusions without stating they require expert review
- Automatically flag any invented customer name, amount, or internal ID not present in the inputs

## Do Not Do

- Do not give false positives by flagging standard industry terminology as hallucinations
- Do not pass outputs that contain HIGH severity hallucination flags
- Do not make the hallucination check so strict that correct outputs are frequently blocked

## Example Output

> Flag #1: Location: Module Recommendation Report, "Recommended Modules" table, row for Advanced Revenue Management. Flagged text: "ARM handles ASC 606 compliance automatically." Flag type: AUTHORITY_CLAIM. Severity: HIGH. Recommendation: Block. Revenue recognition compliance is a restricted domain — the output must not claim the module automatically ensures compliance. Replace with: "ARM provides tools to support revenue recognition processes — compliance with ASC 606 must be confirmed with the customer's accounting team."
