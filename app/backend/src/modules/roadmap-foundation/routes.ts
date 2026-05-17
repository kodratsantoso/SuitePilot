import { Hono } from 'hono'
import type { SafeParseReturnType } from 'zod'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS, requireSuperuser } from '../../middleware/rbac.middleware.js'
import { Errors } from '../../lib/errors.js'
import {
  createAgentSchema,
  createDocumentSchema,
  createEvaluationCaseSchema,
  createKnowledgeDocumentSchema,
  createKnowledgeSourceSchema,
  createReviewCommentSchema,
  createSkillSchema,
  retrieveKnowledgeSchema,
  runEvaluationSchema,
  updateDocumentSchema,
  updateKnowledgeSourceSchema,
} from './schema.js'
import * as service from './service.js'

function assertValid<T>(result: SafeParseReturnType<unknown, T>) {
  if (!result.success) throw Errors.validation(result.error.issues.map((issue) => issue.message).join(', '))
  return result.data
}

export const documentRoutes = new Hono<AppEnv>()
documentRoutes.use('*', authMiddleware)

documentRoutes.get('/', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const result = await service.listDocuments(organizationId, projectId, c.req.query())
  return c.json({ success: true, data: result.documents, meta: result.meta })
})

documentRoutes.post('/', requirePermission(PERMISSIONS.PROJECT_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const document = await service.createDocument(organizationId, projectId, actorId, assertValid(createDocumentSchema.safeParse(body)))
  return c.json({ success: true, data: document }, 201)
})

documentRoutes.get('/:documentId', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const document = await service.getDocument(organizationId, c.req.param('projectId') as string, c.req.param('documentId') as string)
  return c.json({ success: true, data: document })
})

documentRoutes.patch('/:documentId', requirePermission(PERMISSIONS.AI_REVIEW), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const document = await service.updateDocument(
    organizationId,
    c.req.param('projectId') as string,
    c.req.param('documentId') as string,
    actorId,
    assertValid(updateDocumentSchema.safeParse(body))
  )
  return c.json({ success: true, data: document })
})

documentRoutes.post('/:documentId/comments', requirePermission(PERMISSIONS.AI_REVIEW), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const comment = await service.createReviewComment(
    organizationId,
    c.req.param('projectId') as string,
    c.req.param('documentId') as string,
    actorId,
    assertValid(createReviewCommentSchema.safeParse(body))
  )
  return c.json({ success: true, data: comment }, 201)
})

export const knowledgeRoutes = new Hono<AppEnv>()
knowledgeRoutes.use('*', authMiddleware)

knowledgeRoutes.get('/sources', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const result = await service.listKnowledgeSources(organizationId, c.req.param('projectId') as string, c.req.query())
  return c.json({ success: true, data: result.sources, meta: result.meta })
})

knowledgeRoutes.post('/sources', requirePermission(PERMISSIONS.PROJECT_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const source = await service.createKnowledgeSource(organizationId, c.req.param('projectId') as string, actorId, assertValid(createKnowledgeSourceSchema.safeParse(body)))
  return c.json({ success: true, data: source }, 201)
})

knowledgeRoutes.patch('/sources/:sourceId', requirePermission(PERMISSIONS.PROJECT_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const source = await service.updateKnowledgeSource(
    organizationId,
    c.req.param('projectId') as string,
    c.req.param('sourceId') as string,
    actorId,
    assertValid(updateKnowledgeSourceSchema.safeParse(body))
  )
  return c.json({ success: true, data: source })
})

knowledgeRoutes.post('/documents', requirePermission(PERMISSIONS.PROJECT_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const document = await service.createKnowledgeDocument(organizationId, c.req.param('projectId') as string, actorId, assertValid(createKnowledgeDocumentSchema.safeParse(body)))
  return c.json({ success: true, data: document }, 201)
})

knowledgeRoutes.post('/retrieve', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const body = await c.req.json()
  const result = await service.retrieveKnowledge(organizationId, c.req.param('projectId') as string, assertValid(retrieveKnowledgeSchema.safeParse(body)))
  return c.json({ success: true, data: result })
})

export const evaluationRoutes = new Hono<AppEnv>()
evaluationRoutes.use('*', authMiddleware)

evaluationRoutes.get('/cases', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const result = await service.listEvaluationCases(organizationId, c.req.param('projectId') as string, c.req.query())
  return c.json({ success: true, data: result.cases, meta: result.meta })
})

evaluationRoutes.post('/cases', requirePermission(PERMISSIONS.AI_REVIEW), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const testCase = await service.createEvaluationCase(organizationId, c.req.param('projectId') as string, actorId, assertValid(createEvaluationCaseSchema.safeParse(body)))
  return c.json({ success: true, data: testCase }, 201)
})

evaluationRoutes.get('/runs', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const result = await service.listEvaluationRuns(organizationId, c.req.param('projectId') as string, c.req.query())
  return c.json({ success: true, data: result.runs, meta: result.meta })
})

evaluationRoutes.post('/runs', requirePermission(PERMISSIONS.AI_REVIEW), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const run = await service.runEvaluation(organizationId, c.req.param('projectId') as string, actorId, assertValid(runEvaluationSchema.safeParse(body)))
  return c.json({ success: true, data: run }, 201)
})

export const registryRoutes = new Hono<AppEnv>()
registryRoutes.use('*', authMiddleware)

registryRoutes.get('/', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const registry = await service.listRegistry()
  return c.json({ success: true, data: registry })
})

registryRoutes.post('/agents', requireSuperuser(), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const agent = await service.createAgent(organizationId, actorId, assertValid(createAgentSchema.safeParse(body)))
  return c.json({ success: true, data: agent }, 201)
})

registryRoutes.post('/skills', requireSuperuser(), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const skill = await service.createSkill(organizationId, actorId, assertValid(createSkillSchema.safeParse(body)))
  return c.json({ success: true, data: skill }, 201)
})
