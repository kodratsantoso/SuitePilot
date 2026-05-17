import { z } from 'zod'

const OUTPUT_TYPES = [
  'DISCOVERY_SUMMARY',
  'REQUIREMENT_ANALYSIS',
  'PAIN_POINT_ANALYSIS',
  'MODULE_RECOMMENDATION',
  'SCOPE_DRAFT',
  'PROPOSAL_DRAFT',
  'BRD_DRAFT',
  'FIT_GAP_DRAFT',
  'RISK_SUMMARY',
  'MEETING_SUMMARY',
] as const

const DOCUMENT_STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] as const
const KNOWLEDGE_STATUSES = ['ACTIVE', 'DEPRECATED', 'ARCHIVED'] as const
const EVALUATION_STATUSES = ['QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'NEEDS_REVIEW'] as const
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(300),
  documentType: z.enum(OUTPUT_TYPES),
  templateId: z.string().uuid().optional(),
  aiGeneratedOutputId: z.string().uuid().optional(),
  sections: z
    .array(z.object({ title: z.string().min(1).max(200), content: z.string().min(1), sortOrder: z.number().int().min(0).optional() }))
    .optional(),
})

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  status: z.enum(DOCUMENT_STATUSES).optional(),
  sections: z
    .array(z.object({ id: z.string().uuid().optional(), title: z.string().min(1).max(200), content: z.string().min(1), sortOrder: z.number().int().min(0).optional() }))
    .optional(),
  versionNote: z.string().max(500).optional(),
})

export const createReviewCommentSchema = z.object({
  comment: z.string().min(1).max(5000),
})

export const createKnowledgeSourceSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  status: z.enum(KNOWLEDGE_STATUSES).optional(),
})

export const updateKnowledgeSourceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  status: z.enum(KNOWLEDGE_STATUSES).optional(),
})

export const createKnowledgeDocumentSchema = z.object({
  sourceId: z.string().uuid(),
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  tags: z.array(z.string().min(1).max(80)).optional(),
})

export const retrieveKnowledgeSchema = z.object({
  query: z.string().min(2).max(500),
  usedInOutputId: z.string().uuid().optional(),
})

export const createEvaluationCaseSchema = z.object({
  skillName: z.string().min(1).max(120),
  prompt: z.string().min(1),
  expectedAnswer: z.string().min(1),
  riskLevel: z.enum(SEVERITIES).optional(),
})

export const runEvaluationSchema = z.object({
  evaluationCaseId: z.string().uuid(),
  aiGeneratedOutputId: z.string().uuid().optional(),
  status: z.enum(EVALUATION_STATUSES).optional(),
  score: z.number().min(0).max(100).optional(),
  findings: z.array(z.record(z.unknown())).optional(),
})

export const createAgentSchema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  definitionPath: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
})

export const createSkillSchema = z.object({
  agentId: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  definitionPath: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type CreateReviewCommentInput = z.infer<typeof createReviewCommentSchema>
export type CreateKnowledgeSourceInput = z.infer<typeof createKnowledgeSourceSchema>
export type UpdateKnowledgeSourceInput = z.infer<typeof updateKnowledgeSourceSchema>
export type CreateKnowledgeDocumentInput = z.infer<typeof createKnowledgeDocumentSchema>
export type RetrieveKnowledgeInput = z.infer<typeof retrieveKnowledgeSchema>
export type CreateEvaluationCaseInput = z.infer<typeof createEvaluationCaseSchema>
export type RunEvaluationInput = z.infer<typeof runEvaluationSchema>
export type CreateAgentInput = z.infer<typeof createAgentSchema>
export type CreateSkillInput = z.infer<typeof createSkillSchema>
