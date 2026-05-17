# Skill: Audit Log Implementation

## Purpose

Implement the immutable audit log infrastructure for the AI NetSuite Implementation OS — ensuring that every significant action (create, update, delete, status change, review decision, AI invocation) is permanently recorded with actor, resource, timestamp, and context.

## When To Use

Use when implementing any new write operation that requires audit trail coverage. Also use when reviewing existing routes to identify missing audit coverage.

## Required Inputs

- AuditLog entity definition from DATA_MODEL.md
- List of actions that require logging for the current feature
- Actor type (USER, AI_AGENT, SYSTEM) for the action
- Resource type and ID involved

## Process

1. Implement the `AuditLogger` utility in `app/backend/lib/audit.ts`.
2. Call `AuditLogger.log()` in every service function that performs a write operation.
3. Ensure the AuditLog table has no update or delete permissions — append only.
4. Implement the `GET /api/audit` endpoint for authorized users to view logs.
5. Define a typed `AuditAction` enum covering all loggable actions.

## Output Format

```typescript
// app/backend/lib/audit.ts
import { prisma } from './prisma'

export type AuditAction =
  | 'project.created' | 'project.updated' | 'project.deleted' | 'project.archived'
  | 'task.created' | 'task.updated' | 'task.deleted' | 'task.status_changed'
  | 'milestone.created' | 'milestone.updated'
  | 'raid.created' | 'raid.updated' | 'raid.status_changed'
  | 'ai.invocation.started' | 'ai.invocation.completed'
  | 'ai.output.status_changed'
  | 'review.approved' | 'review.rejected' | 'review.revision_requested'
  | 'auth.login' | 'auth.logout' | 'auth.register'

export interface AuditLogInput {
  organizationId: string
  actorId?: string
  actorType?: 'USER' | 'AI_AGENT' | 'SYSTEM'
  action: AuditAction
  resourceType: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export class AuditLogger {
  static async log(input: AuditLogInput): Promise<void> {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId,
        actorType: input.actorType ?? 'USER',
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress,
      },
    })
  }
}
```

## Validation Rules

- `AuditLogger.log()` must be called for every create, update, delete, and status-change operation
- The AuditLog table must have no Prisma `update` or `delete` operations — append only
- Every audit log entry must have an `organizationId`
- `actorType` must be set correctly: USER for human actions, AI_AGENT for agent invocations, SYSTEM for automated operations

## Risk Checks

- Flag any service function that performs a write without calling `AuditLogger.log()`
- Flag if `AuditLogger.log()` is called after a `return` statement (it will never execute)
- Flag if `metadata` is used to store PII or sensitive data

## Do Not Do

- Do not call `AuditLogger.log()` in a separate `try/catch` that swallows errors (audit failures should surface)
- Do not use raw SQL to write audit logs — use Prisma
- Do not delete audit log records for any reason

## Example Output

> Service: `updateProjectStatus(organizationId, projectId, actorId, newStatus)`. After updating the project record: `await AuditLogger.log({ organizationId, actorId, actorType: 'USER', action: 'project.updated', resourceType: 'Project', resourceId: projectId, metadata: { previousStatus: 'ACTIVE', newStatus: 'ON_HOLD' } })`. This creates an immutable record of who changed the status, when, and what it changed from/to.
