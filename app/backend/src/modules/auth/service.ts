import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import type { RegisterInput, LoginInput } from './schema.js'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../lib/env.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)
const JWT_EXPIRY = '7d'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base)
  let attempt = 0
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
    const existing = await prisma.organization.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
    attempt++
  }
}

export async function signToken(userId: string, organizationId: string, role: string): Promise<string> {
  return new SignJWT({ organizationId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function register(input: RegisterInput) {
  // Check email not already in use globally
  const existingUser = await prisma.user.findFirst({
    where: { email: input.email },
  })
  if (existingUser) {
    throw Errors.conflict('An account with this email already exists')
  }

  const slug = await generateUniqueSlug(input.organizationName)
  const passwordHash = await bcrypt.hash(input.password, 12)

  // Create org and owner user in a transaction
  const { organization, user } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: input.organizationName, slug, status: 'ACTIVE' },
    })

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        name: input.name,
        email: input.email,
        passwordHash,
        status: 'ACTIVE',
      },
    })

    return { organization, user }
  })

  await writeAuditLog({
    organizationId: organization.id,
    actorUserId: user.id,
    entityType: 'Organization',
    entityId: organization.id,
    action: 'CREATE',
    afterData: { name: organization.name, slug: organization.slug },
  })

  const token = await signToken(user.id, organization.id, 'OWNER')
  return { user: { id: user.id, name: user.name, email: user.email }, organization, token }
}

export async function login(input: LoginInput, ipAddress?: string) {
  const user = await prisma.user.findFirst({
    where: { email: input.email },
    include: { organization: { select: { id: true, name: true, slug: true, status: true } } },
  })

  if (!user || !user.passwordHash) {
    throw Errors.unauthorized('Invalid email or password')
  }

  if (user.status !== 'ACTIVE') {
    throw Errors.unauthorized('Account is not active')
  }

  if (user.organization.status !== 'ACTIVE') {
    throw Errors.unauthorized('Organization is not active')
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    throw Errors.unauthorized('Invalid email or password')
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  await writeAuditLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    entityType: 'User',
    entityId: user.id,
    action: 'LOGIN',
    ipAddress,
  })

  const token = await signToken(user.id, user.organizationId, 'OWNER')
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      organizationId: user.organizationId,
    },
    organization: user.organization,
    token,
  }
}

export async function getMe(userId: string, organizationId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      organization: { select: { id: true, name: true, slug: true } },
    },
  })
  if (!user) throw Errors.notFound('User')
  return user
}
