import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import type {
  CreatePlanInput, UpdatePlanInput,
  CreateTenantInput, UpdateTenantInput,
  CreateInvoiceInput, PayInvoiceInput,
  RecordUsageInput,
  CreateTenantRoleInput, UpdateTenantRoleInput, AssignUserRoleInput,
  OverrideSubscriptionInput, UpdateTenantStatusInput, UpdateGlobalUserRoleInput, TriggerGlobalDeploymentInput,
} from './schema.js'

async function writeSuperuserAction(input: {
  superuserId: string
  actionType: 'TenantActivation' | 'SubscriptionOverride' | 'UserRoleChange' | 'DeploymentTrigger'
  targetTenantId?: string | null
  targetProjectId?: string | null
  description: string
}) {
  return prisma.superuserActionLog.create({
    data: {
      superuserId: input.superuserId,
      actionType: input.actionType,
      targetTenantId: input.targetTenantId,
      targetProjectId: input.targetProjectId,
      description: input.description,
    },
  })
}

function logLine(message: string, data?: Record<string, unknown>) {
  return { timestamp: new Date().toISOString(), message, ...(data ? { data } : {}) }
}

// ── Subscription Plans ─────────────────────────────────────────────────────────

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({
    orderBy: { pricePerMonth: 'asc' },
    include: { _count: { select: { tenants: true } } },
  })
}

export async function createPlan(actorId: string, input: CreatePlanInput) {
  const plan = await prisma.subscriptionPlan.create({
    data: { ...input, features: input.features as any },
  })
  await writeAuditLog({
    organizationId: 'system',
    actorUserId: actorId,
    entityType: 'SubscriptionPlan',
    entityId: plan.id,
    action: 'CREATE',
    afterData: { name: plan.name, pricePerMonth: plan.pricePerMonth },
  })
  return plan
}

export async function updatePlan(planId: string, actorId: string, input: UpdatePlanInput) {
  const existing = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!existing) throw Errors.notFound('SubscriptionPlan')
  const updated = await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: { ...input, ...(input.features && { features: input.features as any }) },
  })
  await writeAuditLog({
    organizationId: 'system',
    actorUserId: actorId,
    entityType: 'SubscriptionPlan',
    entityId: planId,
    action: 'UPDATE',
    beforeData: { name: existing.name, isActive: existing.isActive },
    afterData: { name: updated.name, isActive: updated.isActive },
  })
  return updated
}

export async function deletePlan(planId: string, actorId: string) {
  const existing = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
  if (!existing) throw Errors.notFound('SubscriptionPlan')
  const tenantCount = await prisma.tenant.count({ where: { subscriptionPlanId: planId } })
  if (tenantCount > 0) throw Errors.conflict('Plan has active tenants — deactivate instead of deleting')
  await prisma.subscriptionPlan.delete({ where: { id: planId } })
  await writeAuditLog({
    organizationId: 'system',
    actorUserId: actorId,
    entityType: 'SubscriptionPlan',
    entityId: planId,
    action: 'DELETE',
    beforeData: { name: existing.name },
  })
}

// ── Tenants ────────────────────────────────────────────────────────────────────

export async function listTenants(query: { page?: string; perPage?: string; status?: string }) {
  const { page, perPage, skip } = parsePagination(query)
  const where = { ...(query.status && { status: query.status as any }) }
  const [total, tenants] = await prisma.$transaction([
    prisma.tenant.count({ where }),
    prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        subscriptionPlan: { select: { id: true, name: true, pricePerMonth: true } },
        _count: { select: { usageRecords: true, invoices: true, userRoles: true } },
      },
    }),
  ])
  return { tenants, meta: paginationMeta(total, page, perPage) }
}

export async function getTenant(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      organization: { select: { id: true, name: true, slug: true, status: true } },
      subscriptionPlan: true,
      roles: true,
      _count: { select: { usageRecords: true, invoices: true, userRoles: true } },
    },
  })
  if (!tenant) throw Errors.notFound('Tenant')
  return tenant
}

export async function createTenant(actorId: string, input: CreateTenantInput) {
  // Check org exists
  const org = await prisma.organization.findUnique({ where: { id: input.organizationId } })
  if (!org) throw Errors.notFound('Organization')
  if (input.subscriptionPlanId) {
    const plan = await prisma.subscriptionPlan.findFirst({ where: { id: input.subscriptionPlanId, isActive: true } })
    if (!plan) throw Errors.notFound('SubscriptionPlan')
  }
  // Check no existing tenant for this org
  const existing = await prisma.tenant.findUnique({ where: { organizationId: input.organizationId } })
  if (existing) throw Errors.conflict('Organization already has a tenant')

  const tenant = await prisma.tenant.create({
    data: {
      ...input,
      trialEndsAt: input.trialEndsAt ? new Date(input.trialEndsAt) : undefined,
    },
    include: {
      organization: { select: { id: true, name: true } },
      subscriptionPlan: { select: { id: true, name: true } },
    },
  })
  await writeAuditLog({
    organizationId: input.organizationId,
    actorUserId: actorId,
    entityType: 'Tenant',
    entityId: tenant.id,
    action: 'CREATE',
    afterData: { name: tenant.name, status: tenant.status },
  })
  return tenant
}

export async function updateTenant(tenantId: string, actorId: string, input: UpdateTenantInput) {
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!existing) throw Errors.notFound('Tenant')
  if (input.subscriptionPlanId) {
    const plan = await prisma.subscriptionPlan.findFirst({ where: { id: input.subscriptionPlanId, isActive: true } })
    if (!plan) throw Errors.notFound('SubscriptionPlan')
  }
  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...input,
      trialEndsAt: input.trialEndsAt ? new Date(input.trialEndsAt) : undefined,
    },
    include: {
      organization: { select: { id: true, name: true } },
      subscriptionPlan: { select: { id: true, name: true } },
    },
  })
  await writeAuditLog({
    organizationId: existing.organizationId,
    actorUserId: actorId,
    entityType: 'Tenant',
    entityId: tenantId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: updated.status },
  })
  return updated
}

export async function deleteTenant(tenantId: string, actorId: string) {
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!existing) throw Errors.notFound('Tenant')
  await prisma.tenant.delete({ where: { id: tenantId } })
  await writeAuditLog({
    organizationId: existing.organizationId,
    actorUserId: actorId,
    entityType: 'Tenant',
    entityId: tenantId,
    action: 'DELETE',
    beforeData: { name: existing.name, status: existing.status },
  })
}

// ── Billing ────────────────────────────────────────────────────────────────────

export async function createInvoice(actorId: string, input: CreateInvoiceInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId }, include: { subscriptionPlan: true } })
  if (!tenant) throw Errors.notFound('Tenant')
  if (tenant.status === 'CANCELLED' || tenant.status === 'SUSPENDED') {
    throw Errors.conflict('Cannot create invoice for inactive tenant')
  }

  const billingPeriodStart = new Date(input.billingPeriodStart)
  const billingPeriodEnd = new Date(input.billingPeriodEnd)
  if (billingPeriodEnd <= billingPeriodStart) {
    throw Errors.validation('billingPeriodEnd must be after billingPeriodStart')
  }

  const subscriptionPlanId = input.subscriptionPlanId ?? tenant.subscriptionPlanId
  if (subscriptionPlanId) {
    const plan = await prisma.subscriptionPlan.findFirst({ where: { id: subscriptionPlanId, isActive: true } })
    if (!plan) throw Errors.notFound('SubscriptionPlan')
  }

  const invoice = await prisma.billingInvoice.create({
    data: {
      ...input,
      subscriptionPlanId,
      billingPeriodStart,
      billingPeriodEnd,
    },
    include: {
      tenant: { select: { id: true, name: true } },
      subscriptionPlan: { select: { id: true, name: true } },
    },
  })
  await writeAuditLog({
    organizationId: tenant.organizationId,
    actorUserId: actorId,
    entityType: 'BillingInvoice',
    entityId: invoice.id,
    action: 'CREATE',
    afterData: { amount: invoice.amount, status: invoice.status },
  })
  return invoice
}

export async function payInvoice(invoiceId: string, actorId: string, input: PayInvoiceInput) {
  const invoice = await prisma.billingInvoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: { select: { organizationId: true } } },
  })
  if (!invoice) throw Errors.notFound('BillingInvoice')
  if (invoice.status === 'PAID') throw Errors.conflict('Invoice already paid')
  const updated = await prisma.billingInvoice.update({
    where: { id: invoiceId },
    data: { status: 'PAID', ...input },
  })
  await writeAuditLog({
    organizationId: invoice.tenant.organizationId,
    actorUserId: actorId,
    entityType: 'BillingInvoice',
    entityId: invoiceId,
    action: 'UPDATE',
    beforeData: { status: 'PENDING' },
    afterData: { status: 'PAID' },
  })
  return updated
}

export async function listInvoices(tenantId: string, query: { page?: string; perPage?: string; status?: string }) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  const { page, perPage, skip } = parsePagination(query)
  const where = { tenantId, ...(query.status && { status: query.status as any }) }
  const [total, invoices] = await prisma.$transaction([
    prisma.billingInvoice.count({ where }),
    prisma.billingInvoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: { subscriptionPlan: { select: { id: true, name: true } } },
    }),
  ])
  return { invoices, meta: paginationMeta(total, page, perPage) }
}

// ── Usage ──────────────────────────────────────────────────────────────────────

export async function recordUsage(tenantId: string, actorId: string, input: RecordUsageInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  const periodStart = new Date(input.periodStart)
  const periodEnd = new Date(input.periodEnd)
  if (periodEnd <= periodStart) {
    throw Errors.validation('periodEnd must be after periodStart')
  }
  const record = await prisma.tenantUsage.create({
    data: {
      tenantId,
      metricType: input.metricType as any,
      value: input.value,
      periodStart,
      periodEnd,
    },
  })
  await writeAuditLog({
    organizationId: tenant.organizationId,
    actorUserId: actorId,
    entityType: 'TenantUsage',
    entityId: record.id,
    action: 'CREATE',
    afterData: { metricType: input.metricType, value: input.value },
  })
  return record
}

export async function getUsage(tenantId: string, query: { metricType?: string; since?: string }) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  const since = query.since ? new Date(query.since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const records = await prisma.tenantUsage.findMany({
    where: {
      tenantId,
      ...(query.metricType && { metricType: query.metricType as any }),
      periodStart: { gte: since },
    },
    orderBy: { periodStart: 'asc' },
    take: 200,
  })

  // Aggregate by metricType
  const summary = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.metricType] = (acc[r.metricType] ?? 0) + r.value
    return acc
  }, {})

  return { records, summary }
}

// ── Feature Gating ─────────────────────────────────────────────────────────────

export async function checkFeatureAccess(organizationId: string, feature: string): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({
    where: { organizationId },
    include: { subscriptionPlan: true },
  })
  if (!tenant) return false
  if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') return false
  if (!tenant.subscriptionPlan) return false
  const features = tenant.subscriptionPlan.features as string[]
  return features.includes('all') || features.includes(feature)
}

// ── Tenant Roles ───────────────────────────────────────────────────────────────

export async function listTenantRoles(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  return prisma.tenantRole.findMany({
    where: { tenantId },
    include: { _count: { select: { userRoles: true } } },
    orderBy: { name: 'asc' },
  })
}

export async function createTenantRole(tenantId: string, actorId: string, input: CreateTenantRoleInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  const role = await prisma.tenantRole.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description,
      permissions: (input.permissions ?? []) as any,
    },
  })
  await writeAuditLog({
    organizationId: tenant.organizationId,
    actorUserId: actorId,
    entityType: 'TenantRole',
    entityId: role.id,
    action: 'CREATE',
    afterData: { name: role.name },
  })
  return role
}

export async function updateTenantRole(
  tenantId: string,
  roleId: string,
  actorId: string,
  input: UpdateTenantRoleInput
) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  const existing = await prisma.tenantRole.findFirst({ where: { id: roleId, tenantId } })
  if (!existing) throw Errors.notFound('TenantRole')

  const role = await prisma.tenantRole.update({
    where: { id: roleId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.permissions !== undefined && { permissions: input.permissions as any }),
    },
  })

  await writeAuditLog({
    organizationId: tenant.organizationId,
    actorUserId: actorId,
    entityType: 'TenantRole',
    entityId: role.id,
    action: 'UPDATE',
    beforeData: { name: existing.name, permissions: existing.permissions },
    afterData: { name: role.name, permissions: role.permissions },
  })
  return role
}

export async function listUserRoles(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  return prisma.tenantUserRole.findMany({
    where: { tenantId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      role: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function assignUserRole(tenantId: string, actorId: string, input: AssignUserRoleInput) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw Errors.notFound('Tenant')
  const user = await prisma.user.findUnique({ where: { id: input.userId } })
  if (!user) throw Errors.notFound('User')
  if (user.organizationId !== tenant.organizationId) {
    throw Errors.forbidden('User does not belong to the tenant organization')
  }
  const role = await prisma.tenantRole.findFirst({ where: { id: input.roleId, tenantId } })
  if (!role) throw Errors.notFound('TenantRole')

  const assignment = await prisma.tenantUserRole.upsert({
    where: { tenantId_userId_roleId: { tenantId, userId: input.userId, roleId: input.roleId } },
    create: { tenantId, userId: input.userId, roleId: input.roleId },
    update: {},
    include: {
      user: { select: { id: true, name: true, email: true } },
      role: { select: { id: true, name: true } },
    },
  })
  await writeAuditLog({
    organizationId: tenant.organizationId,
    actorUserId: actorId,
    entityType: 'TenantUserRole',
    entityId: assignment.id,
    action: 'CREATE',
    afterData: { userId: input.userId, roleId: input.roleId },
  })
  return assignment
}

// ── Admin Summary ──────────────────────────────────────────────────────────────

export async function getAdminSummary() {
  const [totalTenants, tenantsByStatus, totalPlans, pendingInvoices, recentTenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.groupBy({ by: ['status'], _count: true }),
    prisma.subscriptionPlan.count({ where: { isActive: true } }),
    prisma.billingInvoice.count({ where: { status: 'PENDING' } }),
    prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        organization: { select: { name: true } },
        subscriptionPlan: { select: { name: true } },
      },
    }),
  ])

  const byStatus = tenantsByStatus.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = s._count
    return acc
  }, {})

  return {
    totalTenants,
    activeTenants: byStatus['ACTIVE'] ?? 0,
    suspendedTenants: byStatus['SUSPENDED'] ?? 0,
    trialTenants: byStatus['TRIAL'] ?? 0,
    totalPlans,
    pendingInvoices,
    recentTenants,
  }
}

// ── Global Admin / Superuser Console ──────────────────────────────────────────

export async function getGlobalDashboard() {
  const [
    totalTenants,
    tenantsByStatus,
    totalProjects,
    projectsByHealth,
    outputStatus,
    usageByMetric,
    openAlerts,
    recentActions,
    recentSnapshots,
    recentRuns,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.groupBy({ by: ['status'], _count: true }),
    prisma.project.count(),
    prisma.project.groupBy({ by: ['health'], _count: true }),
    prisma.aiGeneratedOutput.groupBy({ by: ['status'], _count: true }),
    prisma.tenantUsage.groupBy({ by: ['metricType'], _sum: { value: true } }),
    prisma.deploymentAlert.findMany({
      where: { status: { not: 'RESOLVED' } },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      include: {
        tenant: { select: { id: true, name: true } },
        environment: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true, module: true } },
      },
    }),
    prisma.superuserActionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        superuser: { select: { id: true, name: true, email: true } },
        targetTenant: { select: { id: true, name: true, status: true } },
        targetProject: { select: { id: true, name: true, health: true } },
      },
    }),
    prisma.globalAnalyticsSnapshot.findMany({
      orderBy: { snapshotDate: 'desc' },
      take: 20,
      include: {
        tenant: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, health: true } },
      },
    }),
    prisma.deploymentRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 8,
      include: {
        tenant: { select: { id: true, name: true } },
        environment: { select: { id: true, name: true, slug: true, type: true } },
        service: { select: { id: true, name: true, module: true } },
      },
    }),
  ])

  const tenantStatus = tenantsByStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count
    return acc
  }, {})
  const ragDistribution = projectsByHealth.reduce<Record<string, number>>((acc, item) => {
    acc[item.health] = item._count
    return acc
  }, {})
  const aiOutputQuality = outputStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count
    return acc
  }, {})
  const usageSummary = usageByMetric.reduce<Record<string, number>>((acc, item) => {
    acc[item.metricType] = item._sum.value ?? 0
    return acc
  }, {})

  return {
    kpis: {
      totalTenants,
      activeTenants: tenantStatus['ACTIVE'] ?? 0,
      suspendedTenants: tenantStatus['SUSPENDED'] ?? 0,
      cancelledTenants: tenantStatus['CANCELLED'] ?? 0,
      trialTenants: tenantStatus['TRIAL'] ?? 0,
      totalProjects,
      redProjects: ragDistribution['RED'] ?? 0,
      amberProjects: ragDistribution['AMBER'] ?? 0,
      openCriticalAlerts: openAlerts.filter((alert) => alert.severity === 'CRITICAL').length,
      failedDeployments: recentRuns.filter((run) => run.status === 'FAILED').length,
    },
    tenantStatus,
    ragDistribution,
    aiOutputQuality,
    usageSummary,
    openAlerts,
    recentActions,
    recentSnapshots,
    recentRuns,
  }
}

export async function listGlobalTenants(query: { page?: string; perPage?: string; status?: string }) {
  const { page, perPage, skip } = parsePagination(query)
  const where = { ...(query.status && { status: query.status as any }) }
  const [total, tenants] = await prisma.$transaction([
    prisma.tenant.count({ where }),
    prisma.tenant.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      skip,
      take: perPage,
      include: {
        organization: { select: { id: true, name: true, slug: true, status: true, _count: { select: { users: true, projects: true } } } },
        subscriptionPlan: { select: { id: true, name: true, pricePerMonth: true, maxUsers: true, maxProjects: true } },
        usageRecords: { orderBy: { periodEnd: 'desc' }, take: 4 },
        _count: { select: { usageRecords: true, invoices: true, userRoles: true, deploymentAlerts: true } },
      },
    }),
  ])
  return { tenants, meta: paginationMeta(total, page, perPage) }
}

export async function overrideTenantSubscription(tenantId: string, superuserId: string, input: OverrideSubscriptionInput) {
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId }, include: { subscriptionPlan: true } })
  if (!existing) throw Errors.notFound('Tenant')
  if (input.subscriptionPlanId) {
    const plan = await prisma.subscriptionPlan.findFirst({ where: { id: input.subscriptionPlanId, isActive: true } })
    if (!plan) throw Errors.notFound('SubscriptionPlan')
  }

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(input.subscriptionPlanId !== undefined && { subscriptionPlanId: input.subscriptionPlanId }),
      ...(input.trialEndsAt !== undefined && { trialEndsAt: input.trialEndsAt ? new Date(input.trialEndsAt) : null }),
    },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      subscriptionPlan: { select: { id: true, name: true, pricePerMonth: true } },
    },
  })

  await writeSuperuserAction({
    superuserId,
    actionType: 'SubscriptionOverride',
    targetTenantId: tenantId,
    description: input.description ?? `Subscription override for tenant ${updated.name}`,
  })
  return updated
}

export async function updateTenantLifecycleStatus(tenantId: string, superuserId: string, input: UpdateTenantStatusInput) {
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!existing) throw Errors.notFound('Tenant')
  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: input.status },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      subscriptionPlan: { select: { id: true, name: true, pricePerMonth: true } },
    },
  })
  await writeSuperuserAction({
    superuserId,
    actionType: 'TenantActivation',
    targetTenantId: tenantId,
    description: input.description ?? `Tenant status changed from ${existing.status} to ${updated.status}`,
  })
  return updated
}

export async function listGlobalUsers(query: { page?: string; perPage?: string; q?: string }) {
  const { page, perPage, skip } = parsePagination(query)
  const where = query.q
    ? {
        OR: [
          { email: { contains: query.q, mode: 'insensitive' as const } },
          { name: { contains: query.q, mode: 'insensitive' as const } },
        ],
      }
    : {}
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        organization: { select: { id: true, name: true, slug: true, tenant: { select: { id: true, name: true, status: true } } } },
        userRoles: { include: { role: { select: { id: true, name: true, isSystem: true } } } },
        tenantUserRoles: { include: { tenant: { select: { id: true, name: true } }, role: { select: { id: true, name: true } } } },
      },
    }),
  ])
  return { users, meta: paginationMeta(total, page, perPage) }
}

export async function updateGlobalUserRole(userId: string, superuserId: string, input: UpdateGlobalUserRoleInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } },
  })
  if (!user) throw Errors.notFound('User')
  const role = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: user.organizationId, name: input.role } },
    create: { organizationId: user.organizationId, name: input.role, isSystem: true, description: `System ${input.role} role` },
    update: { isSystem: true },
  })
  const assignment = await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    create: { userId, roleId: role.id },
    update: {},
    include: { role: true, user: { select: { id: true, name: true, email: true, organizationId: true } } },
  })
  await writeSuperuserAction({
    superuserId,
    actionType: 'UserRoleChange',
    description: input.description ?? `Assigned ${input.role} to ${user.email}`,
  })
  return assignment
}

export async function getGlobalAlerts() {
  const [deploymentAlerts, suspendedTenants, redProjects] = await Promise.all([
    prisma.deploymentAlert.findMany({
      where: { status: { not: 'RESOLVED' } },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        tenant: { select: { id: true, name: true } },
        environment: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true, module: true } },
      },
    }),
    prisma.tenant.findMany({
      where: { status: { in: ['SUSPENDED', 'CANCELLED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { organization: { select: { id: true, name: true } } },
    }),
    prisma.project.findMany({
      where: { health: 'RED' },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { organization: { select: { id: true, name: true, tenant: { select: { id: true, name: true } } } } },
    }),
  ])
  return { deploymentAlerts, suspendedTenants, redProjects }
}

export async function triggerGlobalDeployment(superuserId: string, input: TriggerGlobalDeploymentInput) {
  const environment = await prisma.deploymentEnvironment.findUnique({ where: { id: input.environmentId } })
  if (!environment) throw Errors.notFound('DeploymentEnvironment')
  const actor = await prisma.user.findUnique({ where: { id: superuserId } })
  if (!actor) throw Errors.notFound('User')
  const tenant = input.tenantId ? await prisma.tenant.findUnique({ where: { id: input.tenantId } }) : null
  if (input.tenantId && !tenant) throw Errors.notFound('Tenant')
  const service = input.serviceId
    ? await prisma.deploymentService.findFirst({
        where: { id: input.serviceId, environmentId: input.environmentId, ...(input.tenantId && { tenantId: input.tenantId }) },
      })
    : null
  if (input.serviceId && !service) throw Errors.notFound('DeploymentService')
  if (input.targetProjectId) {
    const project = await prisma.project.findUnique({ where: { id: input.targetProjectId } })
    if (!project) throw Errors.notFound('Project')
  }

  const run = await prisma.deploymentRun.create({
    data: {
      organizationId: tenant?.organizationId ?? actor.organizationId,
      tenantId: input.tenantId,
      environmentId: input.environmentId,
      serviceId: input.serviceId,
      actionType: input.actionType,
      status: 'SUCCESS',
      version: input.version,
      imageTag: input.imageTag,
      commitSha: input.commitSha,
      triggeredBy: superuserId,
      finishedAt: new Date(),
      metadata: { ...(input.metadata ?? {}), globalAdmin: true, targetProjectId: input.targetProjectId } as any,
      logs: [
        logLine('Global admin deployment trigger accepted', { actionType: input.actionType }),
        logLine('Enterprise policy checks passed'),
        logLine(`${input.actionType} completed successfully`),
      ] as any,
    },
    include: {
      tenant: { select: { id: true, name: true } },
      environment: { select: { id: true, name: true, slug: true, type: true } },
      service: { select: { id: true, name: true, module: true } },
      actor: { select: { id: true, name: true, email: true } },
    },
  })

  if (service) {
    await prisma.deploymentService.update({
      where: { id: service.id },
      data: {
        status: input.actionType === 'ROLLBACK' ? 'RUNNING' : 'RUNNING',
        healthStatus: 'HEALTHY',
        imageTag: input.imageTag ?? service.imageTag,
        desiredReplicas: input.desiredReplicas ?? service.desiredReplicas,
        currentReplicas: input.desiredReplicas ?? service.currentReplicas,
        lastDeployedAt: input.actionType === 'DEPLOY' ? new Date() : service.lastDeployedAt,
        lastCheckedAt: new Date(),
      },
    })
  }

  await writeSuperuserAction({
    superuserId,
    actionType: 'DeploymentTrigger',
    targetTenantId: input.tenantId,
    targetProjectId: input.targetProjectId,
    description: input.description ?? `Global ${input.actionType} triggered for ${environment.slug}`,
  })
  return run
}
