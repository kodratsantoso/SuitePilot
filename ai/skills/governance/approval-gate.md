# Skill: Approval Gate

## Purpose

Determine whether an AI-generated output meets the minimum quality threshold to enter the human review queue, and route it to the correct reviewer based on output type and risk level. This is the final AI-level gate before human review begins.

## When To Use

Invoked automatically by the Governance Agent after hallucination check and risk review are complete for every output. Never bypassed.

## Required Inputs

- The hallucination check report
- The risk review report
- The quality scores from the quality score skill (if already run)
- The skill type and agent type
- The quality threshold for this skill type (from EVALUATION.md)

## Process

1. Check hallucination check result: if BLOCK, output does not pass the gate.
2. Check risk level: if CRITICAL, output requires Engagement Manager review regardless of other factors.
3. Check quality score against the minimum threshold for this skill type.
4. If all checks pass, determine the appropriate reviewer role.
5. Emit the gate decision and reviewer assignment.

## Output Format

```markdown
# Approval Gate Decision

**Output ID:** [ID]
**Skill:** [Skill slug]
**Date:** [Date]

## Gate Checks

| Check | Result | Detail |
|---|---|---|
| Hallucination Check | PASS / BLOCK | [Summary] |
| Risk Level | LOW / MED / HIGH / CRITICAL | [Summary] |
| Quality Score | [Score] / 5.0 (Threshold: [X]) | PASS / FAIL |

## Gate Decision

**Decision:** PASS TO REVIEW / HOLD (requires generating user action) / ESCALATE

**Assigned Reviewer Role:** [Role]
**Escalation Level:** [Standard / Senior / Engagement Manager]

**Reason (if HOLD or ESCALATE):** [Specific reason]

## Next Action Required

[What must happen next: who does what]
```

## Validation Rules

- A BLOCK on hallucination check always results in a HOLD decision — no exceptions
- A CRITICAL risk level always routes to Engagement Manager review
- A quality score below threshold results in a HOLD with specific feedback on which dimensions failed

## Do Not Do

- Do not allow any output to bypass the gate
- Do not approve outputs — that is the human reviewer's role
- Do not pass an output with a BLOCK hallucination flag under any circumstances

## Example Output

> Gate Decision: HOLD. Reason: Hallucination check flagged an AUTHORITY_CLAIM (HIGH severity) in the module recommendation for Advanced Revenue Management. The output must be revised to remove the compliance authority claim before re-entering the gate. Next action: generating user to revise the input or request a regeneration with corrected guidance.
