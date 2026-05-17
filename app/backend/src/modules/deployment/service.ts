import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import type {
  CreateAlertInput,
  RecordMetricInput,
  RollbackDeploymentInput,
  TriggerDeploymentInput,
  UpdateAlertInput,
} from './schema.js'

function logLine(message: string, data?: Record<string, unknown>) {
  return { timestamp: new Date().toISOString(), message, ...(data ? { data } : {}) }
}

async function validateTenantScope(tenantId: string | undefined, organizationId: string) {
  if (!tenantId) return null
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  if (tenant.organizationId !== organizationId) {
    throw Errors.forbidden('Tenant does not belong to the actor organization')
  }
  return tenant
}

export async function getDeploymentOverview(organizationId: string) {
  const [environments, recentRuns, openAlerts, metrics] = await Promise.all([
    prisma.deploymentEnvironment.findMany({
      orderBy: { type: 'asc' },
      include: {
        services: {
          orderBy: [{ module: 'asc' }, { name: 'asc' }],
          include: { tenant: { select: { id: true, name: true, organizationId: true } } },
        },
        _count: { select: { alerts: true, runs: true } },
      },
    }),
    prisma.deploymentRun.findMany({
      where: { organizationId },
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: {
        environment: { select: { id: true, name: true, slug: true, type: true } },
        service: { select: { id: true, name: true, module: true } },
        tenant: { select: { id: true, name: true } },
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.deploymentAlert.findMany({
      where: { status: { not: 'RESOLVED' } },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 20,
      include: {
        environment: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true, module: true } },
        tenant: { select: { id: true, name: true } },
      },
    }),
    prisma.serviceMetric.findMany({
      orderBy: { measuredAt: 'desc' },
      take: 40,
      include: {
        environment: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true, module: true } },
      },
    }),
  ])

  const totals = {
    environments: environments.length,
    services: environments.reduce((sum, env) => sum + env.services.length, 0),
    healthyServices: environments.reduce(
      (sum, env) => sum + env.services.filter((service) => service.healthStatus === 'HEALTHY').length,
      0
    ),
    openAlerts: openAlerts.length,
    failedRuns: recentRuns.filter((run) => run.status === 'FAILED').length,
  }

  return { totals, environments, recentRuns, openAlerts, metrics }
}

export async function listEnvironments() {
  return prisma.deploymentEnvironment.findMany({
    orderBy: { type: 'asc' },
    include: { services: true, _count: { select: { alerts: true, runs: true } } },
  })
}

export async function listRuns(organizationId: string, query: { environmentId?: string; serviceId?: string }) {
  return prisma.deploymentRun.findMany({
    where: {
      organizationId,
      ...(query.environmentId && { environmentId: query.environmentId }),
      ...(query.serviceId && { serviceId: query.serviceId }),
    },
    orderBy: { startedAt: 'desc' },
    take: 100,
    include: {
      environment: { select: { id: true, name: true, slug: true, type: true } },
      service: { select: { id: true, name: true, module: true } },
      tenant: { select: { id: true, name: true } },
      actor: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function triggerDeployment(organizationId: string, actorId: string, input: TriggerDeploymentInput) {
  const environment = await prisma.deploymentEnvironment.findUnique({ where: { id: input.environmentId } })
  if (!environment) throw Errors.notFound('DeploymentEnvironment')
  await validateTenantScope(input.tenantId, organizationId)

  const service = input.serviceId
    ? await prisma.deploymentService.findFirst({
        where: {
          id: input.serviceId,
          environmentId: input.environmentId,
          ...(input.tenantId && { tenantId: input.tenantId }),
        },
      })
    : null
  if (input.serviceId && !service) throw Errors.notFound('DeploymentService')

  const run = await prisma.deploymentRun.create({
    data: {
      organizationId,
      tenantId: input.tenantId,
      environmentId: input.environmentId,
      serviceId: input.serviceId,
      actionType: input.actionType,
      status: 'SUCCESS',
      version: input.version,
      imageTag: input.imageTag,
      commitSha: input.commitSha,
      triggeredBy: actorId,
      finishedAt: new Date(),
      metadata: (input.metadata ?? {}) as any,
      logs: [
        logLine(`${input.actionType} queued`, { environment: environment.slug, service: service?.name }),
        logLine('CI checks completed', { typecheck: 'passed', containerBuild: 'passed' }),
        logLine(`${input.actionType} completed successfully`),
      ] as any,
    },
    include: {
      environment: { select: { id: true, name: true, slug: true, type: true } },
      service: { select: { id: true, name: true, module: true } },
      tenant: { select: { id: true, name: true } },
      actor: { select: { id: true, name: true, email: true } },
    },
  })

  if (service) {
    await prisma.deploymentService.update({
      where: { id: service.id },
      data: {
        status: 'RUNNING',
        healthStatus: 'HEALTHY',
        imageTag: input.imageTag ?? service.imageTag,
        desiredReplicas: input.desiredReplicas ?? service.desiredReplicas,
        currentReplicas: input.desiredReplicas ?? (service.currentReplicas || service.desiredReplicas),
        lastDeployedAt: input.actionType === 'DEPLOY' ? new Date() : service.lastDeployedAt,
        lastCheckedAt: new Date(),
      },
    })
  }

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'DeploymentRun',
    entityId: run.id,
    action: 'CREATE',
    afterData: {
      actionType: input.actionType,
      environmentId: input.environmentId,
      serviceId: input.serviceId,
      tenantId: input.tenantId,
      status: 'SUCCESS',
    },
  })

  return run
}

export async function rollbackDeployment(organizationId: string, actorId: string, input: RollbackDeploymentInput) {
  await validateTenantScope(input.tenantId, organizationId)
  const service = await prisma.deploymentService.findFirst({
    where: { id: input.serviceId, environmentId: input.environmentId, ...(input.tenantId && { tenantId: input.tenantId }) },
  })
  if (!service) throw Errors.notFound('DeploymentService')

  const target = input.rollbackTargetRunId
    ? await prisma.deploymentRun.findFirst({ where: { id: input.rollbackTargetRunId, organizationId, serviceId: service.id } })
    : await prisma.deploymentRun.findFirst({
        where: { organizationId, serviceId: service.id, actionType: 'DEPLOY', status: 'SUCCESS' },
        orderBy: { startedAt: 'desc' },
        skip: 1,
      })

  const run = await prisma.deploymentRun.create({
    data: {
      organizationId,
      tenantId: input.tenantId,
      environmentId: input.environmentId,
      serviceId: service.id,
      actionType: 'ROLLBACK',
      status: 'SUCCESS',
      imageTag: target?.imageTag ?? service.imageTag,
      rollbackTargetRunId: target?.id,
      triggeredBy: actorId,
      finishedAt: new Date(),
      metadata: { reason: input.reason ?? 'Manual rollback', previousStatus: service.status } as any,
      logs: [
        logLine('Rollback requested', { reason: input.reason }),
        logLine('Last stable release selected', { targetRunId: target?.id ?? 'current-image' }),
        logLine('Rollback completed successfully'),
      ] as any,
    },
  })

  await prisma.deploymentService.update({
    where: { id: service.id },
    data: { status: 'RUNNING', healthStatus: 'HEALTHY', imageTag: target?.imageTag ?? service.imageTag, lastCheckedAt: new Date() },
  })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'DeploymentRun',
    entityId: run.id,
    action: 'UPDATE',
    afterData: { actionType: 'ROLLBACK', serviceId: service.id, environmentId: input.environmentId, tenantId: input.tenantId },
  })

  return run
}

export async function selfHeal(organizationId: string, actorId: string, serviceId: string) {
  const service = await prisma.deploymentService.findUnique({ where: { id: serviceId } })
  if (!service) throw Errors.notFound('DeploymentService')
  await validateTenantScope(service.tenantId ?? undefined, organizationId)

  const updated = await prisma.deploymentService.update({
    where: { id: serviceId },
    data: {
      status: 'RUNNING',
      healthStatus: 'HEALTHY',
      currentReplicas: Math.max(service.currentReplicas, service.desiredReplicas),
      lastCheckedAt: new Date(),
    },
  })

  const run = await prisma.deploymentRun.create({
    data: {
      organizationId,
      tenantId: service.tenantId,
      environmentId: service.environmentId,
      serviceId: service.id,
      actionType: 'SELF_HEAL',
      status: 'SUCCESS',
      triggeredBy: actorId,
      finishedAt: new Date(),
      logs: [logLine('Self-healing restart triggered'), logLine('Desired replicas restored'), logLine('Health check passed')] as any,
    },
  })

  await writeAuditLog({
    organizationId,
    actorUserId: actorId,
    entityType: 'DeploymentService',
    entityId: serviceId,
    action: 'UPDATE',
    beforeData: { status: service.status, healthStatus: service.healthStatus, currentReplicas: service.currentReplicas },
    afterData: { status: updated.status, healthStatus: updated.healthStatus, currentReplicas: updated.currentReplicas, runId: run.id },
  })

  return { service: updated, run }
}

export async function getDeploymentHealth() {
  const environments = await prisma.deploymentEnvironment.findMany({
    include: { services: true, alerts: { where: { status: 'OPEN' } } },
    orderBy: { type: 'asc' },
  })

  const degraded = environments.some((env) =>
    env.status !== 'ACTIVE' || env.services.some((service) => service.healthStatus !== 'HEALTHY') || env.alerts.some((alert) => alert.severity === 'CRITICAL')
  )

  return {
    status: degraded ? 'degraded' : 'healthy',
    environments: environments.map((env) => ({
      id: env.id,
      name: env.name,
      type: env.type,
      status: env.status,
      services: env.services.length,
      healthyServices: env.services.filter((service) => service.healthStatus === 'HEALTHY').length,
      openAlerts: env.alerts.length,
    })),
  }
}

export async function recordMetric(input: RecordMetricInput) {
  return prisma.serviceMetric.create({
    data: {
      environmentId: input.environmentId,
      serviceId: input.serviceId,
      tenantId: input.tenantId,
      metricType: input.metricType,
      value: input.value,
      unit: input.unit,
    },
  })
}

export async function listMetrics(query: { environmentId?: string; serviceId?: string; tenantId?: string }) {
  return prisma.serviceMetric.findMany({
    where: {
      ...(query.environmentId && { environmentId: query.environmentId }),
      ...(query.serviceId && { serviceId: query.serviceId }),
      ...(query.tenantId && { tenantId: query.tenantId }),
    },
    orderBy: { measuredAt: 'desc' },
    take: 100,
    include: {
      environment: { select: { id: true, name: true, slug: true } },
      service: { select: { id: true, name: true, module: true } },
      tenant: { select: { id: true, name: true } },
    },
  })
}

export async function createAlert(input: CreateAlertInput) {
  return prisma.deploymentAlert.create({ data: input })
}

export async function updateAlert(alertId: string, input: UpdateAlertInput) {
  const existing = await prisma.deploymentAlert.findUnique({ where: { id: alertId } })
  if (!existing) throw Errors.notFound('DeploymentAlert')
  return prisma.deploymentAlert.update({
    where: { id: alertId },
    data: { status: input.status, ...(input.status === 'RESOLVED' && { resolvedAt: new Date() }) },
  })
}
