'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useHypercareTasks } from '@/hooks/useHypercareTasks'
import { useIssues } from '@/hooks/useIssues'
import { useGoLiveItems } from '@/hooks/useGoLive'
import { useChangeRequests } from '@/hooks/useChangeRequests'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingState } from '@/components/shared/LoadingState'
import { SeverityBadge } from '@/components/ai/SeverityBadge'
import { IssueStatusBadge } from '@/components/ai/IssueStatusBadge'
import type { Issue } from '@/types'

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className={`text-3xl font-bold ${color ?? 'text-gray-900'}`}>{value}</div>
      <div className="mt-1 text-sm font-medium text-gray-700">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

function NavCard({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">{title}</div>
        <div className="mt-0.5 text-xs text-gray-500">{description}</div>
      </div>
    </Link>
  )
}

export default function HypercareDashboardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const base = `/projects/${projectId}/hypercare`

  const { data: tasks = [], isLoading: tasksLoading } = useHypercareTasks(projectId)
  const { data: issues = [], isLoading: issuesLoading } = useIssues(projectId)
  const { data: goLiveItems = [], isLoading: goLiveLoading } = useGoLiveItems(projectId)
  const { data: changeRequests = [], isLoading: crLoading } = useChangeRequests(projectId)

  const isLoading = tasksLoading || issuesLoading || goLiveLoading || crLoading

  if (isLoading) return <LoadingState message="Loading hypercare dashboard..." />

  // Task stats
  const taskDone = tasks.filter((t) => t.status === 'DONE').length
  const taskInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const taskBlocked = tasks.filter((t) => t.status === 'BLOCKED').length

  // Issue stats
  const openIssues = issues.filter((i) => i.status === 'OPEN').length
  const escalatedIssues = issues.filter((i) => i.status === 'ESCALATED').length
  const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL').length

  // Go-live stats
  const completed = goLiveItems.filter((g) => g.status === 'COMPLETED').length
  const notApplicable = goLiveItems.filter((g) => g.status === 'NOT_APPLICABLE').length
  const goLivePct = Math.round((completed / Math.max(goLiveItems.length - notApplicable, 1)) * 100)

  // Change request stats
  const pendingCRs = changeRequests.filter((c) => c.status === 'PROPOSED' || c.status === 'IN_REVIEW').length

  // Critical alert: escalated issues or critical severity
  const alertIssues = issues.filter((i) => i.status === 'ESCALATED' || i.severity === 'CRITICAL')
  const hasAlert = alertIssues.length > 0

  // Top 5 most severe open issues
  const topIssues: Issue[] = [...issues]
    .filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED')
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hypercare"
        description="Post-go-live monitoring, issue tracking, and change management"
      />

      {hasAlert && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M8 2L2 13h12L8 2z" />
              <path strokeLinecap="round" d="M8 7v3M8 11.5v.5" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-red-700">
                {alertIssues.length} critical / escalated issue{alertIssues.length !== 1 ? 's' : ''} require attention
              </div>
              <div className="mt-1 text-xs text-red-600">
                {alertIssues.slice(0, 3).map((i) => i.title).join(', ')}
                {alertIssues.length > 3 ? ` and ${alertIssues.length - 3} more...` : ''}
              </div>
            </div>
            <Link href={`${base}/issues`} className="ml-auto flex-shrink-0 text-xs font-medium text-red-700 underline">
              View Issues
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tasks Done" value={`${taskDone}/${tasks.length}`} sub={`${taskInProgress} in progress, ${taskBlocked} blocked`} />
        <StatCard label="Open Issues" value={openIssues} sub={`${escalatedIssues} escalated, ${criticalIssues} critical`} color={openIssues > 0 ? 'text-red-600' : undefined} />
        <StatCard label="Go-Live Readiness" value={`${goLivePct}%`} sub={`${completed} of ${goLiveItems.length - notApplicable} items complete`} color={goLivePct === 100 ? 'text-green-600' : goLivePct >= 75 ? 'text-yellow-600' : 'text-red-600'} />
        <StatCard label="Pending CRs" value={pendingCRs} sub={`${changeRequests.length} total change requests`} color={pendingCRs > 0 ? 'text-orange-600' : undefined} />
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NavCard
          href={`${base}/tasks`}
          title="Hypercare Tasks"
          description="Track post-go-live support tasks and follow-ups"
          icon={
            <svg fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" d="M4 6h12M4 10h8M4 14h6" />
            </svg>
          }
        />
        <NavCard
          href={`${base}/issues`}
          title="Issue Tracker"
          description="Log, track, and resolve production issues"
          icon={
            <svg fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <circle cx="10" cy="10" r="8" />
              <path strokeLinecap="round" d="M10 6v4M10 13v.5" />
            </svg>
          }
        />
        <NavCard
          href={`${base}/go-live`}
          title="Go-Live Readiness"
          description="Checklist tracking for go-live criteria"
          icon={
            <svg fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" d="M5 10l4 4 6-6" />
              <circle cx="10" cy="10" r="8" />
            </svg>
          }
        />
        <NavCard
          href={`${base}/change-requests`}
          title="Change Requests"
          description="Manage and review post-go-live change requests"
          icon={
            <svg fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" d="M4 4h12M4 8h8M4 12h10" />
              <path strokeLinecap="round" d="M14 14l2 2-2 2" />
            </svg>
          }
        />
        <NavCard
          href={`${base}/reports`}
          title="Reports & Risks"
          description="Post-implementation risks and AI-generated reports"
          icon={
            <svg fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" d="M4 16V8l6-5 6 5v8H4z" />
              <path strokeLinecap="round" d="M8 16v-5h4v5" />
            </svg>
          }
        />
      </div>

      {/* Open issues summary */}
      {topIssues.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Top Open Issues</h2>
            <Link href={`${base}/issues`} className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {topIssues.map((issue) => (
              <div
                key={issue.id}
                className={`flex items-center justify-between rounded-lg border bg-white px-4 py-3 ${
                  issue.severity === 'CRITICAL' || issue.status === 'ESCALATED'
                    ? 'border-l-4 border-red-400 border-l-red-500'
                    : 'border-gray-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">{issue.title}</div>
                  {issue.assignee && (
                    <div className="mt-0.5 text-xs text-gray-400">Assigned to {issue.assignee.name}</div>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                  <SeverityBadge severity={issue.severity} />
                  <IssueStatusBadge status={issue.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
