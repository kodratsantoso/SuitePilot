import { z } from 'zod'

// ── Subscription Plans ─────────────────────────────────────────────────────────

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  features: z.array(z.string()),
  pricePerMonth: z.number().min(0),
  pricePerYear: z.number().min(0),
  maxUsers: z.number().int().min(1),
  maxProjects: z.number().int().min(1),
})

export const updatePlanSchema = createPlanSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// ── Tenants ────────────────────────────────────────────────────────────────────

export const createTenantSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1).max(200),
  domain: z.string().max(100).optional(),
  subscriptionPlanId: z.string().min(1).optional(),
  trialEndsAt: z.string().datetime().optional(),
})

export const updateTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  domain: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL']).optional(),
  subscriptionPlanId: z.string().min(1).optional(),
  trialEndsAt: z.string().datetime().optional(),
})

// ── Billing ────────────────────────────────────────────────────────────────────

export const createInvoiceSchema = z.object({
  tenantId: z.string().uuid(),
  subscriptionPlanId: z.string().min(1).optional(),
  billingPeriodStart: z.string().datetime(),
  billingPeriodEnd: z.string().datetime(),
  amount: z.number().min(0),
  paymentMethod: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const payInvoiceSchema = z.object({
  paymentMethod: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

// ── Usage ──────────────────────────────────────────────────────────────────────

export const recordUsageSchema = z.object({
  metricType: z.enum(['AI_OUTPUT_COUNT', 'API_USAGE', 'STORAGE_USED', 'ACTIVE_USERS']),
  value: z.number().min(0),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
})

// ── Roles ──────────────────────────────────────────────────────────────────────

export const createTenantRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).optional(),
})

export const updateTenantRoleSchema = createTenantRoleSchema.partial()

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
})

// ── Global Admin / Superuser ──────────────────────────────────────────────────

export const overrideSubscriptionSchema = z.object({
  subscriptionPlanId: z.string().uuid().nullable().optional(),
  trialEndsAt: z.string().datetime().nullable().optional(),
  description: z.string().min(1).max(1000).optional(),
})

export const updateTenantStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL']),
  description: z.string().min(1).max(1000).optional(),
})

export const updateGlobalUserRoleSchema = z.object({
  role: z.enum(['SUPERUSER', 'OWNER', 'ADMIN', 'PROJECT_MANAGER', 'CONSULTANT', 'VIEWER', 'USER']),
  description: z.string().min(1).max(1000).optional(),
})

export const triggerGlobalDeploymentSchema = z.object({
  environmentId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  targetProjectId: z.string().min(1).optional(),
  actionType: z.enum(['BUILD', 'TEST', 'DEPLOY', 'ROLLBACK', 'SCALE', 'SELF_HEAL']),
  version: z.string().max(100).optional(),
  imageTag: z.string().max(120).optional(),
  commitSha: z.string().max(80).optional(),
  desiredReplicas: z.number().int().min(1).max(50).optional(),
  description: z.string().min(1).max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>
export type RecordUsageInput = z.infer<typeof recordUsageSchema>
export type CreateTenantRoleInput = z.infer<typeof createTenantRoleSchema>
export type UpdateTenantRoleInput = z.infer<typeof updateTenantRoleSchema>
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>
export type OverrideSubscriptionInput = z.infer<typeof overrideSubscriptionSchema>
export type UpdateTenantStatusInput = z.infer<typeof updateTenantStatusSchema>
export type UpdateGlobalUserRoleInput = z.infer<typeof updateGlobalUserRoleSchema>
export type TriggerGlobalDeploymentInput = z.infer<typeof triggerGlobalDeploymentSchema>
