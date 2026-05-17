import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createPainPointSchema } from './schema.js'
import * as painPointService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/pain-points
const painPoints = new Hono<AppEnv>()
painPoints.use('*', authMiddleware)

painPoints.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await painPointService.listPainPoints(organizationId, projectId, query)
  return c.json({ success: true, data: result.painPoints, meta: result.meta })
})

painPoints.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createPainPointSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const painPoint = await painPointService.createPainPoint(
    organizationId,
    projectId,
    actorId,
    parsed.data
  )
  return c.json({ success: true, data: painPoint }, 201)
})

export { painPoints as painPointRoutes }
