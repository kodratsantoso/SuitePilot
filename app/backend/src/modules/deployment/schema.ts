import { z } from 'zod'

export const triggerDeploymentSchema = z.object({
  environmentId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  actionType: z.enum(['BUILD', 'TEST', 'DEPLOY', 'SCALE', 'SELF_HEAL']),
  version: z.string().max(100).optional(),
  imageTag: z.string().max(120).optional(),
  commitSha: z.string().max(80).optional(),
  desiredReplicas: z.number().int().min(1).max(50).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const rollbackDeploymentSchema = z.object({
  environmentId: z.string().min(1),
  serviceId: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  rollbackTargetRunId: z.string().min(1).optional(),
  reason: z.string().max(500).optional(),
})

export const recordMetricSchema = z.object({
  environmentId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  metricType: z.enum(['CPU_USAGE', 'MEMORY_USAGE', 'LATENCY_MS', 'ERROR_RATE', 'UPTIME_SECONDS']),
  value: z.number().min(0),
  unit: z.string().max(30).optional(),
})

export const createAlertSchema = z.object({
  environmentId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  message: z.string().min(1).max(1000),
  source: z.string().max(100).optional(),
})

export const updateAlertSchema = z.object({
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']),
})

export type TriggerDeploymentInput = z.infer<typeof triggerDeploymentSchema>
export type RollbackDeploymentInput = z.infer<typeof rollbackDeploymentSchema>
export type RecordMetricInput = z.infer<typeof recordMetricSchema>
export type CreateAlertInput = z.infer<typeof createAlertSchema>
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>
