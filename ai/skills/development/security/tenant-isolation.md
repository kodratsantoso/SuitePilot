# Skill: Tenant Isolation

## Purpose

Implement and enforce organization-level multi-tenant data isolation in the AI NetSuite Implementation OS — ensuring that users in one organization can never read or modify data belonging to another organization, at every layer of the stack.

## When To Use

Use when implementing any service function that queries or modifies data. Every data access pattern must be reviewed for tenant isolation.

## Required Inputs

- Prisma schema (all entities with `organizationId`)
- JWT payload structure (contains `organizationId`)
- Service function being reviewed or implemented

## Process

1. Extract `organizationId` from the JWT token in `authMiddleware` and set it on the request context.
2. Pass `organizationId` as the first argument to every service function.
3. In every Prisma query, include `organizationId` in the `where` clause.
4. For nested resources (tasks belong to projects which belong to orgs), validate the parent chain.
5. Write tests that specifically verify cross-tenant access is blocked.

## Output Format

```typescript
// Pattern: always validate the full ownership chain

// CORRECT: validates org → project → task
async function getTask(organizationId: string, projectId: string, taskId: string) {
  const task = await prisma.projectTask.findFirst({
    where: {
      id: taskId,
      projectId,
      project: { organizationId },  // validates the org through the relation
    }
  })
  if (!task) throw new AppError('NOT_FOUND', 'Task not found', 404)
  return task
}

// WRONG: does not validate org membership
async function getTaskWrong(taskId: string) {
  return prisma.projectTask.findUnique({ where: { id: taskId } })
  // ^^^ any user with the taskId can access this, regardless of org
}
```

## Validation Rules

- No service function may query by primary key alone without validating org ownership
- The `organizationId` filter must appear in every list query
- Cross-tenant access must return 404 (not 403) — do not reveal existence of resources in other orgs

## Risk Checks

- Flag any service function that uses `findUnique({ where: { id } })` without adding org scope
- Flag any query that joins across organizations in a way that could leak data

## Do Not Do

- Do not cache data across organizations (cache keys must include organizationId)
- Do not trust the organizationId from the request body — always use the one from the JWT token

## Example Output

> Tenant isolation test: create two organizations, each with a project. User from org-1 attempts `GET /api/projects/:id` with org-2's project ID. Expected: 404. Actual: 404. ✓ Isolation confirmed. The service function uses `prisma.project.findFirst({ where: { id: projectId, organizationId } })` which returns null for cross-org access, triggering the NOT_FOUND error.
