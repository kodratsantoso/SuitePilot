# Skill: Quality Score

## Purpose

Calculate a structured quality score for an AI-generated output across the defined evaluation dimensions. The quality score determines whether the output meets the minimum threshold for its skill type and provides the generating user with actionable feedback on how to improve it.

## When To Use

Invoked automatically by the Governance Agent for every output that passes the hallucination check. Also invoked manually when the practice lead wants to assess output quality trends.

## Required Inputs

- The full AI-generated output text
- The skill slug (determines which dimensions apply and what the threshold is)
- The required output format for this skill (from the skill definition file)
- The quality threshold for this skill type (from EVALUATION.md)

## Process

1. Evaluate the output on each applicable dimension (0–5 scale).
2. Check structural compliance (does the output follow the required format?).
3. Check completeness (are all required sections present and non-empty?).
4. Check assumption transparency (are assumptions explicitly stated?).
5. Check risk disclosure (are limitations and risks mentioned where required?).
6. Calculate the average score.
7. Compare to the skill type threshold and emit PASS / FAIL.

## Output Format

```markdown
# Quality Score Report

**Output ID:** [ID]
**Skill:** [Skill slug]
**Date:** [Date]
**Threshold:** [Minimum score for this skill type]

## Dimension Scores

| Dimension | Score (0–5) | Notes |
|---|---|---|
| Factual Accuracy | | [Brief note] |
| Completeness | | [Brief note] |
| Relevance | | [Brief note] |
| Structure Compliance | | [Brief note] |
| Assumption Transparency | | [Brief note] |
| Risk Disclosure | | [Brief note] |
| No Fabrication | | [Brief note] |

**Average Score:** [X.X] / 5.0
**Threshold:** [X.X] / 5.0
**Result:** PASS / FAIL

## Feedback for Improvement

[If FAIL: specific, actionable feedback on which dimensions failed and what to change]

## Positive Observations

[What the output did well — useful for prompt improvement tracking]
```

## Scoring Guide

| Score | Meaning |
|---|---|
| 5 | Excellent — no meaningful gaps |
| 4 | Good — minor gaps that don't affect usability |
| 3 | Adequate — some gaps that the reviewer should check |
| 2 | Below standard — significant gaps; reviewer must address before approving |
| 1 | Poor — major problems; output should be regenerated |
| 0 | Unacceptable — output fails this dimension entirely |

## Validation Rules

- All seven dimensions must be scored for every output
- A score of 0 on "No Fabrication" automatically results in a FAIL regardless of average
- Feedback for Improvement must be specific — not "improve quality" but "the Assumptions section is missing; add assumptions about currency and edition"

## Risk Checks

- Flag if more than 2 dimensions score below 3 (systemic quality issue, may indicate prompt problem)
- Flag if structure compliance is below 3 (output format not followed, reviewer will struggle)

## Do Not Do

- Do not score generously to avoid blocking outputs — accurate scoring improves the platform over time
- Do not skip the Feedback for Improvement section for failing outputs

## Example Output

> Dimension: Assumption Transparency — Score: 2. The module recommendation report makes 4 configuration recommendations but states only 1 assumption. The following should be explicitly stated as assumptions: single-currency operation, single subsidiary, Standard NetSuite edition (not Premium), and no existing NetSuite account. Feedback: add an Assumptions section listing these 4 items before resubmitting.
