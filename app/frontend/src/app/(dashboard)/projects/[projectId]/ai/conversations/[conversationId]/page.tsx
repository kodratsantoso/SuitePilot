'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAiConversation, useAiMessages, useCreateAiMessage } from '@/hooks/useAiConversations'
import type { AiMessageRole } from '@/types'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/ui/FormField'
import { Textarea, Select } from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ROLE_STYLES: Record<AiMessageRole, { label: string; bg: string; textColor: string; iconBg: string }> = {
  USER: { label: 'User', bg: 'bg-blue-50 border-blue-100', textColor: 'text-blue-900', iconBg: 'bg-blue-600' },
  ASSISTANT: { label: 'Assistant', bg: 'bg-gray-50 border-gray-100', textColor: 'text-gray-900', iconBg: 'bg-gray-600' },
  SYSTEM: { label: 'System', bg: 'bg-yellow-50 border-yellow-100', textColor: 'text-yellow-900', iconBg: 'bg-yellow-500' },
}

const ROLE_INITIALS: Record<AiMessageRole, string> = {
  USER: 'U',
  ASSISTANT: 'AI',
  SYSTEM: 'SYS',
}

export default function ConversationDetailPage() {
  const { projectId, conversationId } = useParams<{ projectId: string; conversationId: string }>()
  const [showAddMessage, setShowAddMessage] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: conversation, isLoading: loadingConv, isError: errorConv, refetch } = useAiConversation(projectId, conversationId)
  const { data: messages = [], isLoading: loadingMessages } = useAiMessages(conversationId)
  const createMessage = useCreateAiMessage(conversationId, projectId)

  async function handleAddMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.currentTarget)
    try {
      await createMessage.mutateAsync({
        role: fd.get('role') as AiMessageRole,
        content: fd.get('content') as string,
        model: (fd.get('model') as string) || undefined,
      })
      ;(e.target as HTMLFormElement).reset()
      setShowAddMessage(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add message')
    }
  }

  if (loadingConv) return <LoadingState />
  if (errorConv || !conversation) return <ErrorState retry={refetch} />

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/projects/${projectId}/ai/conversations`}
            className="text-sm text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            ← Conversations
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="truncate text-xl font-semibold text-gray-900">{conversation.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {conversation.agentName && (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {conversation.agentName}
            </span>
          )}
          {conversation.skillName && (
            <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
              {conversation.skillName}
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              conversation.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              conversation.status === 'LOCKED' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            )}
          >
            {conversation.status}
          </span>
        </div>
      </div>

      {/* Notice */}
      <div className="mb-4 rounded-md bg-blue-50 border border-blue-100 px-4 py-2.5 text-xs text-blue-700">
        This is a stored conversation record. Messages are added manually to document AI interactions.
      </div>

      {/* Message thread */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {loadingMessages && <LoadingState />}
        {!loadingMessages && messages.length === 0 && (
          <EmptyState
            title="No messages yet"
            description="Add messages below to record AI interactions in this conversation."
          />
        )}
        {messages.map((msg) => {
          const style = ROLE_STYLES[msg.role] ?? ROLE_STYLES.USER
          return (
            <div
              key={msg.id}
              className={cn('rounded-lg border p-4', style.bg)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white text-xs font-bold',
                    style.iconBg
                  )}
                >
                  {ROLE_INITIALS[msg.role]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={cn('text-xs font-semibold', style.textColor)}>{style.label}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {msg.model && <span className="rounded bg-white/60 px-1.5 py-0.5">{msg.model}</span>}
                      {msg.tokenUsage != null && <span>{msg.tokenUsage} tokens</span>}
                      <span>{formatDateTime(msg.createdAt)}</span>
                    </div>
                  </div>
                  <p className={cn('text-sm whitespace-pre-wrap', style.textColor)}>{msg.content}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add message form */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        {!showAddMessage ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddMessage(true)}
            disabled={conversation.status === 'LOCKED'}
          >
            + Add Message
          </Button>
        ) : (
          <form onSubmit={handleAddMessage} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Role" required>
                <Select name="role" defaultValue="USER">
                  <option value="USER">User</option>
                  <option value="ASSISTANT">Assistant</option>
                  <option value="SYSTEM">System</option>
                </Select>
              </FormField>
              <FormField label="Model" hint="Optional model identifier">
                <input
                  name="model"
                  placeholder="e.g. claude-3-5-sonnet"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </FormField>
            </div>
            <FormField label="Content" required>
              <Textarea name="content" placeholder="Message content..." rows={4} required />
            </FormField>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => { setShowAddMessage(false); setFormError('') }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={createMessage.isPending}>
                Add Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
