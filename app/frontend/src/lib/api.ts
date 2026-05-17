import type {
  ApiResponse,
  ProjectSummary,
  ProjectTask,
  ProjectMilestone,
  RaidItem,
  ActivityItem,
  DiscoverySession,
  DiscoveryQuestion,
  DiscoveryAnswer,
  PortfolioSummary,
  ProjectDashboard,
  HypercareSummary,
  RagOverview,
  KpiTrendPoint,
  Requirement,
  PainPoint,
  AiConversation,
  AiMessage,
  AiGeneratedOutput,
  AiReview,
  RequirementAnalysis,
  PainPointClassification,
  ModuleRecommendationAnalysis,
  ScopeEstimation,
  NetsuiteModule,
  FunctionalWorkstream,
  BusinessProcess,
  ProcessStep,
  FitGapAnalysis,
  UatScenario,
  SopDocument,
  FunctionalDeliverable,
  TechnicalWorkstream,
  IntegrationMapping,
  RestletDesign,
  ApiContract,
  PayloadValidation,
  TechnicalDeliverable,
  HypercareTask,
  Issue,
  GoLiveReadiness,
  ChangeRequest,
  PostImplementationRisk,
  GovernanceEvent,
  OutputValidation,
  ReviewGateStatus,
  RagStatusReport,
  FeedbackEntry,
  OptimizationRecommendation,
  OptimizationScore,
  ContinuousImprovementSummary,
  AdminSummary,
  BillingInvoice,
  SubscriptionPlan,
  Tenant,
  TenantRole,
  TenantUsage,
  TenantUsageReport,
  TenantUserRole,
  DeploymentOverview,
  DeploymentRun,
  DeploymentEnvironment,
  ServiceMetric,
  DeploymentAlert,
  GlobalAlerts,
  GlobalDashboard,
  GlobalUser,
  SuperuserActionLog,
  AccessLog,
  ComplianceReport,
  EncryptedField,
  SecretStore,
  ProjectDocument,
  KnowledgeSource,
  KnowledgeDocument,
  KnowledgeRetrievalResult,
  EvaluationCase,
  AiEvaluationRun,
  AiRegistry,
} from '../types/index.js'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Request failed with status ${res.status}`)
  }
  return data as ApiResponse<T>
}

export const authApi = {
  me: () => request<{ id: string; name: string; email: string }>('/auth/me'),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (orgName: string, name: string, email: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ organizationName: orgName, name, email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
}

export const projectsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ProjectSummary[]>(`/projects${qs}`)
  },
  get: (id: string) => request<ProjectSummary>(`/projects/${id}`),
  create: (data: Record<string, unknown>) =>
    request<ProjectSummary>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<ProjectSummary>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  getMembers: (projectId: string) =>
    request<Array<{ id: string; role: string; user: { id: string; name: string; email: string } }>>(
      `/projects/${projectId}/members`
    ),
}

export const organizationApi = {
  getCurrent: () => request<Record<string, unknown>>('/organizations/current'),
  listMembers: () =>
    request<Array<{ id: string; name: string; email: string; status: string; lastLoginAt?: string | null; createdAt: string }>>(
      '/organizations/current/members'
    ),
}

export const tasksApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ProjectTask[]>(`/projects/${projectId}/tasks${qs}`)
  },
  get: (projectId: string, taskId: string) =>
    request<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<ProjectTask>(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, taskId: string, data: Record<string, unknown>) =>
    request<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (projectId: string, taskId: string) =>
    request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
}

export const milestonesApi = {
  list: (projectId: string) => request<ProjectMilestone[]>(`/projects/${projectId}/milestones`),
  get: (projectId: string, milestoneId: string) =>
    request<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<ProjectMilestone>(`/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, milestoneId: string, data: Record<string, unknown>) =>
    request<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (projectId: string, milestoneId: string) =>
    request(`/projects/${projectId}/milestones/${milestoneId}`, { method: 'DELETE' }),
}

export const raidApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<RaidItem[]>(`/projects/${projectId}/raid${qs}`)
  },
  get: (projectId: string, raidId: string) =>
    request<RaidItem>(`/projects/${projectId}/raid/${raidId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<RaidItem>(`/projects/${projectId}/raid`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, raidId: string, data: Record<string, unknown>) =>
    request<RaidItem>(`/projects/${projectId}/raid/${raidId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (projectId: string, raidId: string) =>
    request(`/projects/${projectId}/raid/${raidId}`, { method: 'DELETE' }),
}

export const activityApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ActivityItem[]>(`/projects/${projectId}/activity${qs}`)
  },
}

export const discoverySessionsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<DiscoverySession[]>(`/projects/${projectId}/discovery-sessions${qs}`)
  },
  get: (projectId: string, sessionId: string) =>
    request<DiscoverySession>(`/projects/${projectId}/discovery-sessions/${sessionId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<DiscoverySession>(`/projects/${projectId}/discovery-sessions`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, sessionId: string, data: Record<string, unknown>) =>
    request<DiscoverySession>(`/projects/${projectId}/discovery-sessions/${sessionId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (projectId: string, sessionId: string) =>
    request(`/projects/${projectId}/discovery-sessions/${sessionId}`, { method: 'DELETE' }),
}

export const discoveryQuestionsApi = {
  list: (sessionId: string) => request<DiscoveryQuestion[]>(`/discovery-sessions/${sessionId}/questions`),
  create: (sessionId: string, data: Record<string, unknown>) =>
    request<DiscoveryQuestion>(`/discovery-sessions/${sessionId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
  bulkCreate: (sessionId: string, questions: unknown[]) =>
    request<DiscoveryQuestion[]>(`/discovery-sessions/${sessionId}/questions/bulk`, { method: 'POST', body: JSON.stringify({ questions }) }),
}

export const discoveryAnswersApi = {
  list: (sessionId: string) => request<DiscoveryAnswer[]>(`/discovery-sessions/${sessionId}/answers`),
  createOrUpdate: (sessionId: string, data: Record<string, unknown>) =>
    request<DiscoveryAnswer>(`/discovery-sessions/${sessionId}/answers`, { method: 'POST', body: JSON.stringify(data) }),
}

export const requirementsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<Requirement[]>(`/projects/${projectId}/requirements${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<Requirement>(`/projects/${projectId}/requirements`, { method: 'POST', body: JSON.stringify(data) }),
}

export const painPointsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<PainPoint[]>(`/projects/${projectId}/pain-points${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<PainPoint>(`/projects/${projectId}/pain-points`, { method: 'POST', body: JSON.stringify(data) }),
}

export const aiConversationsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<AiConversation[]>(`/projects/${projectId}/ai/conversations${qs}`)
  },
  get: (projectId: string, conversationId: string) =>
    request<AiConversation>(`/projects/${projectId}/ai/conversations/${conversationId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<AiConversation>(`/projects/${projectId}/ai/conversations`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, conversationId: string, data: Record<string, unknown>) =>
    request<AiConversation>(`/projects/${projectId}/ai/conversations/${conversationId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const aiMessagesApi = {
  list: (conversationId: string) => request<AiMessage[]>(`/ai/conversations/${conversationId}/messages`),
  create: (conversationId: string, data: Record<string, unknown>) =>
    request<AiMessage>(`/ai/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
}

export const aiGeneratedOutputsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<AiGeneratedOutput[]>(`/projects/${projectId}/ai/generated-outputs${qs}`)
  },
  get: (projectId: string, outputId: string) =>
    request<AiGeneratedOutput>(`/projects/${projectId}/ai/generated-outputs/${outputId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<AiGeneratedOutput>(`/projects/${projectId}/ai/generated-outputs`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, outputId: string, data: Record<string, unknown>) =>
    request<AiGeneratedOutput>(`/projects/${projectId}/ai/generated-outputs/${outputId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  review: (projectId: string, outputId: string, data: Record<string, unknown>) =>
    request<AiReview>(`/projects/${projectId}/ai/generated-outputs/${outputId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
}

// ── AI Presales Intelligence APIs ──

export const requirementAnalysisApi = {
  run: (projectId: string, data?: Record<string, unknown>) =>
    request<{ analysisCount: number; generatedOutputId: string }>(`/projects/${projectId}/ai/analyze-requirements`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<RequirementAnalysis[]>(`/projects/${projectId}/ai/requirement-analysis${qs}`)
  },
}

export const painPointAnalysisApi = {
  run: (projectId: string, data?: Record<string, unknown>) =>
    request<{ analysisCount: number; generatedOutputId: string }>(`/projects/${projectId}/ai/classify-pain-points`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<PainPointClassification[]>(`/projects/${projectId}/ai/pain-point-analysis${qs}`)
  },
}

export const moduleRecommendationsApi = {
  run: (projectId: string, data?: Record<string, unknown>) =>
    request<{ recommendationCount: number; generatedOutputId: string }>(`/projects/${projectId}/ai/recommend-modules`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ModuleRecommendationAnalysis[]>(`/projects/${projectId}/ai/module-recommendations${qs}`)
  },
}

export const scopeEstimationApi = {
  run: (projectId: string, data?: Record<string, unknown>) =>
    request<ScopeEstimation>(`/projects/${projectId}/ai/estimate-scope`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ScopeEstimation[]>(`/projects/${projectId}/ai/scope-estimations${qs}`)
  },
}

export const proposalDraftsApi = {
  generate: (projectId: string, data?: Record<string, unknown>) =>
    request<AiGeneratedOutput>(`/projects/${projectId}/ai/generate-proposal-draft`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<AiGeneratedOutput[]>(`/projects/${projectId}/ai/proposal-drafts${qs}`)
  },
}

export const netsuiteCatalogApi = {
  list: () => request<NetsuiteModule[]>('/netsuite-catalog'),
}

// ── Functional Delivery Intelligence APIs ──

export const workstreamsApi = {
  list: (projectId: string) => request<FunctionalWorkstream[]>(`/projects/${projectId}/workstreams`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<FunctionalWorkstream>(`/projects/${projectId}/workstreams`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, workstreamId: string, data: Record<string, unknown>) =>
    request<FunctionalWorkstream>(`/projects/${projectId}/workstreams/${workstreamId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const businessProcessesApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<BusinessProcess[]>(`/projects/${projectId}/processes${qs}`)
  },
  get: (projectId: string, processId: string) => request<BusinessProcess>(`/projects/${projectId}/processes/${processId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<BusinessProcess>(`/projects/${projectId}/processes`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, processId: string, data: Record<string, unknown>) =>
    request<BusinessProcess>(`/projects/${projectId}/processes/${processId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addStep: (projectId: string, processId: string, data: Record<string, unknown>) =>
    request<ProcessStep>(`/projects/${projectId}/processes/${processId}/steps`, { method: 'POST', body: JSON.stringify(data) }),
}

export const fitGapApi = {
  run: (projectId: string, data?: Record<string, unknown>) =>
    request<{ analysisCount: number; generatedOutputId: string }>(`/projects/${projectId}/ai/generate-fit-gap`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<FitGapAnalysis[]>(`/projects/${projectId}/fit-gap-analysis${qs}`)
  },
}

export const uatApi = {
  generate: (projectId: string, data?: Record<string, unknown>) =>
    request<{ scenarioCount: number }>(`/projects/${projectId}/ai/generate-uat`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<UatScenario[]>(`/projects/${projectId}/uat-scenarios${qs}`)
  },
  update: (projectId: string, scenarioId: string, data: Record<string, unknown>) =>
    request<UatScenario>(`/projects/${projectId}/uat-scenarios/${scenarioId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const sopApi = {
  generate: (projectId: string, data: Record<string, unknown>) =>
    request<SopDocument>(`/projects/${projectId}/ai/generate-sop`, { method: 'POST', body: JSON.stringify(data) }),
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<SopDocument[]>(`/projects/${projectId}/sop-documents${qs}`)
  },
  update: (projectId: string, sopId: string, data: Record<string, unknown>) =>
    request<SopDocument>(`/projects/${projectId}/sop-documents/${sopId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const functionalDeliverablesApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<FunctionalDeliverable[]>(`/projects/${projectId}/functional-deliverables${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<FunctionalDeliverable>(`/projects/${projectId}/functional-deliverables`, { method: 'POST', body: JSON.stringify(data) }),
}

// ── Technical Delivery Intelligence APIs ──

export const technicalWorkstreamsApi = {
  list: (projectId: string) => request<TechnicalWorkstream[]>(`/projects/${projectId}/technical-workstreams`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<TechnicalWorkstream>(`/projects/${projectId}/technical-workstreams`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, workstreamId: string, data: Record<string, unknown>) =>
    request<TechnicalWorkstream>(`/projects/${projectId}/technical-workstreams/${workstreamId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const integrationMappingsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<IntegrationMapping[]>(`/projects/${projectId}/integration-mappings${qs}`)
  },
  get: (projectId: string, mappingId: string) => request<IntegrationMapping>(`/projects/${projectId}/integration-mappings/${mappingId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<IntegrationMapping>(`/projects/${projectId}/integration-mappings`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, mappingId: string, data: Record<string, unknown>) =>
    request<IntegrationMapping>(`/projects/${projectId}/integration-mappings/${mappingId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const restletDesignsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<RestletDesign[]>(`/projects/${projectId}/restlet-designs${qs}`)
  },
  get: (projectId: string, restletId: string) => request<RestletDesign>(`/projects/${projectId}/restlet-designs/${restletId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<RestletDesign>(`/projects/${projectId}/restlet-designs`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, restletId: string, data: Record<string, unknown>) =>
    request<RestletDesign>(`/projects/${projectId}/restlet-designs/${restletId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const apiContractsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ApiContract[]>(`/projects/${projectId}/api-contracts${qs}`)
  },
  get: (projectId: string, contractId: string) => request<ApiContract>(`/projects/${projectId}/api-contracts/${contractId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<ApiContract>(`/projects/${projectId}/api-contracts`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, contractId: string, data: Record<string, unknown>) =>
    request<ApiContract>(`/projects/${projectId}/api-contracts/${contractId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const payloadValidationsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<PayloadValidation[]>(`/projects/${projectId}/payload-validations${qs}`)
  },
  get: (projectId: string, validationId: string) => request<PayloadValidation>(`/projects/${projectId}/payload-validations/${validationId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<PayloadValidation>(`/projects/${projectId}/payload-validations`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, validationId: string, data: Record<string, unknown>) =>
    request<PayloadValidation>(`/projects/${projectId}/payload-validations/${validationId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const technicalDeliverablesApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<TechnicalDeliverable[]>(`/projects/${projectId}/technical-deliverables${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<TechnicalDeliverable>(`/projects/${projectId}/technical-deliverables`, { method: 'POST', body: JSON.stringify(data) }),
}

// ── Post-Implementation / Hypercare APIs ──

export const hypercareTasksApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<HypercareTask[]>(`/projects/${projectId}/hypercare/tasks${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<HypercareTask>(`/projects/${projectId}/hypercare/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, taskId: string, data: Record<string, unknown>) =>
    request<HypercareTask>(`/projects/${projectId}/hypercare/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (projectId: string, taskId: string) =>
    request(`/projects/${projectId}/hypercare/tasks/${taskId}`, { method: 'DELETE' }),
}

export const issuesApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<Issue[]>(`/projects/${projectId}/hypercare/issues${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<Issue>(`/projects/${projectId}/hypercare/issues`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, issueId: string, data: Record<string, unknown>) =>
    request<Issue>(`/projects/${projectId}/hypercare/issues/${issueId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (projectId: string, issueId: string) =>
    request(`/projects/${projectId}/hypercare/issues/${issueId}`, { method: 'DELETE' }),
}

export const goLiveApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<GoLiveReadiness[]>(`/projects/${projectId}/hypercare/go-live${qs}`)
  },
  bulkCreate: (projectId: string, items: { checklistItem: string }[]) =>
    request<GoLiveReadiness[]>(`/projects/${projectId}/hypercare/go-live/bulk`, { method: 'POST', body: JSON.stringify({ items }) }),
  update: (projectId: string, itemId: string, data: Record<string, unknown>) =>
    request<GoLiveReadiness>(`/projects/${projectId}/hypercare/go-live/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const changeRequestsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ChangeRequest[]>(`/projects/${projectId}/hypercare/change-requests${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<ChangeRequest>(`/projects/${projectId}/hypercare/change-requests`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, changeId: string, data: Record<string, unknown>) =>
    request<ChangeRequest>(`/projects/${projectId}/hypercare/change-requests/${changeId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const postImplRisksApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<PostImplementationRisk[]>(`/projects/${projectId}/hypercare/risks${qs}`)
  },
  create: (projectId: string, data: Record<string, unknown>) =>
    request<PostImplementationRisk>(`/projects/${projectId}/hypercare/risks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, riskId: string, data: Record<string, unknown>) =>
    request<PostImplementationRisk>(`/projects/${projectId}/hypercare/risks/${riskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// ── AI Governance & RAG APIs ──

export const governanceApi = {
  listEvents: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<GovernanceEvent[]>(`/projects/${projectId}/governance/events${qs}`)
  },
  createEvent: (projectId: string, data: Record<string, unknown>) =>
    request<GovernanceEvent>(`/projects/${projectId}/governance/events`, { method: 'POST', body: JSON.stringify(data) }),
  listValidations: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<OutputValidation[]>(`/projects/${projectId}/governance/validations${qs}`)
  },
  createValidation: (projectId: string, data: Record<string, unknown>) =>
    request<OutputValidation>(`/projects/${projectId}/governance/validations`, { method: 'POST', body: JSON.stringify(data) }),
  listReviewGates: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ReviewGateStatus[]>(`/projects/${projectId}/governance/review-gates${qs}`)
  },
  createReviewGate: (projectId: string, data: Record<string, unknown>) =>
    request<ReviewGateStatus>(`/projects/${projectId}/governance/review-gates`, { method: 'POST', body: JSON.stringify(data) }),
  updateReviewGate: (projectId: string, gateId: string, data: Record<string, unknown>) =>
    request<ReviewGateStatus>(`/projects/${projectId}/governance/review-gates/${gateId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getRagStatus: (projectId: string) =>
    request<RagStatusReport>(`/projects/${projectId}/governance/rag-status`),
}

// ── Enterprise Dashboard & Reporting APIs ──

export const dashboardApi = {
  getPortfolioSummary: () => request<PortfolioSummary>('/dashboard/portfolio-summary'),
  getProjectDashboard: (projectId: string) => request<ProjectDashboard>(`/dashboard/project/${projectId}`),
  getWorkstreamDashboard: (workstreamId: string) => request<Record<string, unknown>>(`/dashboard/workstream/${workstreamId}`),
  getKpiTrends: (params: { projectId?: string; metric: string; timeRange?: number }) => {
    const qs = new URLSearchParams({ metric: params.metric, ...(params.projectId && { projectId: params.projectId }), ...(params.timeRange && { timeRange: String(params.timeRange) }) }).toString()
    return request<KpiTrendPoint[]>(`/dashboard/kpi-trends?${qs}`)
  },
  getRagOverview: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : ''
    return request<RagOverview>(`/dashboard/rag-overview${qs}`)
  },
  getHypercareSummary: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : ''
    return request<HypercareSummary>(`/dashboard/hypercare-summary${qs}`)
  },
}

// ── Continuous Improvement APIs ──

export const continuousImprovementApi = {
  getSummary: (projectId: string) =>
    request<ContinuousImprovementSummary>(`/projects/${projectId}/continuous-improvement`),

  listFeedback: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<FeedbackEntry[]>(`/projects/${projectId}/continuous-improvement/feedback${qs}`)
  },
  createFeedback: (projectId: string, data: Record<string, unknown>) =>
    request<FeedbackEntry>(`/projects/${projectId}/continuous-improvement/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listRecommendations: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<OptimizationRecommendation[]>(`/projects/${projectId}/continuous-improvement/recommendations${qs}`)
  },
  createRecommendation: (projectId: string, data: Record<string, unknown>) =>
    request<OptimizationRecommendation>(`/projects/${projectId}/continuous-improvement/recommendations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRecommendation: (projectId: string, recommendationId: string, data: Record<string, unknown>) =>
    request<OptimizationRecommendation>(`/projects/${projectId}/continuous-improvement/recommendations/${recommendationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getScores: (projectId: string) =>
    request<OptimizationScore[]>(`/projects/${projectId}/continuous-improvement/scores`),

  getTrends: (projectId: string, params?: { metricType?: string; timeRange?: number }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : ''
    return request<OptimizationScore[]>(`/projects/${projectId}/continuous-improvement/trends${qs}`)
  },
}

// ── SaaS Multi-Tenant Management APIs ──

export const adminApi = {
  getSummary: () => request<AdminSummary>('/admin/summary'),
  listTenants: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<Tenant[]>(`/tenants${qs}`)
  },
  getTenant: (tenantId: string) => request<Tenant>(`/tenants/${tenantId}`),
  createTenant: (data: Record<string, unknown>) =>
    request<Tenant>('/tenants', { method: 'POST', body: JSON.stringify(data) }),
  updateTenant: (tenantId: string, data: Record<string, unknown>) =>
    request<Tenant>(`/tenants/${tenantId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTenant: (tenantId: string) => request(`/tenants/${tenantId}`, { method: 'DELETE' }),

  listPlans: () => request<SubscriptionPlan[]>('/subscription-plans'),
  createPlan: (data: Record<string, unknown>) =>
    request<SubscriptionPlan>('/subscription-plans', { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (planId: string, data: Record<string, unknown>) =>
    request<SubscriptionPlan>(`/subscription-plans/${planId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlan: (planId: string) => request(`/subscription-plans/${planId}`, { method: 'DELETE' }),

  getUsage: (tenantId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<TenantUsageReport>(`/tenants/${tenantId}/usage${qs}`)
  },
  recordUsage: (tenantId: string, data: Record<string, unknown>) =>
    request<TenantUsage>(`/tenants/${tenantId}/usage`, { method: 'POST', body: JSON.stringify(data) }),

  listInvoices: (tenantId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<BillingInvoice[]>(`/billing/invoices/${tenantId}${qs}`)
  },
  createInvoice: (data: Record<string, unknown>) =>
    request<BillingInvoice>('/billing/create-invoice', { method: 'POST', body: JSON.stringify(data) }),
  payInvoice: (invoiceId: string, data?: Record<string, unknown>) =>
    request<BillingInvoice>(`/billing/pay-invoice/${invoiceId}`, { method: 'PATCH', body: JSON.stringify(data ?? {}) }),

  listRoles: (tenantId: string) => request<TenantRole[]>(`/tenants/${tenantId}/roles`),
  createRole: (tenantId: string, data: Record<string, unknown>) =>
    request<TenantRole>(`/tenants/${tenantId}/roles`, { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (tenantId: string, roleId: string, data: Record<string, unknown>) =>
    request<TenantRole>(`/tenants/${tenantId}/roles/${roleId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  listUserRoles: (tenantId: string) => request<TenantUserRole[]>(`/tenants/${tenantId}/user-roles`),
  assignUserRole: (tenantId: string, data: Record<string, unknown>) =>
    request<TenantUserRole>(`/tenants/${tenantId}/user-roles`, { method: 'POST', body: JSON.stringify(data) }),
  checkFeatureGate: (feature: string) =>
    request<{ allowed: boolean; feature: string }>(`/admin/feature-gate?feature=${encodeURIComponent(feature)}`),
}

export const deploymentApi = {
  getOverview: () => request<DeploymentOverview>('/deployment/overview'),
  listEnvironments: () => request<DeploymentEnvironment[]>('/deployment/environments'),
  listRuns: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<DeploymentRun[]>(`/deployment/runs${qs}`)
  },
  trigger: (data: Record<string, unknown>) =>
    request<DeploymentRun>('/deployment/trigger', { method: 'POST', body: JSON.stringify(data) }),
  rollback: (data: Record<string, unknown>) =>
    request<DeploymentRun>('/deployment/rollback', { method: 'POST', body: JSON.stringify(data) }),
  selfHeal: (serviceId: string) =>
    request<{ service: unknown; run: DeploymentRun }>(`/deployment/services/${serviceId}/self-heal`, { method: 'POST' }),
  getHealth: () => request<Record<string, unknown>>('/deployment/health'),
  listMetrics: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ServiceMetric[]>(`/deployment/metrics${qs}`)
  },
  recordMetric: (data: Record<string, unknown>) =>
    request<ServiceMetric>('/deployment/metrics', { method: 'POST', body: JSON.stringify(data) }),
  createAlert: (data: Record<string, unknown>) =>
    request<DeploymentAlert>('/deployment/alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateAlert: (alertId: string, data: Record<string, unknown>) =>
    request<DeploymentAlert>(`/deployment/alerts/${alertId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const globalAdminApi = {
  getDashboard: () => request<GlobalDashboard>('/admin/global-dashboard'),
  listTenants: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<Tenant[]>(`/admin/tenants${qs}`)
  },
  overrideSubscription: (tenantId: string, data: Record<string, unknown>) =>
    request<Tenant>(`/admin/tenants/${tenantId}/override-subscription`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateTenantStatus: (tenantId: string, data: Record<string, unknown>) =>
    request<Tenant>(`/admin/tenants/${tenantId}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  listUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<GlobalUser[]>(`/admin/users${qs}`)
  },
  updateUserRole: (userId: string, data: Record<string, unknown>) =>
    request<SuperuserActionLog | unknown>(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAlerts: () => request<GlobalAlerts>('/admin/global-alerts'),
  triggerDeployment: (data: Record<string, unknown>) =>
    request<DeploymentRun>('/admin/deployments/trigger', { method: 'POST', body: JSON.stringify(data) }),
}

export const securityApi = {
  listAccessLogs: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<AccessLog[]>(`/security/access-logs${qs}`)
  },
  listSecrets: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<SecretStore[]>(`/security/secrets${qs}`)
  },
  createSecret: (data: Record<string, unknown>) =>
    request<SecretStore>('/security/secrets', { method: 'POST', body: JSON.stringify(data) }),
  rotateSecret: (secretId: string, data: Record<string, unknown>) =>
    request<SecretStore>(`/security/secrets/${secretId}/rotate`, { method: 'PATCH', body: JSON.stringify(data) }),
  listEncryptedFields: () => request<EncryptedField[]>('/security/encrypted-fields'),
  getComplianceReport: () => request<ComplianceReport>('/security/compliance-report'),
}

export const documentsApi = {
  list: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<ProjectDocument[]>(`/projects/${projectId}/documents${qs}`)
  },
  get: (projectId: string, documentId: string) =>
    request<ProjectDocument>(`/projects/${projectId}/documents/${documentId}`),
  create: (projectId: string, data: Record<string, unknown>) =>
    request<ProjectDocument>(`/projects/${projectId}/documents`, { method: 'POST', body: JSON.stringify(data) }),
  update: (projectId: string, documentId: string, data: Record<string, unknown>) =>
    request<ProjectDocument>(`/projects/${projectId}/documents/${documentId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  comment: (projectId: string, documentId: string, data: Record<string, unknown>) =>
    request<ProjectDocument>(`/projects/${projectId}/documents/${documentId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
}

export const knowledgeApi = {
  listSources: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<KnowledgeSource[]>(`/projects/${projectId}/knowledge/sources${qs}`)
  },
  createSource: (projectId: string, data: Record<string, unknown>) =>
    request<KnowledgeSource>(`/projects/${projectId}/knowledge/sources`, { method: 'POST', body: JSON.stringify(data) }),
  updateSource: (projectId: string, sourceId: string, data: Record<string, unknown>) =>
    request<KnowledgeSource>(`/projects/${projectId}/knowledge/sources/${sourceId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createDocument: (projectId: string, data: Record<string, unknown>) =>
    request<KnowledgeDocument>(`/projects/${projectId}/knowledge/documents`, { method: 'POST', body: JSON.stringify(data) }),
  retrieve: (projectId: string, data: Record<string, unknown>) =>
    request<KnowledgeRetrievalResult[]>(`/projects/${projectId}/knowledge/retrieve`, { method: 'POST', body: JSON.stringify(data) }),
}

export const evaluationsApi = {
  listCases: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<EvaluationCase[]>(`/projects/${projectId}/evaluations/cases${qs}`)
  },
  createCase: (projectId: string, data: Record<string, unknown>) =>
    request<EvaluationCase>(`/projects/${projectId}/evaluations/cases`, { method: 'POST', body: JSON.stringify(data) }),
  listRuns: (projectId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<AiEvaluationRun[]>(`/projects/${projectId}/evaluations/runs${qs}`)
  },
  run: (projectId: string, data: Record<string, unknown>) =>
    request<AiEvaluationRun>(`/projects/${projectId}/evaluations/runs`, { method: 'POST', body: JSON.stringify(data) }),
}

export const aiRegistryApi = {
  get: () => request<AiRegistry>('/ai/registry'),
  createAgent: (data: Record<string, unknown>) =>
    request('/ai/registry/agents', { method: 'POST', body: JSON.stringify(data) }),
  createSkill: (data: Record<string, unknown>) =>
    request('/ai/registry/skills', { method: 'POST', body: JSON.stringify(data) }),
}
