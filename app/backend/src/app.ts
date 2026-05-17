import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import type { AppEnv, ErrorResponse } from './types/index.js'
import { AppError } from './lib/errors.js'
import { env } from './lib/env.js'

// Route imports
import { healthRoutes } from './modules/health/routes.js'
import { authRoutes } from './modules/auth/routes.js'
import { organizationRoutes } from './modules/organizations/routes.js'
import { customerRoutes } from './modules/customers/routes.js'
import { projectRoutes } from './modules/projects/routes.js'
import { taskRoutes } from './modules/tasks/routes.js'
import { milestoneRoutes } from './modules/milestones/routes.js'
import { raidRoutes } from './modules/raid/routes.js'
import { auditRoutes } from './modules/audit/routes.js'
import { listProjectAuditLogs } from './modules/audit/service.js'
import { activityRoutes } from './modules/activity/routes.js'
import { discoverySessionRoutes } from './modules/discovery-sessions/routes.js'
import { discoveryQuestionRoutes } from './modules/discovery-questions/routes.js'
import { discoveryAnswerRoutes } from './modules/discovery-answers/routes.js'
import { requirementRoutes } from './modules/requirements/routes.js'
import { painPointRoutes } from './modules/pain-points/routes.js'
import { aiConversationRoutes } from './modules/ai-conversations/routes.js'
import { aiMessageRoutes } from './modules/ai-messages/routes.js'
import { aiGeneratedOutputRoutes } from './modules/ai-generated-outputs/routes.js'
import { aiReviewRoutes } from './modules/ai-reviews/routes.js'
import { aiPresalesRoutes } from './modules/ai-presales/routes.js'
import { getNetsuiteCatalog } from './modules/ai-presales/service.js'
import { functionalDeliveryRoutes } from './modules/functional-delivery/routes.js'
import { technicalDeliveryRoutes } from './modules/technical-delivery/routes.js'
import { hypercareRoutes } from './modules/hypercare/routes.js'
import { governanceRoutes } from './modules/governance/routes.js'
import { dashboardRoutes } from './modules/dashboard/routes.js'
import { continuousImprovementRoutes } from './modules/continuous-improvement/routes.js'
import { adminRoutes } from './modules/admin/routes.js'
import { billingRoutes, subscriptionPlanRoutes, tenantRoutes } from './modules/admin/saas-routes.js'
import { deploymentRoutes } from './modules/deployment/routes.js'
import { securityRoutes } from './modules/security/routes.js'
import { documentRoutes, evaluationRoutes, knowledgeRoutes, registryRoutes } from './modules/roadmap-foundation/routes.js'
import { authMiddleware } from './middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from './middleware/rbac.middleware.js'

export function createApp() {
  const app = new Hono<AppEnv>()

  // ── Middleware ──────────────────────────────────────────────────────────────
  app.use('*', honoLogger())

  app.use(
    '*',
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:3000'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.route('/api/health', healthRoutes)
  app.route('/api/auth', authRoutes)
  app.route('/api/organizations', organizationRoutes)
  app.route('/api/customers', customerRoutes)
  app.route('/api/projects', projectRoutes)
  app.route('/api/audit-logs', auditRoutes)

  // Project-scoped nested routes
  app.route('/api/projects/:projectId/tasks', taskRoutes)
  app.route('/api/projects/:projectId/milestones', milestoneRoutes)
  app.route('/api/projects/:projectId/raid', raidRoutes)
  app.route('/api/projects/:projectId/activity', activityRoutes)
  app.route('/api/projects/:projectId/discovery-sessions', discoverySessionRoutes)
  app.route('/api/projects/:projectId/requirements', requirementRoutes)
  app.route('/api/projects/:projectId/pain-points', painPointRoutes)

  // Discovery-session-scoped nested routes
  app.route('/api/discovery-sessions/:sessionId/questions', discoveryQuestionRoutes)
  app.route('/api/discovery-sessions/:sessionId/answers', discoveryAnswerRoutes)

  // AI workspace routes
  app.route('/api/projects/:projectId/ai/conversations', aiConversationRoutes)
  app.route('/api/projects/:projectId/ai/generated-outputs', aiGeneratedOutputRoutes)
  app.route('/api/projects/:projectId/ai/generated-outputs/:outputId/reviews', aiReviewRoutes)
  app.route('/api/ai/conversations/:conversationId/messages', aiMessageRoutes)
  app.route('/api/ai/registry', registryRoutes)

  // AI Presales Intelligence routes
  app.route('/api/projects/:projectId/ai', aiPresalesRoutes)

  // Functional Delivery Intelligence routes
  app.route('/api/projects/:projectId', functionalDeliveryRoutes)

  // Technical Delivery Intelligence routes
  app.route('/api/projects/:projectId', technicalDeliveryRoutes)

  // Post-Implementation Intelligence routes
  app.route('/api/projects/:projectId/hypercare', hypercareRoutes)

  // AI Governance & RAG Layer routes
  app.route('/api/projects/:projectId/governance', governanceRoutes)
  app.route('/api/projects/:projectId/documents', documentRoutes)
  app.route('/api/projects/:projectId/knowledge', knowledgeRoutes)
  app.route('/api/projects/:projectId/evaluations', evaluationRoutes)

  // Enterprise Reporting & Dashboard Layer routes
  app.route('/api/dashboard', dashboardRoutes)

  // AI Continuous Improvement Layer routes
  app.route('/api/projects/:projectId/continuous-improvement', continuousImprovementRoutes)

  // SaaS Admin & Multi-Tenant Management routes
  app.route('/api/admin', adminRoutes)
  app.route('/api/tenants', tenantRoutes)
  app.route('/api/subscription-plans', subscriptionPlanRoutes)
  app.route('/api/billing', billingRoutes)
  app.route('/api/deployment', deploymentRoutes)
  app.route('/api/security', securityRoutes)

  // System catalog — no project scope needed
  app.get(
    '/api/netsuite-catalog',
    authMiddleware,
    requirePermission(PERMISSIONS.AI_INVOKE),
    async (c) => {
      const catalog = await getNetsuiteCatalog()
      return c.json({ success: true, data: catalog })
    }
  )

  // Project-scoped audit logs (inline to avoid dynamic import typing issues)
  app.get(
    '/api/projects/:projectId/audit-logs',
    authMiddleware,
    requirePermission(PERMISSIONS.AUDIT_READ),
    async (c) => {
      const { organizationId } = c.get('user')
      const projectId = c.req.param('projectId')
      const query = c.req.query()
      const result = await listProjectAuditLogs(organizationId, projectId, query)
      return c.json({ success: true, data: result.logs, meta: result.meta })
    }
  )

  // ── 404 handler ─────────────────────────────────────────────────────────────
  app.notFound((c) => {
    return c.json<ErrorResponse>(
      { success: false, error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` } },
      404
    )
  })

  // ── Global error handler ────────────────────────────────────────────────────
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json<ErrorResponse>(
        { success: false, error: { code: err.code, message: err.message } },
        err.status as any
      )
    }

    // Zod validation errors that weren't caught upstream
    if (err.name === 'ZodError') {
      return c.json<ErrorResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } },
        422
      )
    }

    console.error('Unhandled error:', err)
    return c.json<ErrorResponse>(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      500
    )
  })

  return app
}
