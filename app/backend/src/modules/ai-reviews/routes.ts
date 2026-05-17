import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createReviewSchema } from './schema.js'
import * as reviewService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/ai/generated-outputs/:outputId/reviews
const reviews = new Hono<AppEnv & { Variables: { projectId: string; outputId: string } }>()
reviews.use('*', authMiddleware)

reviews.post('/', requirePermission(PERMISSIONS.AI_REVIEW), async (c) => {
  const { organizationId, id: reviewerId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const outputId = c.req.param('outputId') as string
  const body = await c.req.json()
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const review = await reviewService.createReview(organizationId, projectId, outputId, reviewerId, parsed.data)
  return c.json({ success: true, data: review }, 201)
})

export { reviews as aiReviewRoutes }
