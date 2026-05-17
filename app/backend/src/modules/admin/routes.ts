import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, requireSuperuser, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createPlanSchema, updatePlanSchema,
  createTenantSchema, updateTenantSchema,
  createInvoiceSchema, payInvoiceSchema,
  recordUsageSchema,
  createTenantRoleSchema, updateTenantRoleSchema, assignUserRoleSchema,
  overrideSubscriptionSchema, updateTenantStatusSchema, updateGlobalUserRoleSchema, triggerGlobalDeploymentSchema,
} from './schema.js'
import * as service from './service.js'

// Mounted at /api/admin
const admin = new Hono<AppEnv>()
admin.use('*', authMiddleware)

// Only ADMIN role can access admin routes — enforced via ORG_WRITE for now
const adminOnly = requirePermission(PERMISSIONS.ORG_WRITE)
const superuserOnly = requireSuperuser()

// ── Admin Summary ──────────────────────────────────────────────────────────────
admin.get('/summary', adminOnly, async (c) => {
  const result = await service.getAdminSummary()
  return c.json({ success: true, data: result })
})

// ── Global Admin / Superuser Console ──────────────────────────────────────────
admin.get('/global-dashboard', superuserOnly, async (c) => {
  const result = await service.getGlobalDashboard()
  return c.json({ success: true, data: result })
})

admin.get('/global-alerts', superuserOnly, async (c) => {
  const result = await service.getGlobalAlerts()
  return c.json({ success: true, data: result })
})

admin.get('/users', superuserOnly, async (c) => {
  const result = await service.listGlobalUsers(c.req.query())
  return c.json({ success: true, data: result.users, meta: result.meta })
})

admin.patch('/users/:userId/role', superuserOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = updateGlobalUserRoleSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const result = await service.updateGlobalUserRole(c.req.param('userId'), actorId, parsed.data)
  return c.json({ success: true, data: result })
})

admin.patch('/tenants/:tenantId/override-subscription', superuserOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = overrideSubscriptionSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const tenant = await service.overrideTenantSubscription(c.req.param('tenantId'), actorId, parsed.data)
  return c.json({ success: true, data: tenant })
})

admin.patch('/tenants/:tenantId/status', superuserOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = updateTenantStatusSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const tenant = await service.updateTenantLifecycleStatus(c.req.param('tenantId'), actorId, parsed.data)
  return c.json({ success: true, data: tenant })
})

admin.post('/deployments/trigger', superuserOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = triggerGlobalDeploymentSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const run = await service.triggerGlobalDeployment(actorId, parsed.data)
  return c.json({ success: true, data: run }, 201)
})

// ── Subscription Plans ─────────────────────────────────────────────────────────
admin.get('/subscription-plans', requirePermission(PERMISSIONS.ORG_READ), async (c) => {
  const result = await service.listPlans()
  return c.json({ success: true, data: result })
})

admin.post('/subscription-plans', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const body = await c.req.json()
  const parsed = createPlanSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const plan = await service.createPlan(actorId, parsed.data)
  return c.json({ success: true, data: plan }, 201)
})

admin.patch('/subscription-plans/:planId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const planId = c.req.param('planId')
  const body = await c.req.json()
  const parsed = updatePlanSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const plan = await service.updatePlan(planId, actorId, parsed.data)
  return c.json({ success: true, data: plan })
})

admin.delete('/subscription-plans/:planId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const planId = c.req.param('planId')
  await service.deletePlan(planId, actorId)
  return c.json({ success: true, data: null })
})

// ── Tenants ────────────────────────────────────────────────────────────────────
admin.get('/tenants', superuserOnly, async (c) => {
  const query = c.req.query()
  const result = await service.listGlobalTenants(query)
  return c.json({ success: true, data: result.tenants, meta: result.meta })
})

admin.post('/tenants', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const body = await c.req.json()
  const parsed = createTenantSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const tenant = await service.createTenant(actorId, parsed.data)
  return c.json({ success: true, data: tenant }, 201)
})

admin.get('/tenants/:tenantId', adminOnly, async (c) => {
  const tenantId = c.req.param('tenantId')
  const tenant = await service.getTenant(tenantId)
  return c.json({ success: true, data: tenant })
})

admin.patch('/tenants/:tenantId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  const body = await c.req.json()
  const parsed = updateTenantSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const tenant = await service.updateTenant(tenantId, actorId, parsed.data)
  return c.json({ success: true, data: tenant })
})

admin.delete('/tenants/:tenantId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  await service.deleteTenant(tenantId, actorId)
  return c.json({ success: true, data: null })
})

// ── Tenant Usage ───────────────────────────────────────────────────────────────
admin.get('/tenants/:tenantId/usage', adminOnly, async (c) => {
  const tenantId = c.req.param('tenantId')
  const query = c.req.query()
  const result = await service.getUsage(tenantId, query)
  return c.json({ success: true, data: result })
})

admin.post('/tenants/:tenantId/usage', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  const body = await c.req.json()
  const parsed = recordUsageSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const record = await service.recordUsage(tenantId, actorId, parsed.data)
  return c.json({ success: true, data: record }, 201)
})

// ── Tenant Roles ───────────────────────────────────────────────────────────────
admin.get('/tenants/:tenantId/roles', adminOnly, async (c) => {
  const tenantId = c.req.param('tenantId')
  const roles = await service.listTenantRoles(tenantId)
  return c.json({ success: true, data: roles })
})

admin.post('/tenants/:tenantId/roles', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  const body = await c.req.json()
  const parsed = createTenantRoleSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const role = await service.createTenantRole(tenantId, actorId, parsed.data)
  return c.json({ success: true, data: role }, 201)
})

admin.patch('/tenants/:tenantId/roles/:roleId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  const roleId = c.req.param('roleId')
  const body = await c.req.json()
  const parsed = updateTenantRoleSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const role = await service.updateTenantRole(tenantId, roleId, actorId, parsed.data)
  return c.json({ success: true, data: role })
})

admin.get('/tenants/:tenantId/user-roles', adminOnly, async (c) => {
  const tenantId = c.req.param('tenantId')
  const assignments = await service.listUserRoles(tenantId)
  return c.json({ success: true, data: assignments })
})

admin.post('/tenants/:tenantId/user-roles', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  const body = await c.req.json()
  const parsed = assignUserRoleSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const assignment = await service.assignUserRole(tenantId, actorId, parsed.data)
  return c.json({ success: true, data: assignment }, 201)
})

// ── Billing ────────────────────────────────────────────────────────────────────
admin.post('/billing/invoices', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const body = await c.req.json()
  const parsed = createInvoiceSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const invoice = await service.createInvoice(actorId, parsed.data)
  return c.json({ success: true, data: invoice }, 201)
})

admin.patch('/billing/invoices/:invoiceId/pay', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const invoiceId = c.req.param('invoiceId')
  const body = await c.req.json()
  const parsed = payInvoiceSchema.safeParse(body)
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const invoice = await service.payInvoice(invoiceId, actorId, parsed.data)
  return c.json({ success: true, data: invoice })
})

admin.get('/billing/invoices/:tenantId', adminOnly, async (c) => {
  const tenantId = c.req.param('tenantId')
  const query = c.req.query()
  const result = await service.listInvoices(tenantId, query)
  return c.json({ success: true, data: result.invoices, meta: result.meta })
})

// ── Feature Gate Check (public-ish, for internal use) ─────────────────────────
admin.get('/feature-gate', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const { feature = '' } = c.req.query()
  const allowed = await service.checkFeatureAccess(organizationId, feature)
  return c.json({ success: true, data: { allowed, feature } })
})

export { admin as adminRoutes }
