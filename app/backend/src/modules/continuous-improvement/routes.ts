import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createFeedbackSchema,
  createRecommendationSchema,
  updateRecommendationSchema,
} from './schema.js'
import * as service from './service.js'

// Mounted at /api/projects/:projectId/continuous-improvement
const ci = new Hono<AppEnv & { Variables: { projectId: string } }>()
ci.use('*', authMiddleware)

// ── Summary ────────────────────────────────────────────────────────────────────
ci.get(
  '/',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const result = await service.getContinuousImprovementSummary(organizationId, projectId)
    return c.json({ success: true, data: result })
  }
)

// ── Feedback ───────────────────────────────────────────────────────────────────
ci.get(
  '/feedback',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const query = c.req.query()
    const result = await service.listFeedback(organizationId, projectId, query)
    return c.json({ success: true, data: result.entries, meta: result.meta })
  }
)

ci.post(
  '/feedback',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const body = await c.req.json()
    const parsed = createFeedbackSchema.safeParse(body)
    if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
    const entry = await service.createFeedback(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: entry }, 201)
  }
)

// ── Recommendations ────────────────────────────────────────────────────────────
ci.get(
  '/recommendations',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const query = c.req.query()
    const result = await service.listRecommendations(organizationId, projectId, query)
    return c.json({ success: true, data: result.items, meta: result.meta })
  }
)

ci.post(
  '/recommendations',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const body = await c.req.json()
    const parsed = createRecommendationSchema.safeParse(body)
    if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
    const rec = await service.createRecommendation(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: rec }, 201)
  }
)

ci.patch(
  '/recommendations/:recommendationId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const recommendationId = c.req.param('recommendationId')
    const body = await c.req.json()
    const parsed = updateRecommendationSchema.safeParse(body)
    if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
    const rec = await service.updateRecommendation(organizationId, projectId, recommendationId, actorId, parsed.data)
    return c.json({ success: true, data: rec })
  }
)

// ── Optimization Scores ────────────────────────────────────────────────────────
ci.get(
  '/scores',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const result = await service.getOptimizationScores(organizationId, projectId)
    return c.json({ success: true, data: result })
  }
)

// ── Trends ─────────────────────────────────────────────────────────────────────
ci.get(
  '/trends',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId')!
    const { metricType, timeRange = '30' } = c.req.query()
    const result = await service.getOptimizationTrends(
      organizationId,
      projectId,
      metricType || undefined,
      parseInt(timeRange, 10)
    )
    return c.json({ success: true, data: result })
  }
)

export { ci as continuousImprovementRoutes }
