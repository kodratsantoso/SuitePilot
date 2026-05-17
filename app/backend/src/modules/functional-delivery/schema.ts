import { z } from 'zod'

export const createWorkstreamSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  ownerId: z.string().uuid().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'BLOCKED', 'COMPLETED', 'ON_HOLD']).optional(),
})

export const updateWorkstreamSchema = createWorkstreamSchema.partial().extend({
  progressPercentage: z.number().int().min(0).max(100).optional(),
})

export const createBusinessProcessSchema = z.object({
  processName: z.string().min(1).max(300),
  processCategory: z.enum([
    'PROCURE_TO_PAY',
    'ORDER_TO_CASH',
    'RECORD_TO_REPORT',
    'INVENTORY_MANAGEMENT',
    'FIXED_ASSET',
    'CRM',
    'MANUFACTURING',
    'APPROVAL_WORKFLOW',
    'REPORTING',
    'PROJECT_ACCOUNTING',
  ]),
  workstreamId: z.string().uuid().optional(),
  currentState: z.string().max(3000).optional(),
  futureState: z.string().max(3000).optional(),
  impactedModules: z.array(z.string()).optional(),
})

export const updateBusinessProcessSchema = createBusinessProcessSchema.partial()

export const createProcessStepSchema = z.object({
  stepOrder: z.number().int().min(0).optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  actor: z.string().max(200).optional(),
  systemAction: z.string().max(1000).optional(),
  approvalRequired: z.boolean().optional(),
})

export const runFitGapSchema = z.object({
  discoverySessionId: z.string().uuid().optional(),
  requirementIds: z.array(z.string().uuid()).optional(),
})

export const runUatGenerationSchema = z.object({
  workstreamId: z.string().uuid().optional(),
  processId: z.string().uuid().optional(),
  scenarioCount: z.number().int().min(3).max(20).optional(),
})

export const runSopGenerationSchema = z.object({
  processId: z.string().uuid(),
})

export const updateUatScenarioSchema = z.object({
  status: z
    .enum(['DRAFT', 'READY', 'IN_TESTING', 'PASSED', 'FAILED', 'RETEST_REQUIRED'])
    .optional(),
  title: z.string().min(1).max(300).optional(),
  precondition: z.string().optional(),
  testSteps: z.string().optional(),
  expectedResult: z.string().optional(),
})

export const updateSopSchema = z.object({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  title: z.string().min(1).max(300).optional(),
  purpose: z.string().optional(),
  scope: z.string().optional(),
  responsibilities: z.string().optional(),
  processSteps: z.string().optional(),
  approvalFlow: z.string().optional(),
  exceptionHandling: z.string().optional(),
})

export const createDeliverableSchema = z.object({
  deliverableType: z.enum([
    'PROCESS_MAPPING',
    'FIT_GAP_ANALYSIS',
    'UAT',
    'SOP',
    'CONFIGURATION_WORKBOOK',
    'TRAINING_MATERIAL',
    'MIGRATION_TEMPLATE',
  ]),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  workstreamId: z.string().uuid().optional(),
  status: z
    .enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'PUBLISHED'])
    .optional(),
})

export type CreateWorkstreamInput = z.infer<typeof createWorkstreamSchema>
export type UpdateWorkstreamInput = z.infer<typeof updateWorkstreamSchema>
export type CreateBusinessProcessInput = z.infer<typeof createBusinessProcessSchema>
export type UpdateBusinessProcessInput = z.infer<typeof updateBusinessProcessSchema>
export type CreateProcessStepInput = z.infer<typeof createProcessStepSchema>
export type RunFitGapInput = z.infer<typeof runFitGapSchema>
export type RunUatInput = z.infer<typeof runUatGenerationSchema>
export type RunSopInput = z.infer<typeof runSopGenerationSchema>
export type UpdateUatScenarioInput = z.infer<typeof updateUatScenarioSchema>
export type UpdateSopInput = z.infer<typeof updateSopSchema>
export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>
