'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  useDiscoverySession,
  useUpdateDiscoverySession,
  useDiscoveryQuestions,
  useCreateDiscoveryQuestion,
} from '@/hooks/useDiscoverySessions'
import { useRequirements, useCreateRequirement } from '@/hooks/useRequirements'
import { usePainPoints, useCreatePainPoint } from '@/hooks/usePainPoints'
import { useAiConversations } from '@/hooks/useAiConversations'
import { useAiGeneratedOutputs } from '@/hooks/useAiGeneratedOutputs'
import type { QuestionCategory, DiscoverySessionStatus, RequirementPriority, Severity } from '@/types'
import { DiscoverySessionStatusBadge } from '@/components/ai/DiscoverySessionStatusBadge'
import { AiOutputStatusBadge } from '@/components/ai/AiOutputStatusBadge'
import { AiOutputTypeBadge } from '@/components/ai/AiOutputTypeBadge'
import { SeverityBadge } from '@/components/ai/SeverityBadge'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TABS = ['Overview', 'Questions', 'Requirements', 'Pain Points', 'Conversations', 'Generated Outputs'] as const
type Tab = (typeof TABS)[number]

const QUESTION_CATEGORIES: QuestionCategory[] = [
  'COMPANY_PROFILE', 'FINANCE', 'PROCUREMENT', 'INVENTORY', 'SALES',
  'CRM', 'MANUFACTURING', 'REPORTING', 'INTEGRATION', 'COMPLIANCE',
  'PAIN_POINT', 'GOVERNANCE', 'TECHNICAL', 'OTHER',
]

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  COMPANY_PROFILE: 'Company Profile', FINANCE: 'Finance', PROCUREMENT: 'Procurement',
  INVENTORY: 'Inventory', SALES: 'Sales', CRM: 'CRM', MANUFACTURING: 'Manufacturing',
  REPORTING: 'Reporting', INTEGRATION: 'Integration', COMPLIANCE: 'Compliance',
  PAIN_POINT: 'Pain Points', GOVERNANCE: 'Governance', TECHNICAL: 'Technical', OTHER: 'Other',
}

const STATUS_TRANSITIONS: Record<DiscoverySessionStatus, DiscoverySessionStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['IN_REVIEW', 'COMPLETED'],
  IN_REVIEW: ['ACTIVE', 'COMPLETED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
}

export default function DiscoverySessionDetailPage() {
  const { projectId, sessionId } = useParams<{ projectId: string; sessionId: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [showAddRequirement, setShowAddRequirement] = useState(false)
  const [showAddPainPoint, setShowAddPainPoint] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: session, isLoading, isError, refetch } = useDiscoverySession(projectId, sessionId)
  const updateSession = useUpdateDiscoverySession(projectId)
  const { data: questions = [] } = useDiscoveryQuestions(sessionId)
  const createQuestion = useCreateDiscoveryQuestion(sessionId)
  const { data: requirements = [] } = useRequirements(projectId, { discoverySessionId: sessionId })
  const createRequirement = useCreateRequirement(projectId)
  const { data: painPoints = [] } = usePainPoints(projectId, { discoverySessionId: sessionId })
  const createPainPoint = useCreatePainPoint(projectId)
  const { data: conversations = [] } = useAiConversations(projectId, { discoverySessionId: sessionId })
  const { data: outputs = [] } = useAiGeneratedOutputs(projectId, { discoverySessionId: sessionId })

  if (isLoading) return <LoadingState />
  if (isError || !session) return <ErrorState retry={refetch} />

  async function handleStatusChange(newStatus: DiscoverySessionStatus) {
    await updateSession.mutateAsync({ sessionId, data: { status: newStatus } })
  }

  async function handleAddQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    try {
      await createQuestion.mutateAsync({
        category: fd.get('category') as QuestionCategory,
        question: fd.get('question') as string,
        order: questions.length + 1,
      })
      ;(e.target as HTMLFormElement).reset()
      setShowAddQuestion(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add question')
    }
  }

  async function handleAddRequirement(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    try {
      await createRequirement.mutateAsync({
        title: fd.get('title') as string,
        description: fd.get('description') as string || undefined,
        priority: fd.get('priority') as RequirementPriority,
        source: 'MEETING',
        discoverySessionId: sessionId,
      })
      ;(e.target as HTMLFormElement).reset()
      setShowAddRequirement(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add requirement')
    }
  }

  async function handleAddPainPoint(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    try {
      await createPainPoint.mutateAsync({
        title: fd.get('title') as string,
        description: fd.get('description') as string || undefined,
        severity: fd.get('severity') as Severity,
        impactedArea: fd.get('impactedArea') as string || undefined,
        discoverySessionId: sessionId,
      })
      ;(e.target as HTMLFormElement).reset()
      setShowAddPainPoint(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add pain point')
    }
  }

  const nextStatuses = STATUS_TRANSITIONS[session.status] ?? []
  const questionsByCategory = QUESTION_CATEGORIES.map((cat) => ({
    category: cat,
    questions: questions.filter((q) => q.category === cat),
  })).filter((g) => g.questions.length > 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/projects/${projectId}/ai/discovery`}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Discovery
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="truncate text-xl font-semibold text-gray-900">{session.title}</h1>
          <DiscoverySessionStatusBadge status={session.status} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant="secondary"
              loading={updateSession.isPending}
              onClick={() => handleStatusChange(s)}
            >
              Mark as {s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 border-b border-gray-200">
        <nav className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition',
                activeTab === tab
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-5">
        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Session Details</h2>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-gray-400">Status</dt>
                  <dd className="mt-1"><DiscoverySessionStatusBadge status={session.status} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(session.createdAt)}</dd>
                </div>
                {session.startedAt && (
                  <div>
                    <dt className="text-xs text-gray-400">Started</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(session.startedAt)}</dd>
                  </div>
                )}
                {session.completedAt && (
                  <div>
                    <dt className="text-xs text-gray-400">Completed</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(session.completedAt)}</dd>
                  </div>
                )}
              </dl>
              {session.description && (
                <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">{session.description}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Questions', value: questions.length },
                { label: 'Requirements', value: requirements.length },
                { label: 'Pain Points', value: painPoints.length },
                { label: 'Conversations', value: conversations.length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <p className="text-2xl font-semibold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'Questions' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={() => setShowAddQuestion(!showAddQuestion)}>
                {showAddQuestion ? 'Cancel' : '+ Add Question'}
              </Button>
            </div>
            {showAddQuestion && (
              <form onSubmit={handleAddQuestion} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Category" required>
                    <Select name="category" defaultValue="OTHER">
                      {QUESTION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <FormField label="Question" required>
                  <Textarea name="question" placeholder="Enter the discovery question..." rows={2} required />
                </FormField>
                {formError && <p className="text-xs text-red-600">{formError}</p>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddQuestion(false)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={createQuestion.isPending}>Add Question</Button>
                </div>
              </form>
            )}
            {questions.length === 0 ? (
              <EmptyState title="No questions yet" description="Add questions to guide the discovery session." />
            ) : (
              <div className="space-y-4">
                {questionsByCategory.map(({ category, questions: qs }) => (
                  <div key={category} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {CATEGORY_LABELS[category]} ({qs.length})
                      </h3>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {qs.map((q) => (
                        <li key={q.id} className="px-4 py-3 flex items-start gap-3">
                          <span className="text-xs text-gray-400 mt-0.5 w-5 flex-shrink-0">{q.order}.</span>
                          <p className="text-sm text-gray-800">{q.question}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'Requirements' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={() => setShowAddRequirement(!showAddRequirement)}>
                {showAddRequirement ? 'Cancel' : '+ Add Requirement'}
              </Button>
            </div>
            {showAddRequirement && (
              <form onSubmit={handleAddRequirement} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <FormField label="Title" required>
                  <Input name="title" placeholder="Requirement title..." required />
                </FormField>
                <FormField label="Description">
                  <Textarea name="description" placeholder="Details..." rows={2} />
                </FormField>
                <FormField label="Priority" required>
                  <Select name="priority" defaultValue="MEDIUM">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </Select>
                </FormField>
                {formError && <p className="text-xs text-red-600">{formError}</p>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddRequirement(false)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={createRequirement.isPending}>Add Requirement</Button>
                </div>
              </form>
            )}
            {requirements.length === 0 ? (
              <EmptyState title="No requirements yet" description="Requirements extracted from this session will appear here." />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Title', 'Priority', 'Source', 'Date'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requirements.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{r.title}</p>
                          {r.description && <p className="text-xs text-gray-400 mt-0.5 max-w-sm truncate">{r.description}</p>}
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{r.source}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pain Points Tab */}
        {activeTab === 'Pain Points' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={() => setShowAddPainPoint(!showAddPainPoint)}>
                {showAddPainPoint ? 'Cancel' : '+ Add Pain Point'}
              </Button>
            </div>
            {showAddPainPoint && (
              <form onSubmit={handleAddPainPoint} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <FormField label="Title" required>
                  <Input name="title" placeholder="Pain point title..." required />
                </FormField>
                <FormField label="Description">
                  <Textarea name="description" placeholder="Details..." rows={2} />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Severity" required>
                    <Select name="severity" defaultValue="MEDIUM">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </Select>
                  </FormField>
                  <FormField label="Impacted Area">
                    <Input name="impactedArea" placeholder="e.g. Finance, Operations..." />
                  </FormField>
                </div>
                {formError && <p className="text-xs text-red-600">{formError}</p>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddPainPoint(false)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={createPainPoint.isPending}>Add Pain Point</Button>
                </div>
              </form>
            )}
            {painPoints.length === 0 ? (
              <EmptyState title="No pain points yet" description="Pain points identified during discovery will appear here." />
            ) : (
              <div className="space-y-2">
                {painPoints.map((pp) => (
                  <div key={pp.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">{pp.title}</p>
                        {pp.description && <p className="mt-1 text-xs text-gray-500">{pp.description}</p>}
                        {pp.impactedArea && (
                          <p className="mt-1 text-xs text-gray-400">
                            Area: <span className="text-gray-600">{pp.impactedArea}</span>
                          </p>
                        )}
                      </div>
                      <SeverityBadge severity={pp.severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'Conversations' && (
          <div>
            {conversations.length === 0 ? (
              <EmptyState
                title="No conversations linked"
                description="Link AI conversations to this session or create a new one."
                action={
                  <Link href={`/projects/${projectId}/ai/conversations`}>
                    <Button size="sm" variant="secondary">Go to Conversations</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/projects/${projectId}/ai/conversations/${conv.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{conv.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        {conv.agentName && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">{conv.agentName}</span>}
                        {conv.skillName && <span className="rounded bg-purple-50 px-1.5 py-0.5 text-purple-600">{conv.skillName}</span>}
                        <span>{conv._count?.messages ?? 0} messages</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(conv.updatedAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated Outputs Tab */}
        {activeTab === 'Generated Outputs' && (
          <div>
            {outputs.length === 0 ? (
              <EmptyState
                title="No generated outputs"
                description="AI-generated documents linked to this session will appear here."
                action={
                  <Link href={`/projects/${projectId}/ai/generated-outputs`}>
                    <Button size="sm" variant="secondary">View All Outputs</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {outputs.map((output) => (
                  <Link
                    key={output.id}
                    href={`/projects/${projectId}/ai/generated-outputs/${output.id}`}
                    className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{output.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <AiOutputTypeBadge outputType={output.outputType} />
                        <span className="text-xs text-gray-400">v{output.version}</span>
                        {output.confidenceScore != null && (
                          <span className="text-xs text-gray-400">
                            {Math.round(output.confidenceScore * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <AiOutputStatusBadge status={output.status} className="flex-shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
