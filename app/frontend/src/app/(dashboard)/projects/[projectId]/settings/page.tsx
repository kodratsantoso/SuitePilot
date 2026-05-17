import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export default function ProjectSettingsPage() {
  return (
    <div>
      <PageHeader title="Project Settings" description="Manage project configuration, members, and access" />
      <div className="mt-6">
        <EmptyState
          title="Settings coming in Phase 1 (next iteration)"
          description="Project settings including member management, status updates, and project configuration will be fully implemented in the next phase."
        />
      </div>
    </div>
  )
}
