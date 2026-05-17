'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAiGeneratedOutput, useUpdateAiGeneratedOutput, useReviewAiGeneratedOutput } from '@/hooks/useAiGeneratedOutputs'
import type { AiReviewStatus } from '@/types'
import { AiOutputStatusBadge } from '@/components/ai/AiOutputStatusBadge'
import { AiOutputTypeBadge } from '@/components/ai/AiOutputTypeBadge'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Input'
import { formatDate, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const REVIEW_STATUS_LABELS: Record<AiReviewStatus, string> = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVISION_REQUESTED: 'Revision Requested',
}

const REVIEW_STATUS_COLORS: Record<AiReviewStatus, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION_REQUESTED: 'bg-yellow-100 text-yellow-700',
}

export default function GeneratedOutputDetailPage() {
  const { projectId, outputId } = useParams<{ projectId: string; outputId: string }>()
  const [reviewAction, setReviewAction] = useState<AiReviewStatus | null>(null)
  const [formError, setFormError] = useState('')

  const { data: output, isLoading, isError, refetch } = useAiGeneratedOutput(projectId, outputId)
  const updateOutput = useUpdateAiGeneratedOutput(projectId)
  const reviewOutput = useReviewAiGeneratedOutput(projectId)

  async function handleReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!reviewAction) return
    setFormError('')
    const fd = new FormData(e.currentTarget)
    try {
      await reviewOutput.mutateAsync({
        outputId,
        data: {
          status: reviewAction,
          comments: (fd.get('comments') as string) || undefined,
        },
      })
      setReviewAction(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit review')
    }
  }

  if (isLoading) return <LoadingState />
  if (isError || !output) return <ErrorState retry={refetch} />

  const canReview = output.status === 'IN_REVIEW' || output.status === 'DRAFT'
  const reviews = output.reviews ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/projects/${projectId}/ai/generated-outputs`}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Generated Outputs
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{output.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AiOutputTypeBadge outputType={output.outputType} />
            <AiOutputStatusBadge status={output.status} />
            <span className="text-xs text-gray-400">v{output.version}</span>
            {output.confidenceScore != null && (
              <span className="text-xs text-gray-500">
                {Math.round(output.confidenceScore * 100)}% confidence
              </span>
            )}
            {output.generatedByAgent && (
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                {output.generatedByAgent}
              </span>
            )}
            {output.generatedBySkill && (
              <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-600">
                {output.generatedBySkill}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(output.createdAt)}</span>
          </div>
        </div>
        {canReview && (
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setReviewAction('REVISION_REQUESTED')}
            >
              Request Revision
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setReviewAction('REJECTED')}
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => setReviewAction('APPROVED')}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Content */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-700">Content</h2>
            </div>
            <div className="p-5">
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800 leading-relaxed overflow-x-auto">
                {output.content}
              </pre>
            </div>
          </div>
        </div>

        {/* Reviews sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Reviews ({reviews.length})
              </h2>
            </div>
            {reviews.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-gray-400">No reviews yet</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {reviews.map((review) => (
                  <li key={review.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {review.reviewer?.name ?? 'Reviewer'}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          REVIEW_STATUS_COLORS[review.status]
                        )}
                      >
                        {REVIEW_STATUS_LABELS[review.status]}
                      </span>
                    </div>
                    {review.comments && (
                      <p className="text-xs text-gray-600 mt-1">{review.comments}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {review.reviewedAt ? formatDateTime(review.reviewedAt) : formatDateTime(review.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Details</h2>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-gray-400">Version</dt>
                <dd className="text-gray-700 font-medium">v{output.version}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Created</dt>
                <dd className="text-gray-700">{formatDate(output.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Updated</dt>
                <dd className="text-gray-700">{formatDate(output.updatedAt)}</dd>
              </div>
              {output.confidenceScore != null && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Confidence</dt>
                  <dd className="text-gray-700">{Math.round(output.confidenceScore * 100)}%</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Review Sheet */}
      <Sheet
        open={reviewAction !== null}
        onClose={() => { setReviewAction(null); setFormError('') }}
        title={
          reviewAction === 'APPROVED' ? 'Approve Output' :
          reviewAction === 'REJECTED' ? 'Reject Output' :
          'Request Revision'
        }
      >
        <form onSubmit={handleReview} className="space-y-4">
          <div
            className={cn(
              'rounded-md px-4 py-3 text-sm font-medium',
              reviewAction === 'APPROVED' ? 'bg-green-50 text-green-700' :
              reviewAction === 'REJECTED' ? 'bg-red-50 text-red-700' :
              'bg-yellow-50 text-yellow-700'
            )}
          >
            {reviewAction === 'APPROVED' && 'You are approving this output. It will be marked as approved.'}
            {reviewAction === 'REJECTED' && 'You are rejecting this output. Please provide a reason.'}
            {reviewAction === 'REVISION_REQUESTED' && 'You are requesting revisions. Describe what needs to change.'}
          </div>
          <FormField
            label="Comments"
            hint={reviewAction !== 'APPROVED' ? 'Required for rejection or revision requests' : 'Optional notes'}
          >
            <Textarea
              name="comments"
              placeholder="Your review comments..."
              rows={4}
              required={reviewAction !== 'APPROVED'}
            />
          </FormField>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => { setReviewAction(null); setFormError('') }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={reviewAction === 'REJECTED' ? 'danger' : 'primary'}
              loading={reviewOutput.isPending}
            >
              {reviewAction === 'APPROVED' ? 'Confirm Approval' :
               reviewAction === 'REJECTED' ? 'Confirm Rejection' :
               'Submit Request'}
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
