import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createSecretSchema, rotateSecretSchema } from './schema.js'
import * as service from './service.js'

const security = new Hono<AppEnv>()
security.use('*', authMiddleware)

const securityAdmin = requirePermission(PERMISSIONS.ORG_WRITE)

function requestMeta(c: { req: { header: (name: string) => string | undefined } }) {
  return {
    ipAddress: c.req.header('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent: c.req.header('user-agent'),
  }
}

security.get('/access-logs', securityAdmin, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const logs = await service.listAccessLogs(organizationId, c.req.query())
  await service.writeAccessLog({
    organizationId,
    userId: actorId,
    entityType: 'AccessLog',
    actionType: 'READ',
    result: 'SUCCESS',
    ...requestMeta(c),
    metadata: { filters: c.req.query() },
  })
  return c.json({ success: true, data: logs })
})

security.get('/secrets', securityAdmin, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const secrets = await service.listSecrets(organizationId, c.req.query())
  await service.writeAccessLog({
    organizationId,
    userId: actorId,
    entityType: 'SecretStore',
    actionType: 'READ',
    result: 'SUCCESS',
    ...requestMeta(c),
  })
  return c.json({ success: true, data: secrets })
})

security.post('/secrets', securityAdmin, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const parsed = createSecretSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const secret = await service.createSecret(organizationId, actorId, parsed.data, requestMeta(c))
  return c.json({ success: true, data: secret }, 201)
})

security.patch('/secrets/:secretId/rotate', securityAdmin, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const parsed = rotateSecretSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ success: false, error: parsed.error.flatten() }, 400)
  const secret = await service.rotateSecret(organizationId, actorId, c.req.param('secretId'), parsed.data, requestMeta(c))
  return c.json({ success: true, data: secret })
})

security.get('/encrypted-fields', securityAdmin, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const fields = await service.listEncryptedFields()
  await service.writeAccessLog({
    organizationId,
    userId: actorId,
    entityType: 'EncryptedField',
    actionType: 'READ',
    result: 'SUCCESS',
    ...requestMeta(c),
  })
  return c.json({ success: true, data: fields })
})

security.get('/compliance-report', securityAdmin, async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const report = await service.getComplianceReport(organizationId)
  await service.writeAccessLog({
    organizationId,
    userId: actorId,
    entityType: 'ComplianceReport',
    actionType: 'SECURITY_CHECK',
    result: 'SUCCESS',
    ...requestMeta(c),
  })
  return c.json({ success: true, data: report })
})

export { security as securityRoutes }
