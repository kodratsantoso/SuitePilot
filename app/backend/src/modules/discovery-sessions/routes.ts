import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createDiscoverySessionSchema, updateDiscoverySessionSchema } from './schema.js'
import * as discoverySessionService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/discovery-sessions
const discoverySessions = new Hono<AppEnv>()
discoverySessions.use('*', authMiddleware)

discoverySessions.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await discoverySessionService.listDiscoverySessions(organizationId, projectId, query)
  return c.json({ success: true, data: result.sessions, meta: result.meta })
})

discoverySessions.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createDiscoverySessionSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const session = await discoverySessionService.createDiscoverySession(
    organizationId,
    projectId,
    actorId,
    parsed.data
  )
  return c.json({ success: true, data: session }, 201)
})

discoverySessions.get('/:sessionId', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const sessionId = c.req.param('sessionId')
  const session = await discoverySessionService.getDiscoverySession(organizationId, projectId, sessionId)
  return c.json({ success: true, data: session })
})

discoverySessions.patch('/:sessionId', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json()
  const parsed = updateDiscoverySessionSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const session = await discoverySessionService.updateDiscoverySession(
    organizationId,
    projectId,
    sessionId,
    actorId,
    parsed.data
  )
  return c.json({ success: true, data: session })
})

discoverySessions.delete('/:sessionId', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const sessionId = c.req.param('sessionId')
  await discoverySessionService.deleteDiscoverySession(organizationId, projectId, sessionId, actorId)
  return c.json({ success: true, data: { message: 'DiscoverySession deleted' } })
})

export { discoverySessions as discoverySessionRoutes }
