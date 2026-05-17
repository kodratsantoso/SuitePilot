import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createConversationSchema, updateConversationSchema } from './schema.js'
import * as conversationService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/ai/conversations
const conversations = new Hono<AppEnv & { Variables: { projectId: string } }>()
conversations.use('*', authMiddleware)

conversations.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await conversationService.listConversations(organizationId, projectId, query)
  return c.json({ success: true, data: result.conversations, meta: result.meta })
})

conversations.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createConversationSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const conversation = await conversationService.createConversation(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: conversation }, 201)
})

conversations.get('/:conversationId', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const conversationId = c.req.param('conversationId')
  const conversation = await conversationService.getConversation(organizationId, projectId, conversationId)
  return c.json({ success: true, data: conversation })
})

conversations.patch('/:conversationId', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const conversationId = c.req.param('conversationId')
  const body = await c.req.json()
  const parsed = updateConversationSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const conversation = await conversationService.updateConversation(organizationId, projectId, conversationId, actorId, parsed.data)
  return c.json({ success: true, data: conversation })
})

export { conversations as aiConversationRoutes }
