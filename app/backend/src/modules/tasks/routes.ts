import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createTaskSchema, updateTaskSchema } from './schema.js'
import * as taskService from './service.js'
import { Errors } from '../../lib/errors.js'

// Mounted at /api/projects/:projectId/tasks
const tasks = new Hono<AppEnv & { Variables: { projectId: string } }>()
tasks.use('*', authMiddleware)

tasks.get('/', requirePermission(PERMISSIONS.TASK_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const query = c.req.query()
  const result = await taskService.listTasks(organizationId, projectId, query)
  return c.json({ success: true, data: result.tasks, meta: result.meta })
})

tasks.post('/', requirePermission(PERMISSIONS.TASK_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const body = await c.req.json()
  const parsed = createTaskSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const task = await taskService.createTask(organizationId, projectId, actorId, parsed.data)
  return c.json({ success: true, data: task }, 201)
})

tasks.get('/:taskId', requirePermission(PERMISSIONS.TASK_READ), async (c) => {
  const { organizationId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const taskId = c.req.param('taskId')
  const task = await taskService.getTask(organizationId, projectId, taskId)
  return c.json({ success: true, data: task })
})

tasks.patch('/:taskId', requirePermission(PERMISSIONS.TASK_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const taskId = c.req.param('taskId')
  const body = await c.req.json()
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const task = await taskService.updateTask(organizationId, projectId, taskId, actorId, parsed.data)
  return c.json({ success: true, data: task })
})

tasks.delete('/:taskId', requirePermission(PERMISSIONS.TASK_DELETE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const projectId = c.req.param('projectId') as string
  const taskId = c.req.param('taskId')
  await taskService.deleteTask(organizationId, projectId, taskId, actorId)
  return c.json({ success: true, data: { message: 'Task deleted' } })
})

export { tasks as taskRoutes }
