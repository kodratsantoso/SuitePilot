# Continuous Improvement Layer

> Last updated: 2026-05-16 (Prompt 12)

## Overview

The AI Continuous Improvement Layer enables the platform to learn from historical project execution, hypercare events, and governance feedback. It provides:

- Structured feedback collection from all delivery phases
- AI-generated optimization recommendations with human review workflow
- Multi-dimensional optimization scoring (Efficiency, Accuracy, Risk Mitigation, AI Output Quality)
- Historical trend tracking for predictive insights

## Architecture

### Feedback Collection

Feedback entries are linked to `organizationId + projectId` and optionally to a `workstreamId` or `aiGeneratedOutputId`. This enables cross-module correlation.

**Feedback Types:**
- `HUMAN_REVIEW` — Reviewer feedback on AI outputs
- `GOVERNANCE_FLAG` — RAG events from governance module
- `HYPERCARE_OUTCOME` — Post-implementation issue resolutions
- `TASK_OUTCOME` — Task and milestone completion metrics
- `RISK_OBSERVED` — Newly discovered project risks
- `AI_OUTPUT_PERFORMANCE` — Quality feedback on AI-generated content

**Severity Levels:** LOW → MEDIUM → HIGH → CRITICAL

### Optimization Recommendations

Recommendations are created manually or by AI agents. They go through a lifecycle:
`DRAFT → REVIEWED → APPROVED → IMPLEMENTED` (or `REJECTED`)

Human review is required before any recommendation is marked APPROVED or IMPLEMENTED — the system enforces this via the status workflow.

**Recommendation Types:** PROCESS, AI_MODEL, WORKFLOW, RISK_MITIGATION

### Optimization Scoring

Scores are computed on-demand from live data and persisted to `OptimizationScore`:

| Metric | Calculation |
|---|---|
| **Efficiency** | `done_tasks / total_tasks × 100` |
| **Accuracy** | `passed_validations / total_validations × 100` (default 70 if none) |
| **Risk Mitigation** | `100 - (open_issues × 5 + raid_items × 3 + critical_feedback × 8)` capped at min 10 |
| **AI Output Quality** | `accuracy_score - hallucination_penalty` (hallucination rate × 100, capped at 80) |

RAG thresholds: ≥70 = GREEN, ≥40 = AMBER, <40 = RED

### Trend Analysis

`OptimizationScore` records are timestamped. The `/trends` endpoint queries historical scores by `metricType` over a configurable `timeRange` (default 30 days). This enables chart rendering in the frontend without additional computation.

## API Endpoints

All endpoints are project-scoped: `/api/projects/:projectId/continuous-improvement`

| Method | Path | Description |
|---|---|---|
| GET | `/` | Summary: KPIs, latest scores, recent feedback, top recommendations |
| GET | `/feedback` | List feedback entries (filter: feedbackType, severity) |
| POST | `/feedback` | Create feedback entry |
| GET | `/recommendations` | List recommendations (filter: recommendationType, status) |
| POST | `/recommendations` | Create recommendation |
| PATCH | `/recommendations/:id` | Update recommendation status |
| GET | `/scores` | Calculate + return current optimization scores |
| GET | `/trends` | Historical score trends |

## Audit Logging

All mutations (createFeedback, createRecommendation, updateRecommendation) write to the `AuditLog` table with: organizationId, projectId, actorUserId, entityType, entityId, action, beforeData, afterData.

## Project Isolation

Every query in `service.ts` uses `validateProjectAccess(organizationId, projectId)` before any read or write, ensuring strict multi-tenant isolation.

## Known Limitations

- Optimization scoring uses simple formula-based calculation; ML-based scoring is a future enhancement
- Trend data is sparse until scores are calculated regularly; consider a scheduled job for auto-scoring in Prompt 13+
- No cross-project aggregation — all data is strictly scoped to a single project

## Next Steps

- Schedule periodic score calculation (cron job or event-driven)
- Add AI-generated recommendation engine (correlate feedback patterns → auto-generate recommendations)
- Export feedback and recommendations as PDF or CSV for executive review
- Cross-project trend comparison in the Executive Dashboard
