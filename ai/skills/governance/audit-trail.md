# Skill: Audit Trail

## Purpose

Write structured, immutable audit log entries for every significant governance decision, AI invocation, output lifecycle transition, and human review decision. The audit trail is the accountability backbone of the platform.

## When To Use

This skill is invoked automatically for every event that requires audit logging. It is not invoked by users directly — it is called by the platform's orchestration layer.

## Required Inputs

- Event type (AI_INVOCATION / OUTPUT_STATUS_CHANGE / GOVERNANCE_DECISION / REVIEW_DECISION / OVERRIDE)
- Actor type (USER / AI_AGENT / SYSTEM)
- Actor ID
- Resource type and ID
- Event details (structured per event type)
- Timestamp (UTC)

## Process

1. Receive the event and its structured data.
2. Validate that all required fields are present.
3. Write the audit log entry to the AuditLog table.
4. Return the audit log entry ID.

## Output Format (Audit Log Record Structure)

```
id              UUID (generated)
organizationId  UUID
actorId         UUID (user or system ID)
actorType       USER | AI_AGENT | SYSTEM
action          String (e.g., "ai_output.status_changed", "review.approved")
resourceType    String (e.g., "AiGeneratedOutput", "AiReview")
resourceId      UUID
metadata        JSON (event-specific details)
ipAddress       String (if user action)
createdAt       DateTime (UTC, immutable)
```

## Audit Event Types

| Action | Trigger | Key Metadata |
|---|---|---|
| `ai.invocation.started` | Agent invoked | agentSlug, skillSlug, model, inputHash |
| `ai.invocation.completed` | Output generated | outputId, tokenCount, durationMs |
| `ai.output.status_changed` | Output lifecycle transition | fromStatus, toStatus, reason |
| `governance.hallucination_check` | Hallucination check run | result, flagCount, highSeverityCount |
| `governance.risk_review` | Risk review run | riskLevel, escalationRequired |
| `governance.gate_decision` | Approval gate decision | decision, assignedReviewerRole |
| `review.approved` | Human approves output | reviewerId, comments |
| `review.rejected` | Human rejects output | reviewerId, reason, comments |
| `review.revision_requested` | Revision requested | reviewerId, revisionGuidance |
| `governance.override` | Engagement Manager overrides gate block | overriderId, justification |

## Validation Rules

- Audit log entries are never updated or deleted after creation
- All required fields must be present — entries with missing fields are rejected
- Timestamps are always UTC
- `metadata` must be a valid JSON object

## Risk Checks

- If an override event is written, a notification must be sent to the Practice Lead
- If more than 3 override events occur in a single project within 7 days, a risk alert is generated

## Do Not Do

- Do not modify or delete audit log entries after creation
- Do not write audit entries without a valid actor ID
- Do not truncate metadata to save space — completeness is required

## Example Output

> Audit entry: action = "review.approved", actor = User(uuid-reviewer-1), resource = AiGeneratedOutput(uuid-output-123), metadata = { "decision": "APPROVED", "comments": "Module recommendations are accurate and well-supported by discovery evidence. ARM recommendation correctly caveated.", "reviewDurationMinutes": 14 }, createdAt = 2026-05-13T14:32:00Z.
