import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import * as orgService from './service.js'

const organizations = new Hono<AppEnv>()

organizations.use('*', authMiddleware)

organizations.get('/current', async (c) => {
  const { organizationId } = c.get('user')
  const org = await orgService.getOrganization(organizationId)
  return c.json({ success: true, data: org })
})

organizations.patch('/current', requirePermission(PERMISSIONS.ORG_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json<{ name?: string }>()
  const updated = await orgService.updateOrganization(organizationId, actorId, body)
  return c.json({ success: true, data: updated })
})

organizations.get('/current/members', async (c) => {
  const { organizationId } = c.get('user')
  const members = await orgService.listOrganizationMembers(organizationId)
  return c.json({ success: true, data: members })
})

export { organizations as organizationRoutes }
