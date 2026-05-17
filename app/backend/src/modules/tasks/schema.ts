import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  ownerId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedDate: z.string().datetime().optional().nullable(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
