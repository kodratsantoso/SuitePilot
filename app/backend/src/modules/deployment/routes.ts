import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createAlertSchema,
  recordMetricSchema,
  rollbackDeploymentSchema,
  triggerDeploymentSchema,
  updateAlertSchema,
} from './schema.js'
import * as service from './service.js'

const deployment = new Hono<AppEnv>()
deployment.use('*', authMiddleware)

const adminOnly = requirePermission(PERMISSIONS.ORG_WRITE)

deployment.get('/overview', adminOnly, async (c) => {
  const { organizationId } = c.get('user')
  const overview = await service.getDeploymentOverview(organizationId)
  return c.json({ success: true, data: overview })
})

deployment.get('/environments', adminOnly, async (c) => {
  const environments = await service.listEnvironments()
  return c.json({ success: true, data: environments })
})

deployment.get('/runs', adminOnly, async (c) => {
  const { organizationId } = c.get('user')
  const runs = await service.listRuns(organizationId, c.req.query())
  return c.json({ success: true, data: runs })
})

deployment.post('/trigger', adminOnly, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const parsed = triggerDeploymentSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const run = await service.triggerDeployment(organizationId, actorId, parsed.data)
  return c.json({ success: true, data: run }, 201)
})

deployment.post('/rollback', adminOnly, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const parsed = rollbackDeploymentSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const run = await service.rollbackDeployment(organizationId, actorId, parsed.data)
  return c.json({ success: true, data: run }, 201)
})

deployment.post('/services/:serviceId/self-heal', adminOnly, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const result = await service.selfHeal(organizationId, actorId, c.req.param('serviceId'))
  return c.json({ success: true, data: result })
})

deployment.get('/health', adminOnly, async (c) => {
  const result = await service.getDeploymentHealth()
  return c.json({ success: result.status === 'healthy', data: result }, result.status === 'healthy' ? 200 : 503)
})

deployment.get('/metrics', adminOnly, async (c) => {
  const metrics = await service.listMetrics(c.req.query())
  return c.json({ success: true, data: metrics })
})

deployment.post('/metrics', adminOnly, async (c) => {
  const parsed = recordMetricSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const metric = await service.recordMetric(parsed.data)
  return c.json({ success: true, data: metric }, 201)
})

deployment.post('/alerts', adminOnly, async (c) => {
  const parsed = createAlertSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const alert = await service.createAlert(parsed.data)
  return c.json({ success: true, data: alert }, 201)
})

deployment.patch('/alerts/:alertId', adminOnly, async (c) => {
  const parsed = updateAlertSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const alert = await service.updateAlert(c.req.param('alertId'), parsed.data)
  return c.json({ success: true, data: alert })
})

export { deployment as deploymentRoutes }
