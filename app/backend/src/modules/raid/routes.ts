import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createRaidSchema, updateRaidSchema } from './schema.js'
import * as raidService from './service.js'
import { Errors } from '../../lib/errors.js'

const raid = new Hono<AppEnv>()
raid.use('*', authMiddleware)

raid.get('/', requirePermission(PERMISSIONS.RAID_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await raidService.listRaidItems(organizationId, projectId, query)
  return c.json({ success: true, data: result.items, meta: result.meta })
})

raid.get('/:raidId', requirePermission(PERMISSIONS.RAID_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const raidId = c.req.param('raidId')
  const item = await raidService.getRaidItem(organizationId, projectId, raidId)
  return c.json({ success: true, data: item })
})

raid.post('/', requirePermission(PERMISSIONS.RAID_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createRaidSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const item = await raidService.createRaidItem(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: item }, 201)
})

raid.patch('/:raidId', requirePermission(PERMISSIONS.RAID_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const raidId = c.req.param('raidId')
  const body = await c.req.json()
  const parsed = updateRaidSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const item = await raidService.updateRaidItem(organizationId, projectId, raidId, actorId, parsed.data)
  return c.json({ success: true, data: item })
})

raid.delete('/:raidId', requirePermission(PERMISSIONS.RAID_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const raidId = c.req.param('raidId')
  await raidService.deleteRaidItem(organizationId, projectId, raidId, actorId)
  return c.json({ success: true, data: { message: 'RAID item deleted' } })
})

export { raid as raidRoutes }
