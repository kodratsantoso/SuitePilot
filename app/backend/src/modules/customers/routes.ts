import { Hono } from 'hono'
import type { AppEnv } from '../../types/index.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { requirePermission, PERMISSIONS } from '../../middleware/rbac.middleware.js'
import { createCustomerSchema, updateCustomerSchema } from './schema.js'
import * as customerService from './service.js'
import { Errors } from '../../lib/errors.js'

const customers = new Hono<AppEnv>()
customers.use('*', authMiddleware)

customers.get('/', requirePermission(PERMISSIONS.CUSTOMER_READ), async (c) => {
  const { organizationId } = c.get('user')
  const query = c.req.query()
  const result = await customerService.listCustomers(organizationId, query)
  return c.json({ success: true, data: result.customers, meta: result.meta })
})

customers.post('/', requirePermission(PERMISSIONS.CUSTOMER_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const body = await c.req.json()
  const parsed = createCustomerSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const customer = await customerService.createCustomer(organizationId, actorId, parsed.data)
  return c.json({ success: true, data: customer }, 201)
})

customers.get('/:customerId', requirePermission(PERMISSIONS.CUSTOMER_READ), async (c) => {
  const { organizationId } = c.get('user')
  const { customerId } = c.req.param()
  const customer = await customerService.getCustomer(organizationId, customerId)
  return c.json({ success: true, data: customer })
})

customers.patch('/:customerId', requirePermission(PERMISSIONS.CUSTOMER_WRITE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const { customerId } = c.req.param()
  const body = await c.req.json()
  const parsed = updateCustomerSchema.safeParse(body)
  if (!parsed.success) throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  const customer = await customerService.updateCustomer(organizationId, customerId, actorId, parsed.data)
  return c.json({ success: true, data: customer })
})

customers.delete('/:customerId', requirePermission(PERMISSIONS.CUSTOMER_DELETE), async (c) => {
  const { organizationId, id: actorId } = c.get('user')
  const { customerId } = c.req.param()
  await customerService.deleteCustomer(organizationId, customerId, actorId)
  return c.json({ success: true, data: { message: 'Customer deleted' } })
})

export { customers as customerRoutes }
