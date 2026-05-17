import { Hono } from 'hono'
import { prisma } from '../../lib/prisma.js'

const health = new Hono()

health.get('/', async (c) => {
  const checks: Record<string, string> = {}

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks['database'] = 'connected'
  } catch {
    checks['database'] = 'error'
  }

  const allHealthy = Object.values(checks).every((v) => v === 'connected')

  return c.json(
    {
      success: allHealthy,
      data: {
        status: allHealthy ? 'healthy' : 'degraded',
        version: process.env['npm_package_version'] ?? '0.1.0',
        uptime: Math.floor(process.uptime()),
        environment: process.env['NODE_ENV'] ?? 'development',
        ...checks,
      },
    },
    allHealthy ? 200 : 503
  )
})

health.get('/live', (c) => {
  return c.json({ success: true, data: { status: 'alive', uptime: Math.floor(process.uptime()) } })
})

health.get('/ready', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return c.json({ success: true, data: { status: 'ready', database: 'connected' } })
  } catch {
    return c.json({ success: false, data: { status: 'not_ready', database: 'error' } }, 503)
  }
})

health.get('/metrics', (c) => {
  const memory = process.memoryUsage()
  const lines = [
    '# HELP suitepilot_uptime_seconds Process uptime in seconds',
    '# TYPE suitepilot_uptime_seconds gauge',
    `suitepilot_uptime_seconds ${Math.floor(process.uptime())}`,
    '# HELP suitepilot_memory_heap_used_bytes Node heap used bytes',
    '# TYPE suitepilot_memory_heap_used_bytes gauge',
    `suitepilot_memory_heap_used_bytes ${memory.heapUsed}`,
  ]
  return c.text(lines.join('\n'), 200, { 'Content-Type': 'text/plain; version=0.0.4' })
})

export { health as healthRoutes }
