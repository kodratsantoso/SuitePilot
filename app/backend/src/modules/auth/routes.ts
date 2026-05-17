import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import type { AppEnv } from '../../types/index.js'
import { registerSchema, loginSchema } from './schema.js'
import * as authService from './service.js'
import { authMiddleware } from '../../middleware/auth.middleware.js'
import { Errors } from '../../lib/errors.js'
import { env } from '../../lib/env.js'

const auth = new Hono<AppEnv>()

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'Lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/',
}

auth.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const result = await authService.register(parsed.data)
  setCookie(c, 'auth-token', result.token, COOKIE_OPTIONS)

  return c.json({ success: true, data: { user: result.user, organization: result.organization } }, 201)
})

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const ipAddress = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip')
  const result = await authService.login(parsed.data, ipAddress)
  setCookie(c, 'auth-token', result.token, COOKIE_OPTIONS)

  return c.json({ success: true, data: { user: result.user, organization: result.organization } })
})

auth.post('/logout', authMiddleware, async (c) => {
  deleteCookie(c, 'auth-token', { path: '/' })
  return c.json({ success: true, data: { message: 'Logged out successfully' } })
})

auth.get('/me', authMiddleware, async (c) => {
  const { id, organizationId } = c.get('user')
  const user = await authService.getMe(id, organizationId)
  return c.json({ success: true, data: user })
})

export { auth as authRoutes }
