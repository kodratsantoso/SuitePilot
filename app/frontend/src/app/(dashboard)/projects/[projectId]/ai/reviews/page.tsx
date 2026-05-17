'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAiGeneratedOutputs, useReviewAiGeneratedOutput } from '@/hooks/useAiGeneratedOutputs'
import type { AiReviewStatus } from '@/types'
import { AiOutputStatusBadge } from '@/components/ai/AiOutputStatusBadge'
import { AiOutputTypeBadge } from '@/components/ai/AiOutputTypeBadge'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type ReviewModal = { outputId: string; title: string; action: AiReviewStatus }

export default function ReviewQueuePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [modal, setModal] = useState<ReviewModal | null>(null)
  const [formError, setFormError] = useState('')

  const { data: allOutputs = [], isLoading, isError, refetch } = useAiGeneratedOutputs(projectId)
  const reviewOutput = useReviewAiGeneratedOutput(projectId)

  const reviewQueue = allOutputs.filter(
    (o) => o.status === 'IN_REVIEW' || o.status === 'DRAFT'
  )

  async function handleReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!modal) return
    setFormError('')
    const fd = new FormData(e.currentTarget)
    try {
      await reviewOutput.mutateAsync({
        outputId: modal.outputId,
        data: {
          status: modal.action,
          comments: (fd.get('comments') as string) || undefined,
        },
      })
      setModal(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit review')
    }
  }

  return (
    <div>
      <PageHeader
        title="Review Queue"
        description={
          isLoading
            ? ''
            : `${reviewQueue.length} output${reviewQueue.length !== 1 ? 's' : ''} pending review`
        }
      />

      <div className="mt-6">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && reviewQueue.length === 0 && (
          <EmptyState
            title="No outputs pending review"
            description="All generated outputs have been reviewed, or there are no outputs yet."
            action={
              <Link href={`/projects/${projectId}/ai/generated-outputs`}>
                <Button size="sm" variant="secondary">View All Outputs</Button>
              </Link>
            }
          />
        )}
        {!isLoading && !isError && reviewQueue.length > 0 && (
          <div className="space-y-2">
            {reviewQueue.map((output) => (
              <div
                key={output.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/projects/${projectId}/ai/generated-outputs/${output.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-brand-600"
                    >
                      {output.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <AiOutputTypeBadge outputType={output.outputType} />
                      <AiOutputStatusBadge status={output.status} />
                      <span className="text-xs text-gray-400">v{output.version}</span>
                      {output.confidenceScore != null && (
                        <span className="text-xs text-gray-400">
                          {Math.round(output.confidenceScore * 100)}% confidence
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(output.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setModal({ outputId: output.id, title: output.title, action: 'REVISION_REQUESTED' })}
                    >
                      Request Revision
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setModal({ outputId: output.id, title: output.title, action: 'REJECTED' })}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setModal({ outputId: output.id, title: output.title, action: 'APPROVED' })}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Sheet */}
      <Sheet
        open={modal !== null}
        onClose={() => { setModal(null); setFormError('') }}
        title={
          modal?.action === 'APPROVED' ? 'Approve Output' :
          modal?.action === 'REJECTED' ? 'Reject Output' :
          'Request Revision'
        }
      >
        {modal && (
          <form onSubmit={handleReview} className="space-y-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{modal.title}</span>
            </p>
            <div
              className={cn(
                'rounded-md px-4 py-3 text-sm font-medium',
                modal.action === 'APPROVED' ? 'bg-green-50 text-green-700' :
                modal.action === 'REJECTED' ? 'bg-red-50 text-red-700' :
                'bg-yellow-50 text-yellow-700'
              )}
            >
              {modal.action === 'APPROVED' && 'Confirm approval of this output.'}
              {modal.action === 'REJECTED' && 'This output will be rejected. Please provide a reason.'}
              {modal.action === 'REVISION_REQUESTED' && 'Describe what changes are needed.'}
            </div>
            <FormField
              label="Comments"
              hint={modal.action !== 'APPROVED' ? 'Required' : 'Optional'}
            >
              <Textarea
                name="comments"
                placeholder="Your review comments..."
                rows={4}
                required={modal.action !== 'APPROVED'}
              />
            </FormField>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => { setModal(null); setFormError('') }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={modal.action === 'REJECTED' ? 'danger' : 'primary'}
                loading={reviewOutput.isPending}
              >
                {modal.action === 'APPROVED' ? 'Confirm Approval' :
                 modal.action === 'REJECTED' ? 'Confirm Rejection' :
                 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </Sheet>
    </div>
  )
}
