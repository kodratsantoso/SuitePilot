import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import * as activityService from './service.js'

const activity = new Hono<AppEnv>()
activity.use('*', authMiddleware)

activity.get('/', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await activityService.listProjectActivity(organizationId, projectId, query)
  return c.json({ success: true, data: result.items, meta: result.meta })
})

export { activity as activityRoutes }
