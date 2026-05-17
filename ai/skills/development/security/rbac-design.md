# Skill: RBAC Design

## Purpose

Design and implement the Role-Based Access Control (RBAC) system for the AI NetSuite Implementation OS — defining roles, permissions, and the middleware that enforces them on every protected API endpoint.

## When To Use

Use when implementing the authentication infrastructure in Phase 1, or when adding a new permission-protected resource.

## Required Inputs

- List of user roles required (from product spec)
- List of resources and actions that need permission protection
- Multi-tenancy model (permissions are scoped to an organization)

## Process

1. Define system roles: OWNER, ADMIN, PROJECT_MANAGER, CONSULTANT, VIEWER.
2. Define permission format: `resource:action` (e.g., `project:write`, `task:delete`, `ai:invoke`).
3. Define the role-permission matrix (which role has which permissions).
4. Implement RBAC middleware that checks permissions from the JWT claims.
5. Apply RBAC middleware to every protected endpoint.

## Output Format

```typescript
// app/packages/types/permissions.ts
export const PERMISSIONS = {
  PROJECT_READ: 'project:read',
  PROJECT_WRITE: 'project:write',
  PROJECT_DELETE: 'project:delete',
  TASK_READ: 'task:read',
  TASK_WRITE: 'task:write',
  TASK_DELETE: 'task:delete',
  RAID_READ: 'raid:read',
  RAID_WRITE: 'raid:write',
  AI_INVOKE: 'ai:invoke',
  AI_REVIEW: 'ai:review',
  AUDIT_READ: 'audit:read',
  ADMIN_ACCESS: 'admin:access',
} as const

// Role-permission matrix
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: [PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE, PERMISSIONS.PROJECT_DELETE, PERMISSIONS.TASK_READ, PERMISSIONS.TASK_WRITE, PERMISSIONS.AI_INVOKE, PERMISSIONS.AI_REVIEW, PERMISSIONS.AUDIT_READ],
  PROJECT_MANAGER: [PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_WRITE, PERMISSIONS.TASK_READ, PERMISSIONS.TASK_WRITE, PERMISSIONS.RAID_READ, PERMISSIONS.RAID_WRITE, PERMISSIONS.AI_INVOKE],
  CONSULTANT: [PERMISSIONS.PROJECT_READ, PERMISSIONS.TASK_READ, PERMISSIONS.TASK_WRITE, PERMISSIONS.RAID_READ, PERMISSIONS.AI_INVOKE],
  VIEWER: [PERMISSIONS.PROJECT_READ, PERMISSIONS.TASK_READ, PERMISSIONS.RAID_READ],
}

// app/backend/middleware/rbac.ts
export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('user')  // set by authMiddleware
    const userPermissions = ROLE_PERMISSIONS[user.role] ?? []
    if (!userPermissions.includes(permission)) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, 403)
    }
    await next()
  }
}
```

## Validation Rules

- Every write endpoint must have `requirePermission` middleware applied
- The VIEWER role must never be able to write data
- Permission constants must be used — no hardcoded strings in middleware calls

## Risk Checks

- Flag if a DELETE endpoint is missing permission middleware
- Flag if RBAC is checked only in the frontend but not enforced in the backend API

## Do Not Do

- Do not implement permission checks inside service functions — put them in middleware
- Do not return 403 for cross-org access — return 404 to avoid leaking existence

## Example Output

> `app.delete('/api/projects/:id', authMiddleware, requirePermission(PERMISSIONS.PROJECT_DELETE), ...)`. Ensures only users with `project:delete` permission (OWNER and ADMIN roles) can delete projects.
