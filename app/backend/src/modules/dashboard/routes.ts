import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import * as service from './service.js'

// Mounted at /api/dashboard
const dashboard = new Hono<AppEnv>()
dashboard.use('*', authMiddleware)

// ── Portfolio Summary ──────────────────────────────────────────────────────────
// GET /api/dashboard/portfolio-summary

dashboard.get(
  '/portfolio-summary',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const result = await service.getPortfolioSummary(organizationId)
    return c.json({ success: true, data: result })
  }
)

// ── Project Dashboard ─────────────────────────────────────────────────────────
// GET /api/dashboard/project/:projectId

dashboard.get(
  '/project/:projectId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const projectId = c.req.param('projectId')
    const result = await service.getProjectDashboard(organizationId, projectId)
    return c.json({ success: true, data: result })
  }
)

// ── Workstream Dashboard ──────────────────────────────────────────────────────
// GET /api/dashboard/workstream/:workstreamId

dashboard.get(
  '/workstream/:workstreamId',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const workstreamId = c.req.param('workstreamId')
    const result = await service.getWorkstreamDashboard(organizationId, workstreamId)
    return c.json({ success: true, data: result })
  }
)

// ── KPI Trends ────────────────────────────────────────────────────────────────
// GET /api/dashboard/kpi-trends?projectId=&metric=&timeRange=

dashboard.get(
  '/kpi-trends',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const { projectId, metric = 'task_completion', timeRange = '30' } = c.req.query()
    const result = await service.getKpiTrends(
      organizationId,
      projectId || undefined,
      metric,
      parseInt(timeRange, 10),
    )
    return c.json({ success: true, data: result })
  }
)

// ── RAG Overview ──────────────────────────────────────────────────────────────
// GET /api/dashboard/rag-overview?projectId=

dashboard.get(
  '/rag-overview',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const { projectId } = c.req.query()
    const result = await service.getRagOverview(organizationId, projectId || undefined)
    return c.json({ success: true, data: result })
  }
)

// ── Hypercare Summary ─────────────────────────────────────────────────────────
// GET /api/dashboard/hypercare-summary?projectId=

dashboard.get(
  '/hypercare-summary',
  requirePermission(PERMISSIONS.PROJECT_READ),
  async (c) => {
    const { organizationId } = c.get('user')
    const { projectId } = c.req.query()
    const result = await service.getHypercareSummary(organizationId, projectId || undefined)
    return c.json({ success: true, data: result })
  }
)

export { dashboard as dashboardRoutes }
