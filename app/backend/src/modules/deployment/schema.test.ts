import { describe, expect, it } from 'vitest'
import { rollbackDeploymentSchema, triggerDeploymentSchema } from './schema.js'

describe('deployment schemas', () => {
  it('accepts a deployment trigger payload', () => {
    const result = triggerDeploymentSchema.safeParse({
      environmentId: 'env-development',
      serviceId: 'svc-dev-backend',
      actionType: 'DEPLOY',
      imageTag: 'test-123',
      version: '1.0.0',
    })

    expect(result.success).toBe(true)
  })

  it('rejects rollback without service scope', () => {
    const result = rollbackDeploymentSchema.safeParse({
      environmentId: 'env-development',
      reason: 'missing service',
    })

    expect(result.success).toBe(false)
  })
})
