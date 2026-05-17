import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import {
  runRequirementAnalysisSchema,
  runPainPointClassificationSchema,
  runModuleRecommendationSchema,
  runScopeEstimationSchema,
  runProposalDraftSchema,
} from './schema.js'
import * as aiPresalesService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/ai
const aiPresales = new Hono<AppEnv & { Variables: { projectId: string } }>()
aiPresales.use('*', authMiddleware)

// ── Requirement Analysis ───────────────────────────────────────────────────────

aiPresales.post('/analyze-requirements', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json().catch(() => ({}))
  const parsed = runRequirementAnalysisSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const result = await aiPresalesService.runRequirementAnalysis(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: result }, 201)
})

aiPresales.get('/requirement-analysis', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const result = await aiPresalesService.listRequirementAnalyses(organizationId, projectId, c.req.query())
  return c.json({ success: true, data: result.analyses, meta: result.meta })
})

// ── Pain Point Classification ──────────────────────────────────────────────────

aiPresales.post('/classify-pain-points', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json().catch(() => ({}))
  const parsed = runPainPointClassificationSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const result = await aiPresalesService.runPainPointClassification(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: result }, 201)
})

aiPresales.get('/pain-point-analysis', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const result = await aiPresalesService.listPainPointAnalyses(organizationId, projectId, c.req.query())
  return c.json({ success: true, data: result.classifications, meta: result.meta })
})

// ── Module Recommendations ─────────────────────────────────────────────────────

aiPresales.post('/recommend-modules', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json().catch(() => ({}))
  const parsed = runModuleRecommendationSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const result = await aiPresalesService.runModuleRecommendation(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: result }, 201)
})

aiPresales.get('/module-recommendations', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const result = await aiPresalesService.listModuleRecommendations(organizationId, projectId, c.req.query())
  return c.json({ success: true, data: result.recommendations, meta: result.meta })
})

// ── Scope Estimation ───────────────────────────────────────────────────────────

aiPresales.post('/estimate-scope', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json().catch(() => ({}))
  const parsed = runScopeEstimationSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const result = await aiPresalesService.runScopeEstimation(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: result }, 201)
})

aiPresales.get('/scope-estimations', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const result = await aiPresalesService.listScopeEstimations(organizationId, projectId, c.req.query())
  return c.json({ success: true, data: result.estimations, meta: result.meta })
})

// ── Proposal Draft ─────────────────────────────────────────────────────────────

aiPresales.post('/generate-proposal-draft', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json().catch(() => ({}))
  const parsed = runProposalDraftSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const result = await aiPresalesService.runProposalDraftGeneration(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: result }, 201)
})

aiPresales.get('/proposal-drafts', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const result = await aiPresalesService.listProposalDrafts(organizationId, projectId, c.req.query())
  return c.json({ success: true, data: result.drafts, meta: result.meta })
})

// ── NetSuite Catalog (project-context convenience endpoint) ───────────────────

aiPresales.get('/netsuite-catalog', requirePermission(PERMISSIONS.AI_INVOKE), async (c) => {
  const catalog = await aiPresalesService.getNetsuiteCatalog()
  return c.json({ success: true, data: catalog })
})

export { aiPresales as aiPresalesRoutes }
