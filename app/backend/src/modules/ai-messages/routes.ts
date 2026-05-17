import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createMessageSchema } from './schema.js'
import * as messageService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/ai/conversations/:conversationId/messages
const messages = new Hono<AppEnv & { Variables: { conversationId: string } }>()
messages.use('*', authMiddleware)

messages.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const conversationId = c.req.param('conversationId') as string
  const query = c.req.query()
  const result = await messageService.listMessages(organizationId, conversationId, query)
  return c.json({ success: true, data: result.messages, meta: result.meta })
})

messages.post('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const conversationId = c.req.param('conversationId') as string
  const body = await c.req.json()
  const parsed = createMessageSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const message = await messageService.createMessage(organizationId, conversationId, parsed.data)
  return c.json({ success: true, data: message }, 201)
})

export { messages as aiMessageRoutes }
