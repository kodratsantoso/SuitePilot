import type { AuditAction } from '@prisma/client'
import { prisma } from './prisma.js'
import { logger } from './logger.js'

export interface AuditLogInput {
  organizationId: string
  projectId?: string
  actorUserId?: string
  entityType: string
  entityId?: string
  action: AuditAction
  beforeData?: Record<string, unknown>
  afterData?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        projectId: input.projectId,
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeData: (input.beforeData ?? undefined) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        afterData: (input.afterData ?? undefined) as any,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    })
  } catch (err) {
    // Audit log failures should not break the main operation but must be logged
    logger.error({ err, input }, 'Failed to write audit log')
  }
}
