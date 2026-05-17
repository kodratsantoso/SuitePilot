import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createQuestionSchema, bulkCreateQuestionsSchema } from './schema.js'
import * as discoveryQuestionService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/discovery-sessions/:sessionId/questions
const discoveryQuestions = new Hono<AppEnv>()
discoveryQuestions.use('*', authMiddleware)

discoveryQuestions.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const sessionId = c.req.param('sessionId') as string
  const questions = await discoveryQuestionService.listQuestions(organizationId, sessionId)
  return c.json({ success: true, data: questions })
})

discoveryQuestions.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const sessionId = c.req.param('sessionId') as string
  const body = await c.req.json()
  const parsed = createQuestionSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const question = await discoveryQuestionService.createQuestion(organizationId, sessionId, parsed.data)
  return c.json({ success: true, data: question }, 201)
})

discoveryQuestions.post('/bulk', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const sessionId = c.req.param('sessionId') as string
  const body = await c.req.json()
  const parsed = bulkCreateQuestionsSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const questions = await discoveryQuestionService.bulkCreateQuestions(
    organizationId,
    sessionId,
    parsed.data.questions
  )
  return c.json({ success: true, data: questions }, 201)
})

export { discoveryQuestions as discoveryQuestionRoutes }
