import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Reuse client in development (hot reload prevention)
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
