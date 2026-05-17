import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createMilestoneSchema, updateMilestoneSchema } from './schema.js'
import * as milestoneService from './service.js'
import { Errors } from '../../lib/errors.js'

const milestones = new Hono<AppEnv>()
milestones.use('*', authMiddleware)

milestones.get('/', requirePermission(PERMISSIONS.MILESTONE_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const items = await milestoneService.listMilestones(organizationId, projectId)
  return c.json({ success: true, data: items })
})

milestones.get('/:milestoneId', requirePermission(PERMISSIONS.MILESTONE_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const milestoneId = c.req.param('milestoneId')
  const milestone = await milestoneService.getMilestone(organizationId, projectId, milestoneId)
  return c.json({ success: true, data: milestone })
})

milestones.post('/', requirePermission(PERMISSIONS.MILESTONE_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createMilestoneSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const milestone = await milestoneService.createMilestone(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: milestone }, 201)
})

milestones.patch('/:milestoneId', requirePermission(PERMISSIONS.MILESTONE_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const milestoneId = c.req.param('milestoneId')
  const body = await c.req.json()
  const parsed = updateMilestoneSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const milestone = await milestoneService.updateMilestone(organizationId, projectId, milestoneId, actorId, parsed.data)
  return c.json({ success: true, data: milestone })
})

milestones.delete('/:milestoneId', requirePermission(PERMISSIONS.MILESTONE_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const milestoneId = c.req.param('milestoneId')
  await milestoneService.deleteMilestone(organizationId, projectId, milestoneId, actorId)
  return c.json({ success: true, data: { message: 'Milestone deleted' } })
})

export { milestones as milestoneRoutes }
