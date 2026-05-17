import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createWorkstreamSchema,
  updateWorkstreamSchema,
  createBusinessProcessSchema,
  updateBusinessProcessSchema,
  createProcessStepSchema,
  runFitGapSchema,
  runUatGenerationSchema,
  runSopGenerationSchema,
  updateUatScenarioSchema,
  updateSopSchema,
  createDeliverableSchema,
} from './schema.js'
import * as service from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId
const functionalDelivery = new Hono<AppEnv>()
functionalDelivery.use('*', authMiddleware)

// ── Workstreams ────────────────────────────────────────────────────────────────

functionalDelivery.get(
  '/workstreams',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const workstreams = await service.listWorkstreams(organizationId, projectId)
    return c.json({ success: true, data: workstreams })
  }
)

functionalDelivery.post(
  '/workstreams',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createWorkstreamSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const workstream = await service.createWorkstream(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: workstream }, 201)
  }
)

functionalDelivery.patch(
  '/workstreams/:workstreamId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const workstreamId = c.req.param('workstreamId')
    const body = await c.req.json()
    const parsed = updateWorkstreamSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const workstream = await service.updateWorkstream(
      organizationId,
      projectId,
      workstreamId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: workstream })
  }
)

// ── Business Processes ─────────────────────────────────────────────────────────

functionalDelivery.get(
  '/processes',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listProcesses(organizationId, projectId, query)
    return c.json({ success: true, data: result.processes, meta: result.meta })
  }
)

functionalDelivery.post(
  '/processes',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createBusinessProcessSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const process = await service.createProcess(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: process }, 201)
  }
)

functionalDelivery.get(
  '/processes/:processId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const processId = c.req.param('processId')
    const process = await service.getProcess(organizationId, projectId, processId)
    return c.json({ success: true, data: process })
  }
)

functionalDelivery.patch(
  '/processes/:processId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const processId = c.req.param('processId')
    const body = await c.req.json()
    const parsed = updateBusinessProcessSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const process = await service.updateProcess(organizationId, projectId, processId, actorId, parsed.data)
    return c.json({ success: true, data: process })
  }
)

functionalDelivery.post(
  '/processes/:processId/steps',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const processId = c.req.param('processId')
    const body = await c.req.json()
    const parsed = createProcessStepSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const step = await service.createProcessStep(organizationId, projectId, processId, parsed.data)
    return c.json({ success: true, data: step }, 201)
  }
)

// ── AI Fit-Gap Analysis ────────────────────────────────────────────────────────

functionalDelivery.post(
  '/ai/generate-fit-gap',
  requirePermission(PERMISSIONS.AI_INVOKE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = runFitGapSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const result = await service.runFitGapAnalysis(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: result }, 201)
  }
)

functionalDelivery.get(
  '/fit-gap-analysis',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listFitGapAnalyses(organizationId, projectId, query)
    return c.json({ success: true, data: result.analyses, meta: result.meta })
  }
)

// ── AI UAT Generation ──────────────────────────────────────────────────────────

functionalDelivery.post(
  '/ai/generate-uat',
  requirePermission(PERMISSIONS.AI_INVOKE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = runUatGenerationSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const result = await service.runUatGeneration(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: result }, 201)
  }
)

functionalDelivery.get(
  '/uat-scenarios',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listUatScenarios(organizationId, projectId, query)
    return c.json({ success: true, data: result.scenarios, meta: result.meta })
  }
)

functionalDelivery.patch(
  '/uat-scenarios/:scenarioId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const scenarioId = c.req.param('scenarioId')
    const body = await c.req.json()
    const parsed = updateUatScenarioSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const scenario = await service.updateUatScenario(
      organizationId,
      projectId,
      scenarioId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: scenario })
  }
)

// ── AI SOP Generation ──────────────────────────────────────────────────────────

functionalDelivery.post(
  '/ai/generate-sop',
  requirePermission(PERMISSIONS.AI_INVOKE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = runSopGenerationSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const sop = await service.runSopGeneration(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: sop }, 201)
  }
)

functionalDelivery.get(
  '/sop-documents',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listSopDocuments(organizationId, projectId, query)
    return c.json({ success: true, data: result.sops, meta: result.meta })
  }
)

functionalDelivery.patch(
  '/sop-documents/:sopId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const sopId = c.req.param('sopId')
    const body = await c.req.json()
    const parsed = updateSopSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const sop = await service.updateSopDocument(organizationId, projectId, sopId, actorId, parsed.data)
    return c.json({ success: true, data: sop })
  }
)

// ── Functional Deliverables ────────────────────────────────────────────────────

functionalDelivery.get(
  '/functional-deliverables',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listDeliverables(organizationId, projectId, query)
    return c.json({ success: true, data: result.deliverables, meta: result.meta })
  }
)

functionalDelivery.post(
  '/functional-deliverables',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createDeliverableSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const deliverable = await service.createDeliverable(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: deliverable }, 201)
  }
)

export { functionalDelivery as functionalDeliveryRoutes }
