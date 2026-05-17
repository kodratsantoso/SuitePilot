// Shared frontend types matching API response shapes

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PaginationMeta
  error?: { code: string; message: string }
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export type ProjectStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'AT_RISK'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED'

export type ProjectHealth = 'GREEN' | 'AMBER' | 'RED' | 'UNKNOWN'

export type ProjectType =
  | 'NEW_IMPLEMENTATION'
  | 'OPTIMIZATION'
  | 'INTEGRATION'
  | 'SUPPORT'
  | 'UPGRADE'
  | 'ASSESSMENT'

export type ProjectPhase =
  | 'PRESALES'
  | 'DISCOVERY'
  | 'DESIGN'
  | 'BUILD'
  | 'UAT'
  | 'CUTOVER'
  | 'HYPERCARE'
  | 'CLOSED'

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'AT_RISK' | 'CANCELLED'
export type RaidType = 'RISK' | 'ASSUMPTION' | 'ISSUE' | 'DEPENDENCY' | 'DECISION'
export type RaidStatus = 'OPEN' | 'MONITORING' | 'MITIGATED' | 'RESOLVED' | 'CLOSED' | 'ESCALATED'

export interface UserSummary {
  id: string
  name: string
  email?: string
  avatarUrl?: string | null
}

export interface CustomerSummary {
  id: string
  name: string
  industry?: string | null
}

export interface ProjectSummary {
  id: string
  organizationId: string
  projectCode: string
  name: string
  description?: string | null
  projectType: ProjectType
  status: ProjectStatus
  health: ProjectHealth
  currentPhase: ProjectPhase
  startDate?: string | null
  targetGoLiveDate?: string | null
  actualGoLiveDate?: string | null
  progressPercentage: number
  createdAt: string
  updatedAt: string
  customer: CustomerSummary
  projectManager?: UserSummary | null
  functionalLead?: UserSummary | null
  technicalLead?: UserSummary | null
  _count: {
    tasks: number
    milestones: number
    raidItems: number
    members: number
  }
}

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  startDate?: string | null
  completedDate?: string | null
  createdAt: string
  updatedAt: string
  owner?: UserSummary | null
}

export interface ProjectMilestone {
  id: string
  projectId: string
  name: string
  description?: string | null
  status: MilestoneStatus
  targetDate: string
  actualDate?: string | null
  completionPercentage: number
  createdAt: string
  updatedAt: string
  owner?: UserSummary | null
}

export interface RaidItem {
  id: string
  projectId: string
  type: RaidType
  title: string
  description: string
  status: RaidStatus
  severity?: string | null
  probability?: string | null
  impact?: string | null
  mitigation?: string | null
  dueDate?: string | null
  createdAt: string
  updatedAt: string
  owner?: UserSummary | null
}

export interface AuthUser {
  id: string
  name: string
  email: string
  organizationId: string
  avatarUrl?: string | null
}

export interface ActivityItem {
  id: string
  actor: { id: string; name: string } | null
  action: string
  entityType: string
  entityId: string | null
  description: string
  createdAt: string
}

export interface ProjectMember {
  id: string
  role: string
  user: { id: string; name: string; email: string }
}

// ── AI Discovery Workspace Types ──

export type DiscoverySessionStatus = 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED'
export type QuestionCategory = 'COMPANY_PROFILE' | 'FINANCE' | 'PROCUREMENT' | 'INVENTORY' | 'SALES' | 'CRM' | 'MANUFACTURING' | 'REPORTING' | 'INTEGRATION' | 'COMPLIANCE' | 'PAIN_POINT' | 'GOVERNANCE' | 'TECHNICAL' | 'OTHER'
export type RequirementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RequirementSource = 'MANUAL' | 'AI_EXTRACTED' | 'MEETING' | 'DOCUMENT' | 'INTERVIEW'
export type AssumptionStatus = 'OPEN' | 'VALIDATED' | 'INVALID' | 'PENDING_REVIEW'
export type AiConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'LOCKED'
export type AiMessageRole = 'SYSTEM' | 'USER' | 'ASSISTANT'
export type AiOutputType = 'DISCOVERY_SUMMARY' | 'REQUIREMENT_ANALYSIS' | 'PAIN_POINT_ANALYSIS' | 'MODULE_RECOMMENDATION' | 'SCOPE_DRAFT' | 'PROPOSAL_DRAFT' | 'BRD_DRAFT' | 'FIT_GAP_DRAFT' | 'RISK_SUMMARY' | 'MEETING_SUMMARY'
export type AiOutputStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISED' | 'PUBLISHED'
export type AiReviewStatus = 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface DiscoverySession {
  id: string
  organizationId: string
  projectId: string
  title: string
  description?: string | null
  status: DiscoverySessionStatus
  startedAt?: string | null
  completedAt?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  _count?: { questions: number; requirements: number }
}

export interface DiscoveryQuestion {
  id: string
  discoverySessionId: string
  category: QuestionCategory
  question: string
  order: number
  createdAt: string
  answers?: DiscoveryAnswer[]
}

export interface DiscoveryAnswer {
  id: string
  discoveryQuestionId: string
  discoverySessionId: string
  answer: string
  answeredBy: string
  createdAt: string
  updatedAt: string
}

export interface Requirement {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  title: string
  description?: string | null
  category?: QuestionCategory | null
  priority: RequirementPriority
  source: RequirementSource
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PainPoint {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  title: string
  description?: string | null
  severity: Severity
  impactedArea?: string | null
  createdAt: string
  updatedAt: string
}

export interface AiConversation {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  title: string
  agentName?: string | null
  skillName?: string | null
  status: AiConversationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  messages?: AiMessage[]
  _count?: { messages: number; generatedOutputs: number }
}

export interface AiMessage {
  id: string
  conversationId: string
  role: AiMessageRole
  content: string
  tokenUsage?: number | null
  model?: string | null
  createdAt: string
}

export interface AiGeneratedOutput {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  conversationId?: string | null
  outputType: AiOutputType
  title: string
  content: string
  version: number
  status: AiOutputStatus
  generatedByAgent?: string | null
  generatedBySkill?: string | null
  confidenceScore?: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
  reviews?: AiReview[]
  _count?: { reviews: number }
}

export interface AiReview {
  id: string
  aiGeneratedOutputId: string
  reviewerId: string
  status: AiReviewStatus
  comments?: string | null
  reviewedAt?: string | null
  createdAt: string
  reviewer?: { id: string; name: string }
}

// ── AI Presales Intelligence Types ──

export type EstimatedComplexity = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
export type ProposalSectionType = 'EXECUTIVE_SUMMARY' | 'CHALLENGES' | 'PROPOSED_SOLUTION' | 'SCOPE' | 'TIMELINE' | 'ASSUMPTIONS' | 'RISKS' | 'DELIVERABLES' | 'NEXT_STEPS'

export interface RequirementAnalysis {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  requirementId: string
  analysis: string
  confidenceScore?: number | null
  evidence?: Record<string, unknown> | null
  generatedByAgent?: string | null
  generatedBySkill?: string | null
  createdAt: string
  requirement?: { id: string; title: string; priority: string }
}

export interface PainPointClassification {
  id: string
  organizationId: string
  projectId: string
  painPointId: string
  category: string
  severity: Severity
  rootCause?: string | null
  recommendation?: string | null
  confidenceScore?: number | null
  createdAt: string
  painPoint?: { id: string; title: string; severity: string }
}

export interface ModuleRecommendationAnalysis {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  moduleName: string
  rationale: string
  impactedArea?: string | null
  implementationImpact?: string | null
  assumptions?: string | null
  confidenceScore?: number | null
  evidence?: Record<string, unknown> | null
  generatedByAgent?: string | null
  generatedBySkill?: string | null
  createdAt: string
}

export interface ScopeEstimation {
  id: string
  organizationId: string
  projectId: string
  discoverySessionId?: string | null
  scopeSummary: string
  implementationApproach?: string | null
  estimatedComplexity: EstimatedComplexity
  assumptions?: string | null
  exclusions?: string | null
  risks?: string | null
  confidenceScore?: number | null
  generatedByAgent?: string | null
  createdAt: string
}

export interface ProposalDraftSection {
  id: string
  organizationId: string
  projectId: string
  generatedOutputId: string
  sectionType: ProposalSectionType
  title: string
  content: string
  sortOrder: number
  createdAt: string
}

export interface NetsuiteModule {
  id: string
  moduleName: string
  category: string
  description?: string | null
  dependencies?: unknown
  implementationNotes?: string | null
  createdAt: string
  updatedAt: string
}

// ── Functional Delivery Intelligence Types ──

export type WorkstreamStatus = 'PLANNED' | 'ACTIVE' | 'BLOCKED' | 'COMPLETED' | 'ON_HOLD'
export type ProcessCategory = 'PROCURE_TO_PAY' | 'ORDER_TO_CASH' | 'RECORD_TO_REPORT' | 'INVENTORY_MANAGEMENT' | 'FIXED_ASSET' | 'CRM' | 'MANUFACTURING' | 'APPROVAL_WORKFLOW' | 'REPORTING' | 'PROJECT_ACCOUNTING'
export type FitCategory = 'FIT_STANDARD' | 'FIT_WITH_CONFIGURATION' | 'FIT_WITH_WORKFLOW' | 'FIT_WITH_CUSTOMIZATION' | 'FIT_WITH_INTEGRATION' | 'GAP' | 'OUT_OF_SCOPE'
export type UatScenarioStatus = 'DRAFT' | 'READY' | 'IN_TESTING' | 'PASSED' | 'FAILED' | 'RETEST_REQUIRED'
export type UatCategory = 'POSITIVE_TEST' | 'NEGATIVE_TEST' | 'APPROVAL_TEST' | 'INTEGRATION_TEST' | 'REGRESSION_TEST' | 'SECURITY_TEST'
export type SopStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'
export type DeliverableType = 'PROCESS_MAPPING' | 'FIT_GAP_ANALYSIS' | 'UAT' | 'SOP' | 'CONFIGURATION_WORKBOOK' | 'TRAINING_MATERIAL' | 'MIGRATION_TEMPLATE'
export type FunctionalDeliverableStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'PUBLISHED'

export interface FunctionalWorkstream {
  id: string
  organizationId: string
  projectId: string
  name: string
  description?: string | null
  ownerId?: string | null
  status: WorkstreamStatus
  progressPercentage: number
  createdAt: string
  updatedAt: string
  owner?: { id: string; name: string } | null
  _count?: { businessProcesses: number; uatScenarios: number; sopDocuments: number; functionalDeliverables: number }
}

export interface BusinessProcess {
  id: string
  organizationId: string
  projectId: string
  workstreamId?: string | null
  processName: string
  processCategory: ProcessCategory
  currentState?: string | null
  futureState?: string | null
  impactedModules?: string[] | null
  createdAt: string
  updatedAt: string
  workstream?: { id: string; name: string } | null
  steps?: ProcessStep[]
  _count?: { steps: number }
}

export interface ProcessStep {
  id: string
  businessProcessId: string
  stepOrder: number
  title: string
  description?: string | null
  actor?: string | null
  systemAction?: string | null
  approvalRequired: boolean
  createdAt: string
}

export interface FitGapAnalysis {
  id: string
  organizationId: string
  projectId: string
  requirementId: string
  fitCategory: FitCategory
  rationale: string
  recommendation?: string | null
  implementationImpact?: string | null
  assumptions?: string | null
  risks?: string | null
  confidenceScore?: number | null
  generatedByAgent?: string | null
  createdAt: string
  requirement?: { id: string; title: string; priority: string }
}

export interface UatScenario {
  id: string
  organizationId: string
  projectId: string
  workstreamId?: string | null
  title: string
  category: UatCategory
  precondition?: string | null
  testSteps: string
  expectedResult: string
  affectedModule?: string | null
  businessObjective?: string | null
  status: UatScenarioStatus
  generatedByAgent?: string | null
  createdAt: string
  updatedAt: string
}

export interface SopDocument {
  id: string
  organizationId: string
  projectId: string
  workstreamId?: string | null
  title: string
  purpose?: string | null
  scope?: string | null
  responsibilities?: string | null
  processSteps?: string | null
  approvalFlow?: string | null
  exceptionHandling?: string | null
  status: SopStatus
  version: number
  generatedByAgent?: string | null
  createdAt: string
  updatedAt: string
}

export interface FunctionalDeliverable {
  id: string
  organizationId: string
  projectId: string
  workstreamId?: string | null
  deliverableType: DeliverableType
  title: string
  description?: string | null
  status: FunctionalDeliverableStatus
  version: number
  reviewStatus?: string | null
  createdAt: string
  updatedAt: string
}

// ── Post-Implementation / Hypercare Types ──

export type HypercareTaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'ESCALATED'
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'
export type GoLiveStatus = 'PENDING' | 'COMPLETED' | 'BLOCKED' | 'NOT_APPLICABLE'
export type ChangeRequestStatus = 'PROPOSED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED'
export type PostImplRiskStatus = 'OPEN' | 'MONITORING' | 'MITIGATED' | 'CLOSED'

export interface HypercareTask {
  id: string; organizationId: string; projectId: string
  title: string; description?: string | null
  ownerId?: string | null; status: HypercareTaskStatus; priority: TaskPriority
  completedAt?: string | null; createdAt: string; updatedAt: string
  owner?: { id: string; name: string } | null
}

export interface Issue {
  id: string; organizationId: string; projectId: string
  hypercareTaskId?: string | null; title: string; description?: string | null
  severity: Severity; status: IssueStatus; assignedTo?: string | null
  resolvedAt?: string | null; createdAt: string; updatedAt: string
  assignee?: { id: string; name: string } | null
}

export interface GoLiveReadiness {
  id: string; organizationId: string; projectId: string
  checklistItem: string; status: GoLiveStatus; notes?: string | null
  createdAt: string; updatedAt: string
}

export interface ChangeRequest {
  id: string; organizationId: string; projectId: string
  title: string; description?: string | null; requestedBy?: string | null
  status: ChangeRequestStatus; priority: TaskPriority
  resolvedAt?: string | null; createdAt: string; updatedAt: string
  requester?: { id: string; name: string } | null
}

export interface PostImplementationRisk {
  id: string; organizationId: string; projectId: string
  description: string; severity: Severity; status: PostImplRiskStatus
  mitigation?: string | null; createdAt: string; updatedAt: string
}

// ── AI Governance & RAG Types ──

export type GovernanceEventType = 'HALLUCINATION_DETECTED' | 'VALIDATION_PASSED' | 'VALIDATION_FAILED' | 'REVIEW_SUBMITTED' | 'QUALITY_SCORE_ASSIGNED'
export type ValidationType = 'SCHEMA_CHECK' | 'DATA_CONSISTENCY' | 'BUSINESS_RULE_CHECK'
export type ValidationResult = 'PASS' | 'WARNING' | 'FAIL'
export type ReviewGateStage = 'AI_SELF_VALIDATION' | 'PEER_REVIEW' | 'HUMAN_REVIEW' | 'GOVERNANCE_APPROVAL'
export type ReviewGateStatusEnum = 'PENDING' | 'PASSED' | 'REJECTED' | 'REVISION_REQUESTED'
export type RagStatus = 'GREEN' | 'AMBER' | 'RED'

export interface GovernanceEvent {
  id: string; organizationId: string; projectId: string
  aiGeneratedOutputId: string
  agentName?: string | null; skillName?: string | null
  eventType: GovernanceEventType; severity: Severity
  qualityScore?: number | null; confidenceScore?: number | null
  ragStatus: RagStatus; reviewerId?: string | null; notes?: string | null
  createdAt: string
  output?: { id: string; title: string; outputType: string }
}

export interface OutputValidation {
  id: string; organizationId: string; projectId: string
  aiGeneratedOutputId: string
  validationType: ValidationType; result: ValidationResult; notes?: string | null
  createdAt: string
  output?: { id: string; title: string }
}

export interface ReviewGateStatus {
  id: string; organizationId: string; projectId: string
  aiGeneratedOutputId: string; stage: ReviewGateStage
  status: ReviewGateStatusEnum; reviewerId?: string | null; notes?: string | null
  createdAt: string
  output?: { id: string; title: string; outputType: string; status: string }
  reviewer?: { id: string; name: string } | null
}

export interface RagStatusItem {
  outputId: string; outputTitle: string; outputType: string; outputStatus: string
  confidenceScore?: number | null; latestQualityScore?: number | null
  ragStatus: RagStatus
  validationSummary: { pass: number; warning: number; fail: number }
  reviewGateCount: number; hasHallucination: boolean
  latestEventType?: string | null
}

export interface RagStatusReport {
  summary: { total: number; green: number; amber: number; red: number }
  items: RagStatusItem[]
}

// ── Technical Delivery Intelligence Types ──

export type IntegrationMethod = 'REST' | 'SOAP' | 'FILE_BASED'
export type RestletMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type PayloadType = 'REQUEST' | 'RESPONSE'
export type TechnicalDeliverableType = 'INTEGRATION_MAPPING' | 'RESTLET_DESIGN' | 'API_CONTRACT' | 'PAYLOAD_VALIDATION' | 'DATA_MIGRATION_PLAN' | 'SECURITY_PLAN'
export type TechnicalStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'

export interface TechnicalWorkstream {
  id: string; organizationId: string; projectId: string
  name: string; description?: string | null; ownerId?: string | null
  status: WorkstreamStatus; progressPercentage: number
  createdAt: string; updatedAt: string
  owner?: { id: string; name: string } | null
  _count?: { technicalDeliverables: number }
}

export interface IntegrationMapping {
  id: string; organizationId: string; projectId: string
  name: string; description?: string | null
  sourceSystem: string; targetSystem: string
  integrationMethod: IntegrationMethod
  dataFlowNotes?: string | null; authMethod?: string | null
  frequencyNotes?: string | null; assumptions?: string | null; risks?: string | null
  status: TechnicalStatus; version: number
  createdAt: string; updatedAt: string
}

export interface RestletDesign {
  id: string; organizationId: string; projectId: string
  name: string; endpointUrl?: string | null
  method: RestletMethod
  requestSchema?: Record<string, unknown> | null
  responseSchema?: Record<string, unknown> | null
  authenticationType?: string | null; errorHandlingStrategy?: string | null; notes?: string | null
  status: TechnicalStatus; version: number
  createdAt: string; updatedAt: string
}

export interface ApiContract {
  id: string; organizationId: string; projectId: string
  endpoint: string; method: RestletMethod
  requestSchema?: Record<string, unknown> | null
  responseSchema?: Record<string, unknown> | null
  queryParams?: Record<string, unknown> | null
  headers?: Record<string, unknown> | null
  statusCodes?: Record<string, unknown> | null
  errorHandling?: string | null; authRequired: boolean; notes?: string | null
  status: TechnicalStatus; version: number
  createdAt: string; updatedAt: string
}

export interface PayloadValidation {
  id: string; organizationId: string; projectId: string
  name: string; payloadType: PayloadType
  schema?: Record<string, unknown> | null
  validationRules?: Record<string, unknown> | null
  samplePayload?: string | null; notes?: string | null
  status: TechnicalStatus; version: number
  createdAt: string; updatedAt: string
}

export interface TechnicalDeliverable {
  id: string; organizationId: string; projectId: string
  workstreamId?: string | null
  deliverableType: TechnicalDeliverableType
  title: string; description?: string | null
  status: TechnicalStatus; version: number; reviewStatus?: string | null
  createdAt: string; updatedAt: string
}

// ── Enterprise Dashboard & Reporting Types ──

export interface ProjectKpiCard {
  id: string; name: string; projectCode: string
  status: ProjectStatus; health: ProjectHealth; currentPhase: ProjectPhase
  progressPercentage: number; taskCount: number; milestoneCount: number; issueCount: number
}

export interface PortfolioSummary {
  totals: { totalProjects: number; activeProjects: number; completedProjects: number; atRiskProjects: number; onHoldProjects: number; draftProjects: number }
  projectSummaries: ProjectKpiCard[]
  ragDistribution: { green: number; amber: number; red: number }
  validationDistribution: { pass: number; warning: number; fail: number }
}

export interface ProjectDashboard {
  project: { id: string; name: string; projectCode: string; status: ProjectStatus; health: ProjectHealth; currentPhase: ProjectPhase; progressPercentage: number; customer: string }
  presales: { requirementsCount: number; painPointsCount: number; aiOutputsCount: number }
  functional: { processCount: number; fitGapCount: number; fitGapCoverage: number; uatCount: number; uatPassRate: number; sopCount: number }
  technical: { integrationCount: number; restletCount: number; apiContractCount: number; payloadCount: number }
  tasks: { total: number; done: number; completionRate: number }
  milestones: { total: number; completed: number; completionRate: number }
  hypercare: { taskTotal: number; taskCompletion: number; openIssues: number; criticalIssues: number; goLiveReadiness: number; pendingChangeRequests: number }
  governance: { totalAiOutputs: number; hallucinationCount: number; ragGreen: number; ragAmber: number; ragRed: number; validationPassRate: number }
}

export interface HypercareSummary {
  tasks: { total: number; done: number; escalated: number; critical: number; completionRate: number }
  issues: { total: number; open: number; critical: number }
  goLive: { total: number; completed: number; readiness: number }
  changeRequests: { pending: number; total: number }
  risks: { open: number; critical: number; total: number }
}

export interface RagOverview {
  totalOutputs: number
  ragCounts: { green: number; amber: number; red: number }
  hallucinationCount: number
  validationSummary: { pass: number; warning: number; fail: number }
  pendingGates: number
  recentOutputs: Array<{ id: string; title: string; outputType: string; status: string; confidenceScore?: number | null }>
}

export interface KpiTrendPoint {
  period: string
  metricValue: number
}

// ─── Continuous Improvement (Prompt 12) ─────────────────────────────────────

export type FeedbackType = 'HUMAN_REVIEW' | 'GOVERNANCE_FLAG' | 'HYPERCARE_OUTCOME' | 'TASK_OUTCOME' | 'RISK_OBSERVED' | 'AI_OUTPUT_PERFORMANCE'
export type FeedbackSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RecommendationType = 'PROCESS' | 'AI_MODEL' | 'WORKFLOW' | 'RISK_MITIGATION'
export type RecommendationStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED'
export type OptimizationMetricType = 'EFFICIENCY' | 'ACCURACY' | 'RISK_MITIGATION' | 'AI_OUTPUT_QUALITY'

export interface FeedbackEntry {
  id: string
  organizationId: string
  projectId: string
  workstreamId?: string | null
  aiGeneratedOutputId?: string | null
  feedbackType: FeedbackType
  description: string
  severity: FeedbackSeverity
  confidenceScore?: number | null
  createdBy: string
  createdAt: string
  createdByUser?: { id: string; name: string; email: string }
  aiGeneratedOutput?: { id: string; title: string; outputType: string } | null
}

export interface OptimizationRecommendation {
  id: string
  organizationId: string
  projectId: string
  workstreamId?: string | null
  recommendationType: RecommendationType
  description: string
  confidenceScore?: number | null
  impactScore?: number | null
  status: RecommendationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  createdByUser?: { id: string; name: string; email: string }
}

export interface OptimizationScore {
  metricType: OptimizationMetricType
  score: number
  ragStatus: 'GREEN' | 'AMBER' | 'RED'
  id?: string
  calculatedAt?: string
}

export interface ContinuousImprovementSummary {
  totalFeedback: number
  criticalFeedback: number
  pendingRecommendations: number
  latestScores: OptimizationScore[]
  recentFeedback: FeedbackEntry[]
  topRecommendations: OptimizationRecommendation[]
}

// ─── SaaS Multi-Tenant Management (Prompt 13) ───────────────────────────────

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'TRIAL'
export type UsageMetricType = 'AI_OUTPUT_COUNT' | 'API_USAGE' | 'STORAGE_USED' | 'ACTIVE_USERS'
export type InvoiceStatus = 'PENDING' | 'PAID' | 'FAILED' | 'VOID'

export interface SubscriptionPlan {
  id: string
  name: string
  features: string[]
  pricePerMonth: number
  pricePerYear: number
  maxUsers: number
  maxProjects: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { tenants: number }
}

export interface Tenant {
  id: string
  organizationId: string
  name: string
  domain?: string | null
  status: TenantStatus
  subscriptionPlanId?: string | null
  trialEndsAt?: string | null
  createdAt: string
  updatedAt: string
  organization?: { id: string; name: string; slug?: string; status?: string }
  subscriptionPlan?: Pick<SubscriptionPlan, 'id' | 'name' | 'pricePerMonth'> | null
  _count?: { usageRecords: number; invoices: number; userRoles: number }
}

export interface TenantUsage {
  id: string
  tenantId: string
  metricType: UsageMetricType
  value: number
  periodStart: string
  periodEnd: string
  createdAt: string
}

export interface TenantUsageReport {
  records: TenantUsage[]
  summary: Partial<Record<UsageMetricType, number>>
}

export interface BillingInvoice {
  id: string
  tenantId: string
  subscriptionPlanId?: string | null
  billingPeriodStart: string
  billingPeriodEnd: string
  amount: number
  status: InvoiceStatus
  paymentMethod?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  tenant?: { id: string; name: string }
  subscriptionPlan?: Pick<SubscriptionPlan, 'id' | 'name'> | null
}

export interface TenantRole {
  id: string
  tenantId: string
  name: string
  description?: string | null
  permissions: string[]
  createdAt: string
  _count?: { userRoles: number }
}

export interface TenantUserRole {
  id: string
  tenantId: string
  userId: string
  roleId: string
  createdAt: string
  user?: { id: string; name: string; email: string }
  role?: { id: string; name: string }
}

export interface AdminSummary {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  trialTenants: number
  totalPlans: number
  pendingInvoices: number
  recentTenants: Tenant[]
}

// ─── Deployment & DevOps Layer (Prompt 14) ─────────────────────────────────

export type DeploymentEnvironmentType = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION'
export type DeploymentEnvironmentStatus = 'ACTIVE' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE'
export type DeploymentServiceStatus = 'PENDING' | 'BUILDING' | 'DEPLOYING' | 'RUNNING' | 'DEGRADED' | 'FAILED' | 'ROLLING_BACK' | 'STOPPED'
export type DeploymentHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN'
export type DeploymentActionType = 'BUILD' | 'TEST' | 'DEPLOY' | 'ROLLBACK' | 'SCALE' | 'SELF_HEAL'
export type DeploymentRunStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ROLLED_BACK'
export type ServiceMetricType = 'CPU_USAGE' | 'MEMORY_USAGE' | 'LATENCY_MS' | 'ERROR_RATE' | 'UPTIME_SECONDS'
export type DeploymentAlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type DeploymentAlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'

export interface DeploymentEnvironment {
  id: string
  name: string
  slug: string
  type: DeploymentEnvironmentType
  status: DeploymentEnvironmentStatus
  region?: string | null
  baseUrl?: string | null
  registryUrl?: string | null
  secretsRef?: string | null
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
  services?: DeploymentService[]
  _count?: { alerts: number; runs: number }
}

export interface DeploymentService {
  id: string
  environmentId: string
  tenantId?: string | null
  name: string
  module: string
  image?: string | null
  imageTag?: string | null
  desiredReplicas: number
  currentReplicas: number
  status: DeploymentServiceStatus
  healthStatus: DeploymentHealthStatus
  lastDeployedAt?: string | null
  lastCheckedAt?: string | null
  config: Record<string, unknown>
  tenant?: { id: string; name: string; organizationId?: string }
}

export interface DeploymentRun {
  id: string
  organizationId: string
  tenantId?: string | null
  environmentId: string
  serviceId?: string | null
  actionType: DeploymentActionType
  status: DeploymentRunStatus
  version?: string | null
  imageTag?: string | null
  commitSha?: string | null
  rollbackTargetRunId?: string | null
  triggeredBy?: string | null
  startedAt: string
  finishedAt?: string | null
  logs: Array<{ timestamp: string; message: string; data?: Record<string, unknown> }>
  metadata: Record<string, unknown>
  environment?: Pick<DeploymentEnvironment, 'id' | 'name' | 'slug' | 'type'>
  service?: Pick<DeploymentService, 'id' | 'name' | 'module'> | null
  tenant?: { id: string; name: string } | null
  actor?: { id: string; name: string; email: string } | null
}

export interface ServiceMetric {
  id: string
  environmentId: string
  serviceId?: string | null
  tenantId?: string | null
  metricType: ServiceMetricType
  value: number
  unit?: string | null
  measuredAt: string
  environment?: { id: string; name: string; slug: string }
  service?: { id: string; name: string; module: string } | null
}

export interface DeploymentAlert {
  id: string
  environmentId: string
  serviceId?: string | null
  tenantId?: string | null
  severity: DeploymentAlertSeverity
  status: DeploymentAlertStatus
  message: string
  source?: string | null
  createdAt: string
  resolvedAt?: string | null
  environment?: { id: string; name: string; slug: string }
  service?: { id: string; name: string; module: string } | null
  tenant?: { id: string; name: string } | null
}

export interface DeploymentOverview {
  totals: {
    environments: number
    services: number
    healthyServices: number
    openAlerts: number
    failedRuns: number
  }
  environments: DeploymentEnvironment[]
  recentRuns: DeploymentRun[]
  openAlerts: DeploymentAlert[]
  metrics: ServiceMetric[]
}

// ─── Global Admin / Superuser Console (Prompt 17) ─────────────────────────

export type SuperuserActionType = 'TenantActivation' | 'SubscriptionOverride' | 'UserRoleChange' | 'DeploymentTrigger'
export type GlobalMetricType = 'CrossTenantKPI' | 'AIOutputQuality' | 'RAGDistribution' | 'UsageSummary'

export interface SuperuserActionLog {
  id: string
  superuserId: string
  actionType: SuperuserActionType
  targetTenantId?: string | null
  targetProjectId?: string | null
  description: string
  timestamp: string
  superuser?: { id: string; name: string; email: string }
  targetTenant?: { id: string; name: string; status: TenantStatus } | null
  targetProject?: { id: string; name: string; health: string } | null
}

export interface GlobalAnalyticsSnapshot {
  id: string
  metricType: GlobalMetricType
  value: Record<string, unknown>
  tenantId?: string | null
  projectId?: string | null
  snapshotDate: string
  tenant?: { id: string; name: string } | null
  project?: { id: string; name: string; health: string } | null
}

export interface GlobalUser {
  id: string
  organizationId: string
  name: string
  email: string
  status: string
  createdAt: string
  lastLoginAt?: string | null
  organization?: { id: string; name: string; slug: string; tenant?: { id: string; name: string; status: TenantStatus } | null }
  userRoles?: Array<{ id: string; role: { id: string; name: string; isSystem: boolean } }>
  tenantUserRoles?: Array<{ id: string; tenant: { id: string; name: string }; role: { id: string; name: string } }>
}

export interface GlobalDashboard {
  kpis: {
    totalTenants: number
    activeTenants: number
    suspendedTenants: number
    cancelledTenants: number
    trialTenants: number
    totalProjects: number
    redProjects: number
    amberProjects: number
    openCriticalAlerts: number
    failedDeployments: number
  }
  tenantStatus: Record<string, number>
  ragDistribution: Record<string, number>
  aiOutputQuality: Record<string, number>
  usageSummary: Record<string, number>
  openAlerts: DeploymentAlert[]
  recentActions: SuperuserActionLog[]
  recentSnapshots: GlobalAnalyticsSnapshot[]
  recentRuns: DeploymentRun[]
}

export interface GlobalAlerts {
  deploymentAlerts: DeploymentAlert[]
  suspendedTenants: Tenant[]
  redProjects: Array<ProjectSummary & { organization?: { id: string; name: string; tenant?: { id: string; name: string } | null } }>
}

// ─── Security, Compliance & Data Protection (Prompt 15) ────────────────────

export type EncryptionMethod = 'AES_256_GCM' | 'RSA' | 'HASHED'
export type SecretType = 'API_KEY' | 'DB_PASSWORD' | 'TOKEN' | 'WEBHOOK_SECRET' | 'OAUTH_CLIENT_SECRET'
export type RotationPolicy = 'MANUAL' | 'DAYS_30' | 'DAYS_60' | 'DAYS_90'
export type AccessActionType = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'ROTATE_SECRET' | 'REVOKE_SECRET' | 'LOGIN' | 'LOGOUT' | 'SECURITY_CHECK'
export type AccessResult = 'SUCCESS' | 'FAILURE'
export type SecretStatus = 'ACTIVE' | 'ROTATED' | 'REVOKED'

export interface EncryptedField {
  id: string
  tableName: string
  columnName: string
  encryptionMethod: EncryptionMethod
  createdAt: string
  updatedAt: string
}

export interface AccessLog {
  id: string
  organizationId?: string | null
  userId?: string | null
  tenantId?: string | null
  projectId?: string | null
  entityType: string
  entityId?: string | null
  actionType: AccessActionType
  result: AccessResult
  ipAddress?: string | null
  userAgent?: string | null
  metadata: Record<string, unknown>
  timestamp: string
  user?: { id: string; name: string; email: string } | null
  tenant?: { id: string; name: string } | null
}

export interface SecretStore {
  id: string
  organizationId: string
  tenantId?: string | null
  secretType: SecretType
  secretName: string
  secretValue: string
  encryptionMethod: EncryptionMethod
  status: SecretStatus
  rotationPolicy: RotationPolicy
  lastRotatedAt?: string | null
  createdAt: string
  updatedAt: string
  tenant?: { id: string; name: string } | null
}

export interface ComplianceReport {
  gdprReady: boolean
  pdpaReady: boolean
  encryptedFields: number
  activeSecrets: number
  staleSecrets: number
  failedAccess: number
  openCriticalAlerts: number
  retentionPolicyDays: number
  dataSubjectRights: string[]
}
