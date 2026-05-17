import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'
import { writeAuditLog } from '../../lib/audit.js'
import { parsePagination, paginationMeta } from '../../types/index.js'
import type {
  CreateFeedbackInput,
  CreateRecommendationInput,
  UpdateRecommendationInput,
} from './schema.js'

// ── Helpers ────────────────────────────────────────────────────────────────────

async function validateProjectAccess(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
  if (!project) throw Errors.notFound('Project')
  return project
}

function computeRag(score: number): 'GREEN' | 'AMBER' | 'RED' {
  if (score >= 70) return 'GREEN'
  if (score >= 40) return 'AMBER'
  return 'RED'
}

// ── Feedback ───────────────────────────────────────────────────────────────────

export async function listFeedback(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; feedbackType?: string; severity?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    organizationId,
    projectId,
    ...(query.feedbackType && { feedbackType: query.feedbackType as any }),
    ...(query.severity && { severity: query.severity as any }),
  }

  const [total, entries] = await prisma.$transaction([
    prisma.feedbackEntry.count({ where }),
    prisma.feedbackEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
        aiGeneratedOutput: { select: { id: true, title: true, outputType: true } },
      },
    }),
  ])

  return { entries, meta: paginationMeta(total, page, perPage) }
}

export async function createFeedback(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateFeedbackInput
) {
  await validateProjectAccess(organizationId, projectId)

  const entry = await prisma.feedbackEntry.create({
    data: {
      ...input,
      organizationId,
      projectId,
      createdBy: actorId,
    },
    include: {
      createdByUser: { select: { id: true, name: true, email: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'FeedbackEntry',
    entityId: entry.id,
    action: 'CREATE',
    afterData: { feedbackType: entry.feedbackType, severity: entry.severity },
  })

  return entry
}

// ── Recommendations ────────────────────────────────────────────────────────────

export async function listRecommendations(
  organizationId: string,
  projectId: string,
  query: { page?: string; perPage?: string; recommendationType?: string; status?: string }
) {
  await validateProjectAccess(organizationId, projectId)
  const { page, perPage, skip } = parsePagination(query)

  const where = {
    organizationId,
    projectId,
    ...(query.recommendationType && { recommendationType: query.recommendationType as any }),
    ...(query.status && { status: query.status as any }),
  }

  const [total, items] = await prisma.$transaction([
    prisma.optimizationRecommendation.count({ where }),
    prisma.optimizationRecommendation.findMany({
      where,
      orderBy: [{ impactScore: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: perPage,
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  return { items, meta: paginationMeta(total, page, perPage) }
}

export async function createRecommendation(
  organizationId: string,
  projectId: string,
  actorId: string,
  input: CreateRecommendationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const rec = await prisma.optimizationRecommendation.create({
    data: {
      ...input,
      organizationId,
      projectId,
      createdBy: actorId,
    },
    include: {
      createdByUser: { select: { id: true, name: true, email: true } },
    },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'OptimizationRecommendation',
    entityId: rec.id,
    action: 'CREATE',
    afterData: { recommendationType: rec.recommendationType, impactScore: rec.impactScore },
  })

  return rec
}

export async function updateRecommendation(
  organizationId: string,
  projectId: string,
  recommendationId: string,
  actorId: string,
  input: UpdateRecommendationInput
) {
  await validateProjectAccess(organizationId, projectId)

  const existing = await prisma.optimizationRecommendation.findFirst({
    where: { id: recommendationId, projectId, organizationId },
  })
  if (!existing) throw Errors.notFound('OptimizationRecommendation')

  const updated = await prisma.optimizationRecommendation.update({
    where: { id: recommendationId },
    data: input,
    include: { createdByUser: { select: { id: true, name: true, email: true } } },
  })

  await writeAuditLog({
    organizationId,
    projectId,
    actorUserId: actorId,
    entityType: 'OptimizationRecommendation',
    entityId: recommendationId,
    action: 'UPDATE',
    beforeData: { status: existing.status },
    afterData: { status: updated.status },
  })

  return updated
}

// ── Optimization Scores ────────────────────────────────────────────────────────

export async function getOptimizationScores(organizationId: string, projectId: string) {
  await validateProjectAccess(organizationId, projectId)

  // Compute fresh scores from live data
  const [
    tasks, milestones,
    aiOutputs, validations, hallucinations,
    openIssues, raidItems,
    feedbackEntries,
  ] = await Promise.all([
    prisma.projectTask.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.projectMilestone.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.aiGeneratedOutput.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.outputValidation.groupBy({ by: ['result'], where: { projectId }, _count: true }),
    prisma.governanceEvent.count({ where: { projectId, eventType: 'HALLUCINATION_DETECTED' } }),
    prisma.issue.count({ where: { projectId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.raidItem.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.feedbackEntry.count({ where: { projectId, severity: { in: ['HIGH', 'CRITICAL'] as any[] } } }),
  ])

  // Efficiency: task completion rate (0–100)
  const totalTasks = tasks.reduce((s, t) => s + t._count, 0)
  const doneTasks = tasks.find(t => t.status === 'DONE')?._count ?? 0
  const efficiencyScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 50

  // Accuracy: AI validation pass rate
  const totalValidations = validations.reduce((s, v) => s + v._count, 0)
  const passedValidations = validations.find(v => v.result === 'PASS')?._count ?? 0
  const accuracyScore = totalValidations > 0
    ? Math.round((passedValidations / totalValidations) * 100)
    : 70

  // Risk Mitigation: inverse of open issues + RAID + critical feedback
  const openRaidItems = (raidItems as { status: string; _count: number }[])
    .filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS')
    .reduce((s, r) => s + r._count, 0)
  const riskPenalty = Math.min(openIssues * 5 + openRaidItems * 3 + feedbackEntries * 8, 80)
  const riskMitigationScore = Math.max(100 - riskPenalty, 10)

  // AI Output Quality: penalize hallucinations
  const totalOutputs = aiOutputs.reduce((s, o) => s + o._count, 0)
  const hallucinationPenalty = totalOutputs > 0
    ? Math.min(Math.round((hallucinations / totalOutputs) * 100), 80)
    : 0
  const aiQualityScore = Math.max(accuracyScore - hallucinationPenalty, 0)

  const scores = [
    { metricType: 'EFFICIENCY', score: efficiencyScore, ragStatus: computeRag(efficiencyScore) },
    { metricType: 'ACCURACY', score: accuracyScore, ragStatus: computeRag(accuracyScore) },
    { metricType: 'RISK_MITIGATION', score: riskMitigationScore, ragStatus: computeRag(riskMitigationScore) },
    { metricType: 'AI_OUTPUT_QUALITY', score: aiQualityScore, ragStatus: computeRag(aiQualityScore) },
  ] as const

  // Persist the latest scores
  await prisma.$transaction(
    scores.map(s =>
      prisma.optimizationScore.create({
        data: {
          organizationId,
          projectId,
          metricType: s.metricType as any,
          score: s.score,
          ragStatus: s.ragStatus,
        },
      })
    )
  )

  return scores
}

// ── Optimization Trends ────────────────────────────────────────────────────────

export async function getOptimizationTrends(
  organizationId: string,
  projectId: string,
  metricType?: string,
  timeRange: number = 30
) {
  await validateProjectAccess(organizationId, projectId)

  const since = new Date()
  since.setDate(since.getDate() - timeRange)

  const trends = await prisma.optimizationScore.findMany({
    where: {
      organizationId,
      projectId,
      ...(metricType && { metricType: metricType as any }),
      calculatedAt: { gte: since },
    },
    orderBy: { calculatedAt: 'asc' },
    take: 100,
  })

  return trends
}

// ── Summary ────────────────────────────────────────────────────────────────────

export async function getContinuousImprovementSummary(organizationId: string, projectId: string) {
  await validateProjectAccess(organizationId, projectId)

  const [
    feedbackCounts,
    recommendationCounts,
    latestScores,
    recentFeedback,
    topRecommendations,
  ] = await Promise.all([
    prisma.feedbackEntry.groupBy({ by: ['feedbackType', 'severity'], where: { organizationId, projectId }, _count: true }),
    prisma.optimizationRecommendation.groupBy({ by: ['status'], where: { organizationId, projectId }, _count: true }),
    prisma.optimizationScore.findMany({
      where: { organizationId, projectId },
      orderBy: { calculatedAt: 'desc' },
      distinct: ['metricType'],
      take: 4,
    }),
    prisma.feedbackEntry.findMany({
      where: { organizationId, projectId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { createdByUser: { select: { name: true } } },
    }),
    prisma.optimizationRecommendation.findMany({
      where: { organizationId, projectId, status: { in: ['DRAFT', 'REVIEWED'] } },
      orderBy: [{ impactScore: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      include: { createdByUser: { select: { name: true } } },
    }),
  ])

  const totalFeedback = feedbackCounts.reduce((s, f) => s + f._count, 0)
  const criticalFeedback = feedbackCounts.filter(f => f.severity === 'CRITICAL').reduce((s, f) => s + f._count, 0)
  const pendingRecommendations = recommendationCounts.filter(r => ['DRAFT', 'REVIEWED'].includes(r.status)).reduce((s, r) => s + r._count, 0)

  return {
    totalFeedback,
    criticalFeedback,
    pendingRecommendations,
    latestScores,
    recentFeedback,
    topRecommendations,
  }
}
