import { z } from 'zod'

export const createSecretSchema = z.object({
  tenantId: z.string().min(1).optional(),
  secretType: z.enum(['API_KEY', 'DB_PASSWORD', 'TOKEN', 'WEBHOOK_SECRET', 'OAUTH_CLIENT_SECRET']),
  secretName: z.string().min(1).max(120),
  secretValue: z.string().min(1).max(10000),
  rotationPolicy: z.enum(['MANUAL', 'DAYS_30', 'DAYS_60', 'DAYS_90']).optional(),
})

export const rotateSecretSchema = z.object({
  secretValue: z.string().min(1).max(10000),
  rotationPolicy: z.enum(['MANUAL', 'DAYS_30', 'DAYS_60', 'DAYS_90']).optional(),
})

export type CreateSecretInput = z.infer<typeof createSecretSchema>
export type RotateSecretInput = z.infer<typeof rotateSecretSchema>
