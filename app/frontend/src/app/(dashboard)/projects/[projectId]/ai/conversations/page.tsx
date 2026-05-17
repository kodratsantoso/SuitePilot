'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAiConversations, useCreateAiConversation } from '@/hooks/useAiConversations'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  LOCKED: 'Locked',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  LOCKED: 'bg-yellow-100 text-yellow-700',
}

export default function AiConversationsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: conversations = [], isLoading, isError, refetch } = useAiConversations(projectId)
  const createConversation = useCreateAiConversation(projectId)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {
      title: fd.get('title') as string,
      agentName: (fd.get('agentName') as string) || undefined,
      skillName: (fd.get('skillName') as string) || undefined,
    }
    try {
      const res = await createConversation.mutateAsync(data)
      setSheetOpen(false)
      router.push(`/projects/${projectId}/ai/conversations/${res.data.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create conversation')
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Conversations"
        description={isLoading ? '' : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
        action={<Button onClick={() => setSheetOpen(true)} size="sm">+ New Conversation</Button>}
      />

      <div className="mt-6">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && conversations.length === 0 && (
          <EmptyState
            title="No conversations yet"
            description="Create a conversation to store AI agent interactions and generate outputs."
            action={<Button onClick={() => setSheetOpen(true)} size="sm">Create first conversation</Button>}
          />
        )}
        {!isLoading && !isError && conversations.length > 0 && (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => router.push(`/projects/${projectId}/ai/conversations/${conv.id}`)}
                className="w-full text-left rounded-lg border border-gray-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{conv.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {conv.agentName && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                          Agent: {conv.agentName}
                        </span>
                      )}
                      {conv.skillName && (
                        <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">
                          Skill: {conv.skillName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {conv._count?.messages ?? 0} messages
                      </span>
                      {conv._count?.generatedOutputs != null && conv._count.generatedOutputs > 0 && (
                        <span className="text-xs text-gray-400">
                          {conv._count.generatedOutputs} outputs
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        STATUS_COLORS[conv.status] ?? 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {STATUS_LABELS[conv.status] ?? conv.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(conv.updatedAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setFormError('') }}
        title="New AI Conversation"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Title" required>
            <Input name="title" placeholder="e.g. Discovery Q&A — Finance Module" required />
          </FormField>
          <FormField label="Agent Name" hint="The AI agent used in this conversation">
            <Input name="agentName" placeholder="e.g. discovery-agent" />
          </FormField>
          <FormField label="Skill Name" hint="The specific skill or workflow applied">
            <Input name="skillName" placeholder="e.g. fit-gap-analysis" />
          </FormField>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createConversation.isPending}>
              Create Conversation
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
