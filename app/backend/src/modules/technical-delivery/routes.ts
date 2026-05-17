import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  createTechnicalWorkstreamSchema,
  updateTechnicalWorkstreamSchema,
  createIntegrationMappingSchema,
  updateIntegrationMappingSchema,
  createRestletDesignSchema,
  updateRestletDesignSchema,
  createApiContractSchema,
  updateApiContractSchema,
  createPayloadValidationSchema,
  updatePayloadValidationSchema,
  createTechnicalDeliverableSchema,
} from './schema.js'
import * as service from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId
const technicalDelivery = new Hono<AppEnv>()
technicalDelivery.use('*', authMiddleware)

// ── Technical Workstreams ──────────────────────────────────────────────────────

technicalDelivery.get(
  '/technical-workstreams',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const workstreams = await service.listTechnicalWorkstreams(organizationId, projectId)
    return c.json({ success: true, data: workstreams })
  }
)

technicalDelivery.post(
  '/technical-workstreams',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createTechnicalWorkstreamSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const workstream = await service.createTechnicalWorkstream(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: workstream }, 201)
  }
)

technicalDelivery.patch(
  '/technical-workstreams/:workstreamId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const workstreamId = c.req.param('workstreamId')
    const body = await c.req.json()
    const parsed = updateTechnicalWorkstreamSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const workstream = await service.updateTechnicalWorkstream(
      organizationId,
      projectId,
      workstreamId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: workstream })
  }
)

// ── Integration Mappings ───────────────────────────────────────────────────────

technicalDelivery.get(
  '/integration-mappings',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listIntegrationMappings(organizationId, projectId, query)
    return c.json({ success: true, data: result.mappings, meta: result.meta })
  }
)

technicalDelivery.post(
  '/integration-mappings',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createIntegrationMappingSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const mapping = await service.createIntegrationMapping(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: mapping }, 201)
  }
)

technicalDelivery.get(
  '/integration-mappings/:mappingId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const mappingId = c.req.param('mappingId')
    const mapping = await service.getIntegrationMapping(organizationId, projectId, mappingId)
    return c.json({ success: true, data: mapping })
  }
)

technicalDelivery.patch(
  '/integration-mappings/:mappingId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const mappingId = c.req.param('mappingId')
    const body = await c.req.json()
    const parsed = updateIntegrationMappingSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const mapping = await service.updateIntegrationMapping(
      organizationId,
      projectId,
      mappingId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: mapping })
  }
)

// ── Restlet Designs ────────────────────────────────────────────────────────────

technicalDelivery.get(
  '/restlet-designs',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listRestletDesigns(organizationId, projectId, query)
    return c.json({ success: true, data: result.restlets, meta: result.meta })
  }
)

technicalDelivery.post(
  '/restlet-designs',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createRestletDesignSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const restlet = await service.createRestletDesign(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: restlet }, 201)
  }
)

technicalDelivery.get(
  '/restlet-designs/:restletId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const restletId = c.req.param('restletId')
    const restlet = await service.getRestletDesign(organizationId, projectId, restletId)
    return c.json({ success: true, data: restlet })
  }
)

technicalDelivery.patch(
  '/restlet-designs/:restletId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const restletId = c.req.param('restletId')
    const body = await c.req.json()
    const parsed = updateRestletDesignSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const restlet = await service.updateRestletDesign(
      organizationId,
      projectId,
      restletId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: restlet })
  }
)

// ── API Contracts ──────────────────────────────────────────────────────────────

technicalDelivery.get(
  '/api-contracts',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listApiContracts(organizationId, projectId, query)
    return c.json({ success: true, data: result.contracts, meta: result.meta })
  }
)

technicalDelivery.post(
  '/api-contracts',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createApiContractSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const contract = await service.createApiContract(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: contract }, 201)
  }
)

technicalDelivery.get(
  '/api-contracts/:contractId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const contractId = c.req.param('contractId')
    const contract = await service.getApiContract(organizationId, projectId, contractId)
    return c.json({ success: true, data: contract })
  }
)

technicalDelivery.patch(
  '/api-contracts/:contractId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const contractId = c.req.param('contractId')
    const body = await c.req.json()
    const parsed = updateApiContractSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const contract = await service.updateApiContract(
      organizationId,
      projectId,
      contractId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: contract })
  }
)

// ── Payload Validations ────────────────────────────────────────────────────────

technicalDelivery.get(
  '/payload-validations',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listPayloadValidations(organizationId, projectId, query)
    return c.json({ success: true, data: result.validations, meta: result.meta })
  }
)

technicalDelivery.post(
  '/payload-validations',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createPayloadValidationSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const validation = await service.createPayloadValidation(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: validation }, 201)
  }
)

technicalDelivery.get(
  '/payload-validations/:validationId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const validationId = c.req.param('validationId')
    const validation = await service.getPayloadValidation(organizationId, projectId, validationId)
    return c.json({ success: true, data: validation })
  }
)

technicalDelivery.patch(
  '/payload-validations/:validationId',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const validationId = c.req.param('validationId')
    const body = await c.req.json()
    const parsed = updatePayloadValidationSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const validation = await service.updatePayloadValidation(
      organizationId,
      projectId,
      validationId,
      actorId,
      parsed.data
    )
    return c.json({ success: true, data: validation })
  }
)

// ── Technical Deliverables ─────────────────────────────────────────────────────

technicalDelivery.get(
  '/technical-deliverables',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const query = c.req.query()
    const result = await service.listTechnicalDeliverables(organizationId, projectId, query)
    return c.json({ success: true, data: result.deliverables, meta: result.meta })
  }
)

technicalDelivery.post(
  '/technical-deliverables',
  requirePermission(PERMISSIONS.PROJECT_WRITE),
  async (c) => {
    const { organizationId, id: actorId } = c.get('user')
    const projectId = c.req.param('projectId') as string
    const body = await c.req.json()
    const parsed = createTechnicalDeliverableSchema.safeParse(body)
    if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
    const deliverable = await service.createTechnicalDeliverable(organizationId, projectId, actorId, parsed.data)
    return c.json({ success: true, data: deliverable }, 201)
  }
)

export { technicalDelivery as technicalDeliveryRoutes }
