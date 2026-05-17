import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createHypercareTaskSchema,
  updateHypercareTaskSchema,
  createIssueSchema,
  updateIssueSchema,
  updateGoLiveItemSchema,
  bulkCreateGoLiveSchema,
  createChangeRequestSchema,
  updateChangeRequestSchema,
  createRiskSchema,
  updateRiskSchema,
} from './schema.js'
import * as service from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/hypercare
const hypercare = new Hono<AppEnv>()
hypercare.use('*', authMiddleware)

// ── Hypercare Tasks ────────────────────────────────────────────────────────────

hypercare.get(
  '/tasks',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listHypercareTasks(organizationId, projectId, query)
    return c.json({ success: true, data: result.tasks, meta: result.meta })
  }
)

hypercare.post(
  '/tasks',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createHypercareTaskSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const task = await service.createHypercareTask(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: task }, 201)
  }
)

hypercare.patch(
  '/tasks/:taskId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const taskId = c.req.param('taskId')
    const body = await c.req.json()
    const parsed = updateHypercareTaskSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const task = await service.updateHypercareTask(organizationId, projectId, taskId, actorId, parsed.data)
    return c.json({ success: true, data: task })
  }
)

hypercare.delete(
  '/tasks/:taskId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const taskId = c.req.param('taskId')
    await service.deleteHypercareTask(organizationId, projectId, taskId, actorId)
    return c.json({ success: true, data: null })
  }
)

// ── Issues ─────────────────────────────────────────────────────────────────────

hypercare.get(
  '/issues',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listIssues(organizationId, projectId, query)
    return c.json({ success: true, data: result.issues, meta: result.meta })
  }
)

hypercare.post(
  '/issues',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createIssueSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const issue = await service.createIssue(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: issue }, 201)
  }
)

hypercare.patch(
  '/issues/:issueId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const issueId = c.req.param('issueId')
    const body = await c.req.json()
    const parsed = updateIssueSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const issue = await service.updateIssue(organizationId, projectId, issueId, actorId, parsed.data)
    return c.json({ success: true, data: issue })
  }
)

hypercare.delete(
  '/issues/:issueId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const issueId = c.req.param('issueId')
    await service.deleteIssue(organizationId, projectId, issueId, actorId)
    return c.json({ success: true, data: null })
  }
)

// ── Go-Live Readiness ──────────────────────────────────────────────────────────

hypercare.get(
  '/go-live',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const items = await service.listGoLiveItems(organizationId, projectId, query)
    return c.json({ success: true, data: items })
  }
)

hypercare.post(
  '/go-live/bulk',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = bulkCreateGoLiveSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const items = await service.bulkCreateGoLiveItems(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: items }, 201)
  }
)

hypercare.patch(
  '/go-live/:itemId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const itemId = c.req.param('itemId')
    const body = await c.req.json()
    const parsed = updateGoLiveItemSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const item = await service.updateGoLiveItem(organizationId, projectId, itemId, actorId, parsed.data)
    return c.json({ success: true, data: item })
  }
)

// ── Change Requests ────────────────────────────────────────────────────────────

hypercare.get(
  '/change-requests',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listChangeRequests(organizationId, projectId, query)
    return c.json({ success: true, data: result.changeRequests, meta: result.meta })
  }
)

hypercare.post(
  '/change-requests',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createChangeRequestSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const changeRequest = await service.createChangeRequest(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: changeRequest }, 201)
  }
)

hypercare.patch(
  '/change-requests/:changeId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const changeId = c.req.param('changeId')
    const body = await c.req.json()
    const parsed = updateChangeRequestSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const changeRequest = await service.updateChangeRequest(
      organizationId,
      projectId,
      changeId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: changeRequest })
  }
)

// ── Post-Implementation Risks ──────────────────────────────────────────────────

hypercare.get(
  '/risks',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listRisks(organizationId, projectId, query)
    return c.json({ success: true, data: result.risks, meta: result.meta })
  }
)

hypercare.post(
  '/risks',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createRiskSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const risk = await service.createRisk(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: risk }, 201)
  }
)

hypercare.patch(
  '/risks/:riskId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const riskId = c.req.param('riskId')
    const body = await c.req.json()
    const parsed = updateRiskSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const risk = await service.updateRisk(organizationId, projectId, riskId, actorId, parsed.data)
    return c.json({ success: true, data: risk })
  }
)

export { hypercare as hypercareRoutes }
