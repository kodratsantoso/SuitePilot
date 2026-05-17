# AI Evaluation Strategy

> Last updated: 2026-05-13
> Status: Strategy defined — implementation in Phase 10

---

## Purpose

AI agent outputs must be systematically evaluated to detect hallucinations, measure quality, track regressions, and build confidence that the platform is producing reliable outputs for high-stakes NetSuite implementations.

---

## Evaluation Dimensions

| Dimension | Description |
|---|---|
| Factual accuracy | Does the output align with known NetSuite facts? |
| Completeness | Does the output address all required elements for this skill? |
| Relevance | Is the output appropriate for the given customer context? |
| Structure compliance | Does the output follow the required output format? |
| Assumption transparency | Are assumptions clearly stated? |
| Risk disclosure | Are risks and limitations mentioned where appropriate? |
| No fabrication | Are there unsupported claims not grounded in inputs or knowledge? |

---

## Evaluation Types

### 1. Golden Answer Tests
- Pre-written expected outputs for known inputs
- Located in `ai/evaluations/golden-answers/`
- Each file is named by skill slug (e.g., `presales-module-recommendation.golden.md`)
- Evaluated by comparing AI output to golden answer on each dimension

### 2. Hallucination Tests
- Inputs designed to probe for common hallucination patterns
- Located in `ai/evaluations/hallucination-tests/`
- Examples: asking about a NetSuite module feature that doesn't exist, asking for pricing information
- Expected result: AI should correctly decline or caveat, not fabricate

### 3. Regression Tests
- Run automatically when prompts or knowledge base content changes
- Flag any outputs that differ significantly from the previous approved output
- Located in `ai/evaluations/test-cases/`

---

## Evaluation Cadence

| Trigger | Action |
|---|---|
| Prompt change | Re-run all test cases for affected skill |
| Knowledge base update | Re-run hallucination tests for affected domain |
| Model version change | Re-run full evaluation suite |
| Weekly (automated) | Run regression suite |

---

## Scoring Rubric

Each output is scored 0–5 on each dimension. Minimum passing threshold per skill type:

| Skill Category | Min Score (average across dimensions) |
|---|---|
| Presales | 3.5 |
| Solution Architecture | 4.0 |
| Functional | 4.0 |
| Technical | 4.5 |
| PMO | 3.5 |
| Governance | 4.5 |

Outputs below threshold are flagged and not allowed into the review workflow without a Governance Agent exception.
## Runtime Evaluation Storage

AI evaluation is database-backed by:

- `EvaluationCase`: skill, prompt, expected answer, and risk level.
- `AiEvaluationRun`: run status, score, findings, runner, optional AI output link.

High-risk or low-scoring outputs must remain in review until a qualified reviewer approves the related deliverable.
