import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createOutputSchema, updateOutputSchema } from './schema.js'
import * as outputService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/ai/generated-outputs
const outputs = new Hono<AppEnv & { Variables: { projectId: string } }>()
outputs.use('*', authMiddleware)

outputs.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await outputService.listOutputs(organizationId, projectId, query)
  return c.json({ success: true, data: result.outputs, meta: result.meta })
})

outputs.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createOutputSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const output = await outputService.createOutput(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: output }, 201)
})

outputs.get('/:outputId', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const outputId = c.req.param('outputId')
  const output = await outputService.getOutput(organizationId, projectId, outputId)
  return c.json({ success: true, data: output })
})

outputs.patch('/:outputId', requirePermission(PERMISSIONS.AI_REVIEW), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const outputId = c.req.param('outputId')
  const body = await c.req.json()
  const parsed = updateOutputSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const output = await outputService.updateOutput(organizationId, projectId, outputId, actorId, parsed.data)
  return c.json({ success: true, data: output })
})

export { outputs as aiGeneratedOutputRoutes }
