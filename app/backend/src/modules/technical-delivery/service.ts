import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import type {
  CreateTechnicalWorkstreamInput,
  UpdateTechnicalWorkstreamInput,
  CreateIntegrationMappingInput,
  UpdateIntegrationMappingInput,
  CreateRestletDesignInput,
  UpdateRestletDesignInput,
  CreateApiContractInput,
  UpdateApiContractInput,
  CreatePayloadValidationInput,
  UpdatePayloadValidationInput,
  CreateTechnicalDeliverableInput,
} from './schema.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

// ── Technical Workstreams ──────────────────────────────────────────────────────

export async function listTechnicalWorkstreams(organizationId: string, projectId: string) {
  await validateProjectAccess(organizationId, projectId)

  const workstreams = await prisma.technicalWorkstream.findMany({
    where: { projectId, organizationId },
    include: {
      owner: { select: { id: true, name: true } },
      _count: {
        select: {
          technicalDeliverables: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  })

  return workstreams
}

export async function createTechnicalWorkstream(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateTechnicalWorkstreamInput
) {
  await validateProjectAccess(organizationId, projectId)

  const workstream = await prisma.technicalWorkstream.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
    include: {
      owner: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'TechnicalWorkstream',
    entityId: workstream.id,
    action: 'CREATE',
    afterData: { name: workstream.name, status: workstream.status },
  })

  return workstream
}

export async function updateTechnicalWorkstream(
  organizationId: string,
  projectId: string,
  workstreamId: string,
  actorId: string,
  input: UpdateTechnicalWorkstreamInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.technicalWorkstream.findFirst({
    where: { id: workstreamId, projectId },
  })
  if (!existing) throw Errors.notFound('TechnicalWorkstream')

  const workstream = await prisma.technicalWorkstream.update({
    where: { id: workstreamId },
    data: { ...input, updatedAt: new Date() },
    include: {
      owner: { select: { id: true, name: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'TechnicalWorkstream',
    entityId: workstreamId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: workstream.status },
  })

  return workstream
}

// ── Integration Mappings ───────────────────────────────────────────────────────

export async function listIntegrationMappings(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; integrationMethod?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.integrationMethod && { integrationMethod: query.integrationMethod as any }),
  }

  const [total, mappings] = await prisma.$transaction([
    prisma.integrationMapping.count({ where }),
    prisma.integrationMapping.findMany({
      where,
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      skip,
      take: perPage,
    }),
  ])

  return { mappings, meta: paginationMeta(total, page, perPage) }
}

export async function getIntegrationMapping(
  organizationId: string,
  projectId: string,
  mappingId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const mapping = await prisma.integrationMapping.findFirst({
    where: { id: mappingId, projectId },
  })

  if (!mapping) throw Errors.notFound('IntegrationMapping')
  return mapping
}

export async function createIntegrationMapping(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateIntegrationMappingInput
) {
  await validateProjectAccess(organizationId, projectId)

  const mapping = await prisma.integrationMapping.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'IntegrationMapping',
    entityId: mapping.id,
    action: 'CREATE',
    afterData: { name: mapping.name, sourceSystem: mapping.sourceSystem, targetSystem: mapping.targetSystem },
  })

  return mapping
}

export async function updateIntegrationMapping(
  organizationId: string,
  projectId: string,
  mappingId: string,
  actorId: string,
  input: UpdateIntegrationMappingInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.integrationMapping.findFirst({
    where: { id: mappingId, projectId },
  })
  if (!existing) throw Errors.notFound('IntegrationMapping')

  const updates: any = { ...input, updatedAt: new Date() }
  if (input.dataFlowNotes !== undefined || input.assumptions !== undefined) {
    updates.version = { increment: 1 }
  }

  const mapping = await prisma.integrationMapping.update({
    where: { id: mappingId },
    data: updates,
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'IntegrationMapping',
    entityId: mappingId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: mapping.status },
  })

  return mapping
}

// ── Restlet Designs ────────────────────────────────────────────────────────────

export async function listRestletDesigns(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; method?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.method && { method: query.method as any }),
  }

  const [total, restlets] = await prisma.$transaction([
    prisma.restletDesign.count({ where }),
    prisma.restletDesign.findMany({
      where,
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      skip,
      take: perPage,
    }),
  ])

  return { restlets, meta: paginationMeta(total, page, perPage) }
}

export async function getRestletDesign(
  organizationId: string,
  projectId: string,
  restletId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const restlet = await prisma.restletDesign.findFirst({
    where: { id: restletId, projectId },
  })

  if (!restlet) throw Errors.notFound('RestletDesign')
  return restlet
}

export async function createRestletDesign(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateRestletDesignInput
) {
  await validateProjectAccess(organizationId, projectId)

  const restlet = await prisma.restletDesign.create({
    data: {
      ...input,
      projectId,
      organizationId,
      requestSchema: input.requestSchema as any,
      responseSchema: input.responseSchema as any,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'RestletDesign',
    entityId: restlet.id,
    action: 'CREATE',
    afterData: { name: restlet.name, method: restlet.method },
  })

  return restlet
}

export async function updateRestletDesign(
  organizationId: string,
  projectId: string,
  restletId: string,
  actorId: string,
  input: UpdateRestletDesignInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.restletDesign.findFirst({
    where: { id: restletId, projectId },
  })
  if (!existing) throw Errors.notFound('RestletDesign')

  const updates: any = {
    ...input,
    requestSchema: input.requestSchema !== undefined ? (input.requestSchema as any) : undefined,
    responseSchema: input.responseSchema !== undefined ? (input.responseSchema as any) : undefined,
    updatedAt: new Date(),
  }
  if (input.requestSchema !== undefined || input.responseSchema !== undefined) {
    updates.version = { increment: 1 }
  }

  const restlet = await prisma.restletDesign.update({
    where: { id: restletId },
    data: updates,
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'RestletDesign',
    entityId: restletId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: restlet.status },
  })

  return restlet
}

// ── API Contracts ──────────────────────────────────────────────────────────────

export async function listApiContracts(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; method?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.method && { method: query.method as any }),
  }

  const [total, contracts] = await prisma.$transaction([
    prisma.apiContract.count({ where }),
    prisma.apiContract.findMany({
      where,
      orderBy: [{ status: 'asc' }, { endpoint: 'asc' }],
      skip,
      take: perPage,
    }),
  ])

  return { contracts, meta: paginationMeta(total, page, perPage) }
}

export async function getApiContract(
  organizationId: string,
  projectId: string,
  contractId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const contract = await prisma.apiContract.findFirst({
    where: { id: contractId, projectId },
  })

  if (!contract) throw Errors.notFound('ApiContract')
  return contract
}

export async function createApiContract(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateApiContractInput
) {
  await validateProjectAccess(organizationId, projectId)

  const contract = await prisma.apiContract.create({
    data: {
      ...input,
      projectId,
      organizationId,
      requestSchema: input.requestSchema as any,
      responseSchema: input.responseSchema as any,
      queryParams: input.queryParams as any,
      headers: input.headers as any,
      statusCodes: input.statusCodes as any,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ApiContract',
    entityId: contract.id,
    action: 'CREATE',
    afterData: { endpoint: contract.endpoint, method: contract.method },
  })

  return contract
}

export async function updateApiContract(
  organizationId: string,
  projectId: string,
  contractId: string,
  actorId: string,
  input: UpdateApiContractInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.apiContract.findFirst({
    where: { id: contractId, projectId },
  })
  if (!existing) throw Errors.notFound('ApiContract')

  const updates: any = {
    ...input,
    requestSchema: input.requestSchema !== undefined ? (input.requestSchema as any) : undefined,
    responseSchema: input.responseSchema !== undefined ? (input.responseSchema as any) : undefined,
    queryParams: input.queryParams !== undefined ? (input.queryParams as any) : undefined,
    headers: input.headers !== undefined ? (input.headers as any) : undefined,
    statusCodes: input.statusCodes !== undefined ? (input.statusCodes as any) : undefined,
    updatedAt: new Date(),
  }
  if (input.requestSchema !== undefined || input.responseSchema !== undefined) {
    updates.version = { increment: 1 }
  }

  const contract = await prisma.apiContract.update({
    where: { id: contractId },
    data: updates,
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'ApiContract',
    entityId: contractId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: contract.status },
  })

  return contract
}

// ── Payload Validations ────────────────────────────────────────────────────────

export async function listPayloadValidations(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; status?: string; payloadType?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.status && { status: query.status as any }),
    ...(query.payloadType && { payloadType: query.payloadType as any }),
  }

  const [total, validations] = await prisma.$transaction([
    prisma.payloadValidation.count({ where }),
    prisma.payloadValidation.findMany({
      where,
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      skip,
      take: perPage,
    }),
  ])

  return { validations, meta: paginationMeta(total, page, perPage) }
}

export async function getPayloadValidation(
  organizationId: string,
  projectId: string,
  validationId: string
) {
  await validateProjectAccess(organizationId, projectId)

  const validation = await prisma.payloadValidation.findFirst({
    where: { id: validationId, projectId },
  })

  if (!validation) throw Errors.notFound('PayloadValidation')
  return validation
}

export async function createPayloadValidation(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreatePayloadValidationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const validation = await prisma.payloadValidation.create({
    data: {
      ...input,
      projectId,
      organizationId,
      schema: input.schema as any,
      validationRules: input.validationRules as any,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'PayloadValidation',
    entityId: validation.id,
    action: 'CREATE',
    afterData: { name: validation.name, payloadType: validation.payloadType },
  })

  return validation
}

export async function updatePayloadValidation(
  organizationId: string,
  projectId: string,
  validationId: string,
  actorId: string,
  input: UpdatePayloadValidationInput
) {
  await validateProjectAccess(organizationId, projectId)
  const existing = await prisma.payloadValidation.findFirst({
    where: { id: validationId, projectId },
  })
  if (!existing) throw Errors.notFound('PayloadValidation')

  const updates: any = {
    ...input,
    schema: input.schema !== undefined ? (input.schema as any) : undefined,
    validationRules: input.validationRules !== undefined ? (input.validationRules as any) : undefined,
    updatedAt: new Date(),
  }

  const validation = await prisma.payloadValidation.update({
    where: { id: validationId },
    data: updates,
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'PayloadValidation',
    entityId: validationId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: validation.status },
  })

  return validation
}

// ── Technical Deliverables ─────────────────────────────────────────────────────

export async function listTechnicalDeliverables(
  organizationId: string,
  projectId: string,
  query: {
    page?: string
    perPage?: string
    deliverableType?: string
    status?: string
    workstreamId?: string
  }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    projectId,
    organizationId,
    ...(query.deliverableType && { deliverableType: query.deliverableType as any }),
    ...(query.status && { status: query.status as any }),
    ...(query.workstreamId && { workstreamId: query.workstreamId }),
  }

  const [total, deliverables] = await prisma.$transaction([
    prisma.technicalDeliverable.count({ where }),
    prisma.technicalDeliverable.findMany({
      where,
      orderBy: [{ deliverableType: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ])

  return { deliverables, meta: paginationMeta(total, page, perPage) }
}

export async function createTechnicalDeliverable(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateTechnicalDeliverableInput
) {
  await validateProjectAccess(organizationId, projectId)

  const deliverable = await prisma.technicalDeliverable.create({
    data: {
      ...input,
      projectId,
      organizationId,
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'TechnicalDeliverable',
    entityId: deliverable.id,
    action: 'CREATE',
    afterData: { title: deliverable.title, deliverableType: deliverable.deliverableType },
  })

  return deliverable
}
