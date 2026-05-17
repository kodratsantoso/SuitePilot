import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createRequirementSchema } from './schema.js'
import * as requirementService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/requirements
const requirements = new Hono<AppEnv>()
requirements.use('*', authMiddleware)

requirements.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await requirementService.listRequirements(organizationId, projectId, query)
  return c.json({ success: true, data: result.requirements, meta: result.meta })
})

requirements.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createRequirementSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const requirement = await requirementService.createRequirement(
    organizationId,
    projectId,
    actorId,
    parsed.data
  )
  return c.json({ success: true, data: requirement }, 201)
})

export { requirements as requirementRoutes }
