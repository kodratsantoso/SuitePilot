import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { env } from './lib/env.js'
import { prisma } from './lib/prisma.js'
import { logger } from './lib/logger.js'

async function main() {
  // Validate database connection on startup
  try {
    await prisma.$queryRaw`SELECT 1`
    logger.info('Database connection established')
  } catch (err) {
    logger.error({ err }, 'Failed to connect to database — check DATABASE_URL')
    process.exit(1)
  }

  const app = createApp()

  serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      logger.info(`🚀 Backend running at http://localhost:${info.port}`)
      logger.info(`   Environment: ${env.NODE_ENV}`)
      logger.info(`   Health check: http://localhost:${info.port}/api/health`)
    }
  )

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`)
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  logger.error(err, 'Fatal startup error')
  process.exit(1)
})
