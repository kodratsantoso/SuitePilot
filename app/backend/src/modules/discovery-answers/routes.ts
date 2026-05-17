import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createAnswerSchema } from './schema.js'
import * as discoveryAnswerService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/discovery-sessions/:sessionId/answers
const discoveryAnswers = new Hono<AppEnv>()
discoveryAnswers.use('*', authMiddleware)

discoveryAnswers.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const sessionId = c.req.param('sessionId') as string
  const answers = await discoveryAnswerService.listAnswers(organizationId, sessionId)
  return c.json({ success: true, data: answers })
})

discoveryAnswers.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const sessionId = c.req.param('sessionId') as string
  const body = await c.req.json()
  const parsed = createAnswerSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const answer = await discoveryAnswerService.createOrUpdateAnswer(
    organizationId,
    sessionId,
    actorId,
    parsed.data
  )
  return c.json({ success: true, data: answer }, 201)
})

export { discoveryAnswers as discoveryAnswerRoutes }
