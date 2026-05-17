import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createGovernanceEventSchema,
  createValidationSchema,
  createReviewGateSchema,
  updateReviewGateSchema,
} from './schema.js'
import * as service from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/governance
const governance = new Hono<AppEnv>()
governance.use('*', authMiddleware)

// ── Governance Events ──────────────────────────────────────────────────────────

governance.get(
  '/events',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listGovernanceEvents(organizationId, projectId, query)
    return c.json({ success: true, data: result.events, meta: result.meta })
  }
)

governance.post(
  '/events',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createGovernanceEventSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const event = await service.createGovernanceEvent(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: event }, 201)
  }
)

// ── Output Validations ─────────────────────────────────────────────────────────

governance.get(
  '/validations',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listValidations(organizationId, projectId, query)
    return c.json({ success: true, data: result.validations, meta: result.meta })
  }
)

governance.post(
  '/validations',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createValidationSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const validation = await service.createValidation(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: validation }, 201)
  }
)

// ── Review Gates ───────────────────────────────────────────────────────────────

governance.get(
  '/review-gates',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listReviewGates(organizationId, projectId, query)
    return c.json({ success: true, data: result.gates, meta: result.meta })
  }
)

governance.post(
  '/review-gates',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createReviewGateSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const gate = await service.createReviewGate(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: gate }, 201)
  }
)

governance.patch(
  '/review-gates/:gateId',
  requirePermission(PERMISSIONS.AI_REVIEW),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const gateId = c.req.param('gateId')
    const body = await c.req.json()
    const parsed = updateReviewGateSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const gate = await service.updateReviewGate(organizationId, projectId, gateId, actorId, parsed.data)
    return c.json({ success: true, data: gate })
  }
)

// ── RAG Status (computed) ──────────────────────────────────────────────────────

governance.get(
  '/rag-status',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const result = await service.getProjectRagStatus(organizationId, projectId)
    return c.json({ success: true, data: result })
  }
)

export { governance as governanceRoutes }
