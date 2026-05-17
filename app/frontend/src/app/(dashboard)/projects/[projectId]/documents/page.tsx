import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader title="Documents" description="Project documents and AI-generated deliverables" />
      <div className="mt-6">
        <EmptyState
          title="Documents coming in Phase 4"
          description="AI-assisted document generation, review workflow, and document storage will be available in Phase 4."
        />
      </div>
    </div>
  )
}
