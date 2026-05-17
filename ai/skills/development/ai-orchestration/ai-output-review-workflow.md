# Skill: AI Output Review Workflow

## Purpose

Implement the AI output lifecycle management system — the engineering layer that moves AiGeneratedOutput records through their states (DRAFT → GOVERNANCE_CHECK → UNDER_REVIEW → APPROVED/REJECTED), notifies reviewers, and enforces the mandatory human review gate defined in ADR-0003.

## When To Use

Use when implementing the output lifecycle state machine and the review queue API. This is a Phase 2 implementation target and a prerequisite for any AI feature to be usable in production.

## Required Inputs

- AiGeneratedOutput and AiReview data model
- Review workflow definition (`app/.ssot/delivery/REVIEW_WORKFLOW.md`)
- ADR-0003 (mandatory human review gate)
- Reviewer role assignment rules from AGENT_REGISTRY.md

## Process

1. Implement the `OutputLifecycleManager` with state transition logic.
2. Define valid transitions: DRAFT → GOVERNANCE_CHECK → UNDER_REVIEW, UNDER_REVIEW → APPROVED/REJECTED/REVISION_REQUESTED.
3. Validate that illegal transitions are rejected (cannot go from DRAFT directly to APPROVED).
4. On GOVERNANCE_CHECK completion, route to the correct reviewer role based on agent type and risk level.
5. Implement the review queue API: list pending reviews, submit a review decision.
6. Write audit log entries for every state transition.
7. Implement notification hooks (placeholder for email/Slack in Phase 4+).

## Output Format

```typescript
// app/backend/ai/lifecycle/output-lifecycle.ts
export class OutputLifecycleManager {
  static async submitForGovernanceCheck(outputId: string, organizationId: string): Promise<void> {
    await this.transition(outputId, 'DRAFT', 'GOVERNANCE_CHECK')
    // Trigger governance agent evaluation (async)
  }

  static async passGovernanceCheck(outputId: string, reviewerRole: string): Promise<void> {
    await this.transition(outputId, 'GOVERNANCE_CHECK', 'UNDER_REVIEW')
    await this.assignReviewer(outputId, reviewerRole)
  }

  static async recordReviewDecision(
    outputId: string,
    reviewerId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED',
    comments?: string
  ): Promise<void> {
    const targetStatus = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'REVISION_REQUESTED'
    await this.transition(outputId, 'UNDER_REVIEW', targetStatus)
    await prisma.aiReview.create({ data: { outputId, reviewerId, decision, comments } })
    await AuditLogger.log({ action: `review.${decision.toLowerCase()}`, ... })
  }

  private static async transition(outputId: string, from: OutputStatus, to: OutputStatus): Promise<void> {
    const output = await prisma.aiGeneratedOutput.findUnique({ where: { id: outputId } })
    if (output?.status !== from) throw new AppError('INVALID_TRANSITION', `Cannot transition from ${output?.status} to ${to}`, 400)
    await prisma.aiGeneratedOutput.update({ where: { id: outputId }, data: { status: to } })
    await AuditLogger.log({ action: 'ai.output.status_changed', metadata: { from, to } })
  }
}
```

## Validation Rules

- Invalid state transitions must throw an error — never silently succeed
- APPROVED status can only be set by a human reviewer (not by the system)
- Every state transition must produce an audit log entry
- The governance check must complete before an output enters the review queue

## Risk Checks

- Flag if outputs can be set to APPROVED without a corresponding AiReview record
- Flag if the review queue can be bypassed by direct database update without the lifecycle manager

## Do Not Do

- Do not allow direct status updates to AiGeneratedOutput without going through the lifecycle manager
- Do not implement auto-approval under any circumstances (ADR-0003)

## Example Output

> Output lifecycle: AI generates BRD → status DRAFT → GovernanceAgent evaluates (quality score 4.2, no hallucinations) → status GOVERNANCE_CHECK → PASS → status UNDER_REVIEW, assigned to Senior Functional Consultant → reviewer approves with comment → status APPROVED, AiReview record created, audit log entry written.
