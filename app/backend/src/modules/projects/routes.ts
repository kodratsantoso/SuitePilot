import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createProjectSchema, updateProjectSchema } from './schema.js'
import * as projectService from './service.js'
import { Errors } from '../../lib/errors.js'

const projects = new Hono<AppEnv>()
projects.use('*', authMiddleware)

// Portfolio — list all projects
projects.get('/', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const query = c.req.query()
  const result = await projectService.listProjects(organizationId, query)
  return c.json({ success: true, data: result.projects, meta: result.meta })
})

// Create project
projects.post('/', requirePermission(PERMISSIONS.PROJECT_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const project = await projectService.createProject(organizationId, actorId, parsed.data)
  return c.json({ success: true, data: project }, 201)
})

// Get single project
projects.get('/:projectId', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const { projectId } = c.req.param()
  const project = await projectService.getProject(organizationId, projectId)
  return c.json({ success: true, data: project })
})

// Update project
projects.patch('/:projectId', requirePermission(PERMISSIONS.PROJECT_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const { projectId } = c.req.param()
  const body = await c.req.json()
  const parsed = updateProjectSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const project = await projectService.updateProject(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: project })
})

// Delete project
projects.delete('/:projectId', requirePermission(PERMISSIONS.PROJECT_DELETE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const { projectId } = c.req.param()
  await projectService.deleteProject(organizationId, projectId, actorId)
  return c.json({ success: true, data: { message: 'Project deleted' } })
})

// Project members
projects.get('/:projectId/members', requirePermission(PERMISSIONS.PROJECT_READ), async (c) => {
  const { organizationId } = c.get('user')
  const { projectId } = c.req.param()
  const members = await projectService.getProjectMembers(organizationId, projectId)
  return c.json({ success: true, data: members })
})

export { projects as projectRoutes }
