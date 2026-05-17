import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { encryptSecret, maskSecret } from '../../lib/crypto.js'
import { writeAuditLog } from '../../lib/audit.js'
import type { CreateSecretInput, RotateSecretInput } from './schema.js'

type AccessLogInput = {
  organizationId?: string
  userId?: string
  tenantId?: string
  projectId?: string
  entityType: string
  entityId?: string
  actionType: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'ROTATE_SECRET' | 'REVOKE_SECRET' | 'SECURITY_CHECK'
  result: 'SUCCESS' | 'FAILURE'
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

export async function writeAccessLog(input: AccessLogInput) {
  await prisma.accessLog.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      tenantId: input.tenantId,
      projectId: input.projectId,
      entityType: input.entityType,
      entityId: input.entityId,
      actionType: input.actionType,
      result: input.result,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: (input.metadata ?? {}) as any,
    },
  })
}

async function validateTenant(organizationId: string, tenantId?: string) {
  if (!tenantId) return undefined
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  if (tenant.organizationId !== organizationId) {
    throw Errors.forbidden('Tenant does not belong to the actor organization')
  }
  return tenant
}

function redactSecret<T extends { secretValue: string }>(secret: T) {
  return { ...secret, secretValue: maskSecret(secret.secretValue) }
}

export async function listAccessLogs(
  organizationId: string,
  query: { tenantId?: string; projectId?: string; result?: string; actionType?: string; since?: string }
) {
  if (query.tenantId) await validateTenant(organizationId, query.tenantId)
  const logs = await prisma.accessLog.findMany({
    where: {
      organizationId,
      ...(query.tenantId && { tenantId: query.tenantId }),
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.result && { result: query.result as any }),
      ...(query.actionType && { actionType: query.actionType as any }),
      ...(query.since && { timestamp: { gte: new Date(query.since) } }),
    },
    orderBy: { timestamp: 'desc' },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true } },
      tenant: { select: { id: true, name: true } },
    },
  })
  return logs
}

export async function listSecrets(organizationId: string, query: { tenantId?: string }) {
  if (query.tenantId) await validateTenant(organizationId, query.tenantId)
  const secrets = await prisma.secretStore.findMany({
    where: { organizationId, ...(query.tenantId && { tenantId: query.tenantId }) },
    orderBy: { updatedAt: 'desc' },
    include: { tenant: { select: { id: true, name: true } } },
  })
  return secrets.map(redactSecret)
}

export async function createSecret(
  organizationId: string,
  actorId: string,
  input: CreateSecretInput,
  requestMeta: { ipAddress?: string; userAgent?: string }
) {
  await validateTenant(organizationId, input.tenantId)
  const encrypted = encryptSecret(input.secretValue)
  const secret = await prisma.secretStore.create({
    data: {
      organizationId,
      tenantId: input.tenantId,
      secretType: input.secretType,
      secretName: input.secretName,
      secretValue: encrypted,
      rotationPolicy: input.rotationPolicy ?? 'DAYS_90',
      lastRotatedAt: new Date(),
    },
    include: { tenant: { select: { id: true, name: true } } },
  })

  await Promise.all([
    writeAccessLog({
      organizationId,
      userId: actorId,
      tenantId: input.tenantId,
      entityType: 'SecretStore',
      entityId: secret.id,
      actionType: 'CREATE',
      result: 'SUCCESS',
      ...requestMeta,
      metadata: { secretType: input.secretType, secretName: input.secretName },
    }),
    writeAuditLog({
      organizationId,
      actorUserId: actorId,
      entityType: 'SecretStore',
      entityId: secret.id,
      action: 'CREATE',
      afterData: { tenantId: input.tenantId, secretType: input.secretType, secretName: input.secretName },
    }),
  ])

  return redactSecret(secret)
}

export async function rotateSecret(
  organizationId: string,
  actorId: string,
  secretId: string,
  input: RotateSecretInput,
  requestMeta: { ipAddress?: string; userAgent?: string }
) {
  const existing = await prisma.secretStore.findFirst({ where: { id: secretId, organizationId } })
  if (!existing) throw Errors.notFound('SecretStore')
  await validateTenant(organizationId, existing.tenantId ?? undefined)

  const updated = await prisma.secretStore.update({
    where: { id: secretId },
    data: {
      secretValue: encryptSecret(input.secretValue),
      status: 'ROTATED',
      rotationPolicy: input.rotationPolicy ?? existing.rotationPolicy,
      lastRotatedAt: new Date(),
    },
    include: { tenant: { select: { id: true, name: true } } },
  })

  await Promise.all([
    writeAccessLog({
      organizationId,
      userId: actorId,
      tenantId: existing.tenantId ?? undefined,
      entityType: 'SecretStore',
      entityId: secretId,
      actionType: 'ROTATE_SECRET',
      result: 'SUCCESS',
      ...requestMeta,
      metadata: { secretType: existing.secretType, secretName: existing.secretName },
    }),
    writeAuditLog({
      organizationId,
      actorUserId: actorId,
      entityType: 'SecretStore',
      entityId: secretId,
      action: 'UPDATE',
      beforeData: { status: existing.status, lastRotatedAt: existing.lastRotatedAt },
      afterData: { status: updated.status, lastRotatedAt: updated.lastRotatedAt },
    }),
  ])

  return redactSecret(updated)
}

export async function listEncryptedFields() {
  return prisma.encryptedField.findMany({ orderBy: [{ tableName: 'asc' }, { columnName: 'asc' }] })
}

export async function getComplianceReport(organizationId: string) {
  const [encryptedFields, activeSecrets, staleSecrets, failedAccess, openCriticalAlerts] = await Promise.all([
    prisma.encryptedField.count(),
    prisma.secretStore.count({ where: { organizationId, status: { not: 'REVOKED' } } }),
    prisma.secretStore.count({
      where: {
        organizationId,
        status: { not: 'REVOKED' },
        lastRotatedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.accessLog.count({ where: { organizationId, result: 'FAILURE' } }),
    prisma.deploymentAlert.count({ where: { severity: 'CRITICAL', status: { not: 'RESOLVED' } } }),
  ])

  return {
    gdprReady: encryptedFields >= 5 && staleSecrets === 0,
    pdpaReady: encryptedFields >= 5 && failedAccess < 10,
    encryptedFields,
    activeSecrets,
    staleSecrets,
    failedAccess,
    openCriticalAlerts,
    retentionPolicyDays: 365,
    dataSubjectRights: ['export', 'rectification', 'erasure-request-workflow'],
  }
}
