import { z } from 'zod'

export const createQuestionSchema = z.object({
  category: z.enum([
    'COMPANY_PROFILE',
    'FINANCE',
    'PROCUREMENT',
    'INVENTORY',
    'SALES',
    'CRM',
    'MANUFACTURING',
    'REPORTING',
    'INTEGRATION',
    'COMPLIANCE',
    'PAIN_POINT',
    'GOVERNANCE',
    'TECHNICAL',
    'OTHER',
  ]),
  question: z.string().min(1).max(1000),
  order: z.number().int().min(0).optional(),
})

export const bulkCreateQuestionsSchema = z.object({
  questions: z.array(createQuestionSchema).min(1).max(50),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type BulkCreateQuestionsInput = z.infer<typeof bulkCreateQuestionsSchema>
