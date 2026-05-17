import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import * as auditService from './service.js'

const auditLogs = new Hono<AppEnv>()
auditLogs.use('*', authMiddleware, requirePermission(PERMISSIONS.AUDIT_READ))

// Global audit log — org-scoped
auditLogs.get('/', async (c) => {
  const { organizationId } = c.get('user')
  const query = c.req.query()
  const result = await auditService.listAuditLogs(organizationId, query)
  return c.json({ success: true, data: result.logs, meta: result.meta })
})

export { auditLogs as auditRoutes }
