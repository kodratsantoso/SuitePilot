# Skill: Risk Review

## Purpose

Assess the risk level of an AI-generated output's recommendations, configuration decisions, or guidance. High-risk outputs require escalated human review before entering the standard review queue.

## When To Use

Invoked automatically by the Governance Agent after the hallucination check for every output. Also invoked when a human reviewer manually escalates an output for risk assessment.

## Required Inputs

- The AI-generated output (full text)
- The skill type (determines which risk dimensions apply)
- The project context (customer, industry, phase)
- The hallucination check report for this output

## Process

1. Assess risk across four dimensions: Business Impact Risk, Technical Risk, Compliance Risk, Reversibility Risk.
2. Score each dimension: LOW / MEDIUM / HIGH / CRITICAL.
3. Derive the overall risk level (highest of all dimension scores).
4. Determine whether escalated review is required.

## Output Format

```markdown
# Risk Review Report

**Output ID:** [ID]
**Skill:** [Skill slug]
**Date:** [Date]

## Risk Assessment

| Dimension | Score | Rationale |
|---|---|---|
| Business Impact Risk | LOW/MED/HIGH/CRITICAL | [Why] |
| Technical Risk | LOW/MED/HIGH/CRITICAL | [Why] |
| Compliance Risk | LOW/MED/HIGH/CRITICAL | [Why] |
| Reversibility Risk | LOW/MED/HIGH/CRITICAL | [Why] |

**Overall Risk Level:** [Highest dimension score]

## Escalation Decision

**Standard Review Sufficient:** [YES / NO]
**Escalated Review Required:** [YES / NO]
**Escalation Reason:** [If escalated: specific reason]
**Required Reviewer Role:** [e.g., Engagement Manager, Senior Technical Consultant]

## Risk Narrative

[2–3 sentences explaining the overall risk profile in plain language]
```

## Validation Rules

- All four dimensions must be scored with specific rationale
- CRITICAL risk in any dimension requires immediate escalation to Engagement Manager
- Compliance Risk must be scored HIGH or CRITICAL for any output touching tax, revenue recognition, or regulatory compliance

## Risk Checks

- Automatically score Compliance Risk as HIGH for any financial management or tax-related output
- Automatically score Reversibility Risk as HIGH for any configuration advice that is difficult to undo (e.g., chart of accounts changes, data migration)
- Automatically score Technical Risk as HIGH for any generated SuiteScript code

## Do Not Do

- Do not score risk without providing specific rationale
- Do not score compliance-related outputs as LOW risk

## Example Output

> Technical Risk: HIGH. The SuiteScript scaffold generated uses N/search without pagination. If the result set exceeds 4,000 records, the script will fail at runtime. This is a common and serious error. Escalation: YES — Senior Technical Consultant must review before this code is used.
