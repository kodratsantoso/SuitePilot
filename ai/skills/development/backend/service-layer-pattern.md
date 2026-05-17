# Skill: Service Layer Pattern

## Purpose

Define and implement the service layer pattern for the AI NetSuite Implementation OS backend — the layer between Hono route handlers and Prisma database access. The service layer contains business logic, enforces organization scoping, and is the only place where database queries are constructed.

## When To Use

Use when implementing any new business operation that a route handler needs to call. All non-trivial logic must live in a service function, not in the route handler.

## Required Inputs

- Feature requirements (what the operation should do)
- Prisma schema for the relevant entity
- Organization scoping requirements (which field scopes queries to the org)
- Audit log requirements for this operation

## Process

1. Create a service file in `app/backend/services/[entity].service.ts`.
2. Implement typed service functions: `listX()`, `getXById()`, `createX()`, `updateX()`, `deleteX()`.
3. Every query must include an `organizationId` filter — no queries without org scope.
4. Service functions receive only validated, typed inputs from the route handler.
5. Service functions throw typed errors (`AppError`) — never return error objects.
6. Include audit log calls for write operations.

## Output Format

```typescript
// app/backend/services/project-task.service.ts
import { prisma } from '../lib/prisma'
import { AuditLogger } from '../lib/audit'
import { AppError } from '../lib/errors'
import type { CreateProjectTaskInput, UpdateProjectTaskInput } from '@netsuite-ai-os/types'

export async function listProjectTasks(organizationId: string, projectId: string) {
  // Validate project belongs to org first
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found', 404)

  return prisma.projectTask.findMany({
    where: { projectId, project: { organizationId } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createProjectTask(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateProjectTaskInput
) {
  // Validate project belongs to org
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw new AppError('NOT_FOUND', 'Project not found', 404)

  const task = await prisma.projectTask.create({
    data: { ...input, projectId, createdById: actorId },
  })

  await AuditLogger.log({ organizationId, actorId, action: 'task.created', resourceType: 'ProjectTask', resourceId: task.id })
  return task
}
```

## Validation Rules

- Every service function that reads data must filter by `organizationId`
- Write operations must call `AuditLogger.log()` before returning
- Service functions must not catch and swallow errors — let them propagate after logging
- No direct `res.json()` calls in service functions — services return data, routes serialize it

## Risk Checks

- Flag if a service function constructs a Prisma query without an `organizationId` filter
- Flag if a write service function does not include an audit log call
- Flag if error handling uses `try/catch` that returns null instead of throwing

## Do Not Do

- Do not put Prisma calls directly in route handler functions
- Do not return different shapes from the same service function based on input flags
- Do not use raw SQL unless absolutely necessary and documented

## Example Output

> `getProjectById(organizationId, projectId)`: queries `prisma.project.findFirst({ where: { id: projectId, organizationId } })`. If null, throws `AppError('NOT_FOUND', 'Project not found', 404)`. Returns the project record. No audit log (read-only operation).
