'use client'

import { useState, type FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader'
import { useCreateProjectDocument, useProjectDocuments } from '@/hooks/useRoadmapFoundation'
import { formatDate } from '@/lib/utils'
import type { AiOutputType } from '@/types'

const DOCUMENT_TYPES: AiOutputType[] = ['DISCOVERY_SUMMARY', 'BRD_DRAFT', 'PROPOSAL_DRAFT', 'FIT_GAP_DRAFT', 'MEETING_SUMMARY']

export default function DocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState<AiOutputType>('BRD_DRAFT')
  const [sectionContent, setSectionContent] = useState('')
  const { data: documents = [], isLoading, isError, refetch } = useProjectDocuments(projectId)
  const createDocument = useCreateProjectDocument(projectId)

  async function submitDocument(event: FormEvent) {
    event.preventDefault()
    await createDocument.mutateAsync({
      title,
      documentType,
      sections: [{ title: 'Working Draft', content: sectionContent || 'Draft content pending human review.', sortOrder: 0 }],
    })
    setTitle('')
    setSectionContent('')
    setShowForm(false)
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Database-backed deliverables with versioning, review comments, and audit trail"
        action={<Button onClick={() => setShowForm((value) => !value)} variant={showForm ? 'secondary' : 'primary'}>{showForm ? 'Close' : 'New Document'}</Button>}
      />

      {showForm && (
        <form onSubmit={submitDocument} className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Document title" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value as AiOutputType)} className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
            </select>
          </div>
          <textarea value={sectionContent} onChange={(event) => setSectionContent(event.target.value)} rows={5} placeholder="Initial section content" className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={createDocument.isPending}>Create Draft</Button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {isLoading && <LoadingState />}
        {!isLoading && isError && <ErrorState retry={refetch} />}
        {!isLoading && !isError && documents.length === 0 && (
          <EmptyState title="No project documents yet" description="Create BRD, proposal, fit-gap, and implementation deliverables from reviewed project data." />
        )}
        {!isLoading && !isError && documents.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{document.title}</div>
                      <div className="text-xs text-gray-500">{document.documentType.replaceAll('_', ' ')} · {document._count?.sections ?? 0} sections</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{document.status.replaceAll('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{document._count?.reviewComments ?? 0} comments · v{document._count?.versions ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(document.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
