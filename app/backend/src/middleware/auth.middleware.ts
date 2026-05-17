import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { jwtVerify } from 'jose'
import type { AppEnv } from '../types/index.js'
import { env } from '../lib/env.js'
import { Errors } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Accept token from Authorization header (Bearer) or httpOnly cookie
  const authHeader = c.req.header('Authorization')
  let token: string | undefined

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = getCookie(c, 'auth-token')
  }

  if (!token) {
    throw Errors.unauthorized()
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.sub as string
    const organizationId = payload.organizationId as string

    // Validate user still exists and is active
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId, status: 'ACTIVE' },
      select: { id: true, organizationId: true, email: true, name: true },
    })

    if (!user) {
      throw Errors.unauthorized('User not found or inactive')
    }

    c.set('user', {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
      role: (payload.role as string) ?? 'USER',
    })

    await next()
  } catch (err) {
    if (err instanceof Error && err.name === 'JWTExpired') {
      throw Errors.unauthorized('Token expired')
    }
    if (err instanceof Error && err.name === 'JWTInvalid') {
      throw Errors.unauthorized('Invalid token')
    }
    throw err
  }
}

// Optional auth — sets user if token present but doesn't block if missing
export const optionalAuthMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : getCookie(c, 'auth-token')

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const userId = payload.sub as string
      const organizationId = payload.organizationId as string
      const user = await prisma.user.findFirst({
        where: { id: userId, organizationId, status: 'ACTIVE' },
        select: { id: true, organizationId: true, email: true, name: true },
      })
      if (user) {
        c.set('user', {
          id: user.id,
          organizationId: user.organizationId,
          email: user.email,
          name: user.name,
          role: (payload.role as string) ?? 'USER',
        })
      }
    } catch {
      // Silently ignore invalid tokens in optional auth
    }
  }

  await next()
}
