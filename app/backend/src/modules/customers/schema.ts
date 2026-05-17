import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  companySize: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum(['LEAD', 'QUALIFIED', 'PROSPECT', 'CUSTOMER', 'INACTIVE']).optional(),
  notes: z.string().max(2000).optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
