import { prisma } from '../../lib/prisma.js'
import { Errors } from '../../lib/errors.js'

// ── Portfolio Summary ──────────────────────────────────────────────────────────
// Returns org-level aggregated summary across ALL projects

export async function getPortfolioSummary(organizationId: string) {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { tasks: true, milestones: true, raidItems: true, requirements: true, hypercareTasks: true, issues: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const totals = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
    completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
    atRiskProjects: projects.filter(p => p.status === 'AT_RISK' || p.health === 'RED').length,
    onHoldProjects: projects.filter(p => p.status === 'ON_HOLD').length,
    draftProjects: projects.filter(p => p.status === 'DRAFT').length,
  }

  const projectSummaries = projects.map(p => ({
    id: p.id,
    name: p.name,
    projectCode: p.projectCode,
    status: p.status,
    health: p.health,
    currentPhase: p.currentPhase,
    progressPercentage: p.progressPercentage,
    taskCount: p._count.tasks,
    milestoneCount: p._count.milestones,
    issueCount: p._count.issues,
  }))

  // RAG distribution across all projects
  const [govEvents, outputValidations] = await Promise.all([
    prisma.governanceEvent.groupBy({ by: ['ragStatus'], where: { organizationId }, _count: true }),
    prisma.outputValidation.groupBy({ by: ['result'], where: { organizationId }, _count: true }),
  ])

  const ragDistribution = {
    green: govEvents.find(e => e.ragStatus === 'GREEN')?._count ?? 0,
    amber: govEvents.find(e => e.ragStatus === 'AMBER')?._count ?? 0,
    red: govEvents.find(e => e.ragStatus === 'RED')?._count ?? 0,
  }

  const validationDistribution = {
    pass: outputValidations.find(v => v.result === 'PASS')?._count ?? 0,
    warning: outputValidations.find(v => v.result === 'WARNING')?._count ?? 0,
    fail: outputValidations.find(v => v.result === 'FAIL')?._count ?? 0,
  }

  return { totals, projectSummaries, ragDistribution, validationDistribution }
}

// ── Project Dashboard ─────────────────────────────────────────────────────────

export async function getProjectDashboard(organizationId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: { customer: { select: { name: true } } },
  })
  if (!project) throw Errors.notFound('Project')

  // Parallel fetches for efficiency
  const [
    tasks, milestones, requirements, painPoints,
    fitGapItems, uatScenarios, sopDocuments, processCount,
    integrations, restlets, apiContracts, payloads,
    hypercareTasks, issues, goLiveItems, changeRequests,
    aiOutputs, governanceEvents, validations,
  ] = await Promise.all([
    prisma.projectTask.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.projectMilestone.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.requirement.count({ where: { projectId } }),
    prisma.painPoint.count({ where: { projectId } }),
    prisma.fitGapAnalysis.groupBy({ by: ['fitCategory'], where: { projectId }, _count: true }),
    prisma.uatScenario.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.sopDocument.count({ where: { projectId } }),
    prisma.businessProcess.count({ where: { projectId } }),
    prisma.integrationMapping.count({ where: { projectId } }),
    prisma.restletDesign.count({ where: { projectId } }),
    prisma.apiContract.count({ where: { projectId } }),
    prisma.payloadValidation.count({ where: { projectId } }),
    prisma.hypercareTask.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.issue.groupBy({ by: ['status', 'severity'], where: { projectId }, _count: true }),
    prisma.goLiveReadiness.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.changeRequest.groupBy({ by: ['status'], where: { projectId }, _count: true }),
    prisma.aiGeneratedOutput.groupBy({ by: ['outputType', 'status'], where: { projectId }, _count: true }),
    prisma.governanceEvent.groupBy({ by: ['ragStatus', 'eventType'], where: { projectId }, _count: true }),
    prisma.outputValidation.groupBy({ by: ['result'], where: { projectId }, _count: true }),
  ])

  // Task KPIs
  const totalTasks = tasks.reduce((sum, t) => sum + t._count, 0)
  const doneTasks = tasks.find(t => t.status === 'DONE')?._count ?? 0
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // Milestone KPIs
  const totalMilestones = milestones.reduce((sum, m) => sum + m._count, 0)
  const completedMilestones = milestones.find(m => m.status === 'COMPLETED')?._count ?? 0
  const milestoneCompletionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  // Fit-Gap KPIs
  const totalFitGap = fitGapItems.reduce((sum, f) => sum + f._count, 0)
  const gaps = fitGapItems.find(f => f.fitCategory === 'GAP')?._count ?? 0
  const fitGapCoverage = totalFitGap > 0 ? Math.round(((totalFitGap - gaps) / totalFitGap) * 100) : 0

  // UAT KPIs
  const totalUat = uatScenarios.reduce((sum, u) => sum + u._count, 0)
  const passedUat = uatScenarios.find(u => u.status === 'PASSED')?._count ?? 0
  const uatPassRate = totalUat > 0 ? Math.round((passedUat / totalUat) * 100) : 0

  // Hypercare KPIs
  const totalHcTasks = hypercareTasks.reduce((sum, t) => sum + t._count, 0)
  const doneHcTasks = hypercareTasks.find(t => t.status === 'DONE')?._count ?? 0
  const hcTaskCompletion = totalHcTasks > 0 ? Math.round((doneHcTasks / totalHcTasks) * 100) : 0

  const totalGoLive = goLiveItems.reduce((sum, g) => sum + g._count, 0)
  const completedGoLive = goLiveItems.find(g => g.status === 'COMPLETED')?._count ?? 0
  const naGoLive = goLiveItems.find(g => g.status === 'NOT_APPLICABLE')?._count ?? 0
  const goLiveReadiness = (totalGoLive - naGoLive) > 0 ? Math.round((completedGoLive / (totalGoLive - naGoLive)) * 100) : 0

  const openIssues = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').reduce((s, i) => s + i._count, 0)
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').reduce((s, i) => s + i._count, 0)

  // AI & Governance KPIs
  const totalAiOutputs = aiOutputs.reduce((sum, o) => sum + o._count, 0)
  const hallucinationCount = governanceEvents.filter(e => e.eventType === 'HALLUCINATION_DETECTED').reduce((s, e) => s + e._count, 0)
  const ragGreen = governanceEvents.filter(e => e.ragStatus === 'GREEN').reduce((s, e) => s + e._count, 0)
  const ragAmber = governanceEvents.filter(e => e.ragStatus === 'AMBER').reduce((s, e) => s + e._count, 0)
  const ragRed = governanceEvents.filter(e => e.ragStatus === 'RED').reduce((s, e) => s + e._count, 0)
  const validationPassRate = validations.reduce((s, v) => s + v._count, 0) > 0
    ? Math.round((validations.find(v => v.result === 'PASS')?._count ?? 0) / validations.reduce((s, v) => s + v._count, 0) * 100)
    : 0

  return {
    project: { id: project.id, name: project.name, projectCode: project.projectCode, status: project.status, health: project.health, currentPhase: project.currentPhase, progressPercentage: project.progressPercentage, customer: project.customer.name },
    presales: { requirementsCount: requirements, painPointsCount: painPoints, aiOutputsCount: totalAiOutputs },
    functional: { processCount, fitGapCount: totalFitGap, fitGapCoverage, uatCount: totalUat, uatPassRate, sopCount: sopDocuments },
    technical: { integrationCount: integrations, restletCount: restlets, apiContractCount: apiContracts, payloadCount: payloads },
    tasks: { total: totalTasks, done: doneTasks, completionRate: taskCompletionRate },
    milestones: { total: totalMilestones, completed: completedMilestones, completionRate: milestoneCompletionRate },
    hypercare: { taskTotal: totalHcTasks, taskCompletion: hcTaskCompletion, openIssues, criticalIssues, goLiveReadiness, pendingChangeRequests: changeRequests.filter(c => c.status === 'PROPOSED' || c.status === 'IN_REVIEW').reduce((s, c) => s + c._count, 0) },
    governance: { totalAiOutputs, hallucinationCount, ragGreen, ragAmber, ragRed, validationPassRate },
  }
}

// ── KPI Trends ────────────────────────────────────────────────────────────────

export async function getKpiTrends(organizationId: string, projectId: string | undefined, metric: string, timeRange: number = 30) {
  // Validate project belongs to org if projectId provided
  if (projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, organizationId } })
    if (!project) throw Errors.notFound('Project')
  }

  const since = new Date()
  since.setDate(since.getDate() - timeRange)

  // Return stored trend history if available
  const trends = await prisma.dashboardTrendHistory.findMany({
    where: {
      organizationId,
      ...(projectId && { projectId }),
      metricName: metric,
      createdAt: { gte: since },
    },
    orderBy: { period: 'asc' },
    take: timeRange,
  })

  // If no stored trends, compute simple current-period stats
  if (trends.length === 0) {
    // Return current snapshot based on metric
    let currentValue = 0
    if (projectId) {
      if (metric === 'task_completion') {
        const tasks = await prisma.projectTask.groupBy({ by: ['status'], where: { projectId }, _count: true })
        const total = tasks.reduce((s, t) => s + t._count, 0)
        const done = tasks.find(t => t.status === 'DONE')?._count ?? 0
        currentValue = total > 0 ? Math.round((done / total) * 100) : 0
      } else if (metric === 'issue_count') {
        currentValue = await prisma.issue.count({ where: { projectId, status: { in: ['OPEN', 'IN_PROGRESS'] } } })
      } else if (metric === 'rag_red_count') {
        const events = await prisma.governanceEvent.count({ where: { projectId, ragStatus: 'RED' } })
        currentValue = events
      } else if (metric === 'ai_outputs') {
        currentValue = await prisma.aiGeneratedOutput.count({ where: { projectId } })
      }
    }
    return [{ period: new Date().toISOString().split('T')[0], metricValue: currentValue }]
  }

  return trends.map(t => ({ period: t.period, metricValue: t.metricValue }))
}

// ── RAG Overview ──────────────────────────────────────────────────────────────

export async function getRagOverview(organizationId: string, projectId?: string) {
  const where = { organizationId, ...(projectId && { projectId }) }

  const [outputs, events, validations, gates] = await Promise.all([
    prisma.aiGeneratedOutput.findMany({
      where: projectId ? { projectId, organizationId } : { organizationId },
      select: { id: true, title: true, outputType: true, status: true, confidenceScore: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.governanceEvent.groupBy({ by: ['ragStatus', 'eventType'], where, _count: true }),
    prisma.outputValidation.groupBy({ by: ['result'], where, _count: true }),
    prisma.reviewGateStatus.groupBy({ by: ['stage', 'status'], where, _count: true }),
  ])

  const ragCounts = {
    green: events.filter(e => e.ragStatus === 'GREEN').reduce((s, e) => s + e._count, 0),
    amber: events.filter(e => e.ragStatus === 'AMBER').reduce((s, e) => s + e._count, 0),
    red: events.filter(e => e.ragStatus === 'RED').reduce((s, e) => s + e._count, 0),
  }

  const hallucinationCount = events.filter(e => e.eventType === 'HALLUCINATION_DETECTED').reduce((s, e) => s + e._count, 0)

  const validationSummary = {
    pass: validations.find(v => v.result === 'PASS')?._count ?? 0,
    warning: validations.find(v => v.result === 'WARNING')?._count ?? 0,
    fail: validations.find(v => v.result === 'FAIL')?._count ?? 0,
  }

  const pendingGates = gates.filter(g => g.status === 'PENDING').reduce((s, g) => s + g._count, 0)

  return {
    totalOutputs: outputs.length,
    ragCounts,
    hallucinationCount,
    validationSummary,
    pendingGates,
    recentOutputs: outputs.slice(0, 10).map(o => ({
      id: o.id, title: o.title, outputType: o.outputType, status: o.status, confidenceScore: o.confidenceScore,
    })),
  }
}

// ── Hypercare Summary ─────────────────────────────────────────────────────────

export async function getHypercareSummary(organizationId: string, projectId?: string) {
  const where = { organizationId, ...(projectId && { projectId }) }

  const [tasks, issues, goLive, changeRequests, risks] = await Promise.all([
    prisma.hypercareTask.groupBy({ by: ['status', 'priority'], where, _count: true }),
    prisma.issue.groupBy({ by: ['status', 'severity'], where, _count: true }),
    prisma.goLiveReadiness.groupBy({ by: ['status'], where, _count: true }),
    prisma.changeRequest.groupBy({ by: ['status', 'priority'], where, _count: true }),
    prisma.postImplementationRisk.groupBy({ by: ['status', 'severity'], where, _count: true }),
  ])

  const totalTasks = tasks.reduce((s, t) => s + t._count, 0)
  const doneTasks = tasks.filter(t => t.status === 'DONE').reduce((s, t) => s + t._count, 0)
  const escalatedTasks = tasks.filter(t => t.status === 'ESCALATED').reduce((s, t) => s + t._count, 0)
  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL').reduce((s, t) => s + t._count, 0)

  const totalIssues = issues.reduce((s, i) => s + i._count, 0)
  const openIssues = issues.filter(i => ['OPEN', 'IN_PROGRESS', 'ESCALATED'].includes(i.status)).reduce((s, i) => s + i._count, 0)
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').reduce((s, i) => s + i._count, 0)

  const totalGoLive = goLive.reduce((s, g) => s + g._count, 0)
  const completedGoLive = goLive.find(g => g.status === 'COMPLETED')?._count ?? 0
  const naGoLive = goLive.find(g => g.status === 'NOT_APPLICABLE')?._count ?? 0
  const goLiveReadiness = (totalGoLive - naGoLive) > 0 ? Math.round((completedGoLive / (totalGoLive - naGoLive)) * 100) : 0

  const pendingCRs = changeRequests.filter(c => ['PROPOSED', 'IN_REVIEW'].includes(c.status)).reduce((s, c) => s + c._count, 0)

  const openRisks = risks.filter(r => ['OPEN', 'MONITORING'].includes(r.status)).reduce((s, r) => s + r._count, 0)
  const criticalRisks = risks.filter(r => r.severity === 'CRITICAL').reduce((s, r) => s + r._count, 0)

  return {
    tasks: { total: totalTasks, done: doneTasks, escalated: escalatedTasks, critical: criticalTasks, completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0 },
    issues: { total: totalIssues, open: openIssues, critical: criticalIssues },
    goLive: { total: totalGoLive, completed: completedGoLive, readiness: goLiveReadiness },
    changeRequests: { pending: pendingCRs, total: changeRequests.reduce((s, c) => s + c._count, 0) },
    risks: { open: openRisks, critical: criticalRisks, total: risks.reduce((s, r) => s + r._count, 0) },
  }
}

// ── Workstream Dashboard ──────────────────────────────────────────────────────

export async function getWorkstreamDashboard(organizationId: string, workstreamId: string) {
  // Try functional workstream first
  const functionalWs = await prisma.functionalWorkstream.findFirst({
    where: { id: workstreamId },
    include: { project: { select: { organizationId: true, name: true } } },
  })

  if (functionalWs) {
    if (functionalWs.project.organizationId !== organizationId) throw Errors.notFound('Workstream')
    const [processes, uatScenarios, sops, deliverables] = await Promise.all([
      prisma.businessProcess.count({ where: { workstreamId } }),
      prisma.uatScenario.groupBy({ by: ['status'], where: { workstreamId }, _count: true }),
      prisma.sopDocument.groupBy({ by: ['status'], where: { workstreamId }, _count: true }),
      prisma.functionalDeliverable.groupBy({ by: ['status'], where: { workstreamId }, _count: true }),
    ])
    const uatTotal = uatScenarios.reduce((s, u) => s + u._count, 0)
    const uatPassed = uatScenarios.find(u => u.status === 'PASSED')?._count ?? 0
    return {
      workstreamType: 'FUNCTIONAL',
      workstream: { id: functionalWs.id, name: functionalWs.name, status: functionalWs.status, progressPercentage: functionalWs.progressPercentage, projectName: functionalWs.project.name },
      metrics: { processCount: processes, uatTotal, uatPassRate: uatTotal > 0 ? Math.round((uatPassed / uatTotal) * 100) : 0, sopCount: sops.reduce((s, d) => s + d._count, 0), deliverableCount: deliverables.reduce((s, d) => s + d._count, 0) },
      uatByStatus: uatScenarios, sopsByStatus: sops, deliverablesByStatus: deliverables,
    }
  }

  // Try technical workstream
  const technicalWs = await prisma.technicalWorkstream.findFirst({
    where: { id: workstreamId },
    include: { project: { select: { organizationId: true, name: true } } },
  })
  if (!technicalWs || technicalWs.project.organizationId !== organizationId) throw Errors.notFound('Workstream')

  const [deliverables] = await Promise.all([
    prisma.technicalDeliverable.groupBy({ by: ['status', 'deliverableType'], where: { workstreamId }, _count: true }),
  ])
  return {
    workstreamType: 'TECHNICAL',
    workstream: { id: technicalWs.id, name: technicalWs.name, status: technicalWs.status, progressPercentage: technicalWs.progressPercentage, projectName: technicalWs.project.name },
    metrics: { deliverableCount: deliverables.reduce((s, d) => s + d._count, 0) },
    deliverablesByStatus: deliverables,
  }
}
