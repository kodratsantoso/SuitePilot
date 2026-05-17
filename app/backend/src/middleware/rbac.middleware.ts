import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from '../types/index.js'
import { Errors } from '../lib/errors.js'
import { env } from '../lib/env.js'

// Role-based permission definitions
export const PERMISSIONS = {
  // Organization
  ORG_READ: 'org:read',
  ORG_WRITE: 'org:write',
  // Customer
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',
  // Project
  PROJECT_READ: 'project:read',
  PROJECT_WRITE: 'project:write',
  PROJECT_DELETE: 'project:delete',
  // Task
  TASK_READ: 'task:read',
  TASK_WRITE: 'task:write',
  TASK_DELETE: 'task:delete',
  // Milestone
  MILESTONE_READ: 'milestone:read',
  MILESTONE_WRITE: 'milestone:write',
  // RAID
  RAID_READ: 'raid:read',
  RAID_WRITE: 'raid:write',
  // AI
  AI_INVOKE: 'ai:invoke',
  AI_REVIEW: 'ai:review',
  // Audit
  AUDIT_READ: 'audit:read',
  // Admin
  ADMIN_ACCESS: 'admin:access',
  SUPERUSER_ACCESS: 'superuser:access',
} as const

type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Role-permission matrix — system roles
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPERUSER: Object.values(PERMISSIONS) as Permission[],
  OWNER: Object.values(PERMISSIONS) as Permission[],
  ADMIN: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.ORG_WRITE,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.CUSTOMER_WRITE,
    PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_WRITE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.MILESTONE_READ,
    PERMISSIONS.MILESTONE_WRITE,
    PERMISSIONS.RAID_READ,
    PERMISSIONS.RAID_WRITE,
    PERMISSIONS.AI_INVOKE,
    PERMISSIONS.AI_REVIEW,
    PERMISSIONS.AUDIT_READ,
  ],
  PROJECT_MANAGER: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_WRITE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.MILESTONE_READ,
    PERMISSIONS.MILESTONE_WRITE,
    PERMISSIONS.RAID_READ,
    PERMISSIONS.RAID_WRITE,
    PERMISSIONS.AI_INVOKE,
    PERMISSIONS.AUDIT_READ,
  ],
  CONSULTANT: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_WRITE,
    PERMISSIONS.MILESTONE_READ,
    PERMISSIONS.RAID_READ,
    PERMISSIONS.RAID_WRITE,
    PERMISSIONS.AI_INVOKE,
  ],
  VIEWER: [
    PERMISSIONS.ORG_READ,
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.MILESTONE_READ,
    PERMISSIONS.RAID_READ,
  ],
  // Default fallback
  USER: [PERMISSIONS.ORG_READ, PERMISSIONS.PROJECT_READ, PERMISSIONS.TASK_READ],
}

function isConfiguredSuperuser(email: string): boolean {
  return (env.SUPERUSER_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase())
}

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS['USER'] ?? []
  return perms.includes(permission)
}

export function requirePermission(permission: Permission): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user')
    if (!hasPermission(user.role, permission)) {
      throw Errors.forbidden()
    }
    await next()
  }
}

export function requireSuperuser(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user')
    if (user.role !== 'SUPERUSER' && !isConfiguredSuperuser(user.email)) {
      throw Errors.forbidden('Superuser access is required')
    }
    await next()
  }
}
