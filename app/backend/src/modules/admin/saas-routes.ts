import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createPlanSchema,
  updatePlanSchema,
  createTenantSchema,
  updateTenantSchema,
  createInvoiceSchema,
  payInvoiceSchema,
  recordUsageSchema,
  createTenantRoleSchema,
  updateTenantRoleSchema,
  assignUserRoleSchema,
} from './schema.js'
import * as service from './service.js'

const adminOnly = requirePermission(PERMISSIONS.ORG_WRITE)

export const tenantRoutes = new Hono<AppEnv>()
tenantRoutes.use('*', authMiddleware)

tenantRoutes.get('/', adminOnly, async (c) => {
  const result = await service.listTenants(c.req.query())
  return c.json({ success: true, data: result.tenants, meta: result.meta })
})

tenantRoutes.post('/', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = createTenantSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const tenant = await service.createTenant(actorId, parsed.data)
  return c.json({ success: true, data: tenant }, 201)
})

tenantRoutes.get('/:tenantId', adminOnly, async (c) => {
  const tenant = await service.getTenant(c.req.param('tenantId'))
  return c.json({ success: true, data: tenant })
})

tenantRoutes.patch('/:tenantId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = updateTenantSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const tenant = await service.updateTenant(c.req.param('tenantId'), actorId, parsed.data)
  return c.json({ success: true, data: tenant })
})

tenantRoutes.delete('/:tenantId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  await service.deleteTenant(c.req.param('tenantId'), actorId)
  return c.json({ success: true, data: null })
})

tenantRoutes.get('/:tenantId/usage', adminOnly, async (c) => {
  const result = await service.getUsage(c.req.param('tenantId'), c.req.query())
  return c.json({ success: true, data: result })
})

tenantRoutes.post('/:tenantId/usage', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = recordUsageSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const record = await service.recordUsage(c.req.param('tenantId'), actorId, parsed.data)
  return c.json({ success: true, data: record }, 201)
})

tenantRoutes.get('/:tenantId/roles', adminOnly, async (c) => {
  const roles = await service.listTenantRoles(c.req.param('tenantId'))
  return c.json({ success: true, data: roles })
})

tenantRoutes.post('/:tenantId/roles', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const tenantId = c.req.param('tenantId')
  const parsed = createTenantRoleSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const role = await service.createTenantRole(tenantId, actorId, parsed.data)
  return c.json({ success: true, data: role }, 201)
})

tenantRoutes.patch('/:tenantId/roles/:roleId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = updateTenantRoleSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const role = await service.updateTenantRole(c.req.param('tenantId'), c.req.param('roleId'), actorId, parsed.data)
  return c.json({ success: true, data: role })
})

tenantRoutes.get('/:tenantId/user-roles', adminOnly, async (c) => {
  const assignments = await service.listUserRoles(c.req.param('tenantId'))
  return c.json({ success: true, data: assignments })
})

tenantRoutes.post('/:tenantId/user-roles', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = assignUserRoleSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const assignment = await service.assignUserRole(c.req.param('tenantId'), actorId, parsed.data)
  return c.json({ success: true, data: assignment }, 201)
})

export const subscriptionPlanRoutes = new Hono<AppEnv>()
subscriptionPlanRoutes.use('*', authMiddleware)

subscriptionPlanRoutes.get('/', requirePermission(PERMISSIONS.ORG_READ), async (c) => {
  const result = await service.listPlans()
  return c.json({ success: true, data: result })
})

subscriptionPlanRoutes.post('/', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = createPlanSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const plan = await service.createPlan(actorId, parsed.data)
  return c.json({ success: true, data: plan }, 201)
})

subscriptionPlanRoutes.patch('/:planId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = updatePlanSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const plan = await service.updatePlan(c.req.param('planId'), actorId, parsed.data)
  return c.json({ success: true, data: plan })
})

subscriptionPlanRoutes.delete('/:planId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  await service.deletePlan(c.req.param('planId'), actorId)
  return c.json({ success: true, data: null })
})

export const billingRoutes = new Hono<AppEnv>()
billingRoutes.use('*', authMiddleware)

billingRoutes.post('/create-invoice', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = createInvoiceSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const invoice = await service.createInvoice(actorId, parsed.data)
  return c.json({ success: true, data: invoice }, 201)
})

billingRoutes.patch('/pay-invoice/:invoiceId', adminOnly, async (c) => {
  const { id: actorId } = c.get('user')
  const parsed = payInvoiceSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const invoice = await service.payInvoice(c.req.param('invoiceId'), actorId, parsed.data)
  return c.json({ success: true, data: invoice })
})

billingRoutes.get('/invoices/:tenantId', adminOnly, async (c) => {
  const result = await service.listInvoices(c.req.param('tenantId'), c.req.query())
  return c.json({ success: true, data: result.invoices, meta: result.meta })
})
