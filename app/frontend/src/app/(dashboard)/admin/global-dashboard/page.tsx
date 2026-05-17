'use client'

import Link from 'next/link'
import { AlertTriangle, BarChart3, ShieldCheck } from 'lucide-react'
import { useGlobalDashboard } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { SaasAdminNav, TenantStatusBadge } from '../_components/SaasAdminNav'
import { cn } from '@/lib/utils'

export default function GlobalDashboardPage() {
  const { data, isLoading, error } = useGlobalDashboard()

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? <LoadingState /> : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load global dashboard: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        ) : data ? (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Metric label="Tenants" value={data.kpis.totalTenants} />
              <Metric label="Active" value={data.kpis.activeTenants} tone="green" />
              <Metric label="Projects" value={data.kpis.totalProjects} />
              <Metric label="RAG Exceptions" value={data.kpis.redProjects + data.kpis.amberProjects} tone="yellow" />
              <Metric label="Critical Alerts" value={data.kpis.openCriticalAlerts} tone={data.kpis.openCriticalAlerts ? 'red' : 'green'} />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <Panel title="Tenant Status" icon={<ShieldCheck className="h-4 w-4" />}>
                {Object.entries(data.tenantStatus).map(([status, value]) => (
                  <div key={status} className="flex items-center justify-between py-2 text-sm">
                    <TenantStatusBadge status={status} />
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </Panel>
              <Panel title="Project RAG" icon={<BarChart3 className="h-4 w-4" />}>
                {['GREEN', 'AMBER', 'RED', 'UNKNOWN'].map((status) => (
                  <RagRow key={status} status={status} value={data.ragDistribution[status] ?? 0} total={data.kpis.totalProjects} />
                ))}
              </Panel>
              <Panel title="AI Output Quality" icon={<BarChart3 className="h-4 w-4" />}>
                {Object.entries(data.aiOutputQuality).map(([status, value]) => (
                  <div key={status} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-gray-600">{status.replaceAll('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
                {Object.keys(data.aiOutputQuality).length === 0 && <Empty text="No AI outputs yet" />}
              </Panel>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Global Alerts" icon={<AlertTriangle className="h-4 w-4" />}>
                <div className="divide-y divide-gray-100">
                  {data.openAlerts.length === 0 ? <Empty text="No active global alerts" /> : data.openAlerts.map((alert) => (
                    <div key={alert.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <span className={cn('rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20')}>{alert.severity}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{alert.tenant?.name ?? 'Platform'} · {alert.environment?.name}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Superuser Action Log" icon={<ShieldCheck className="h-4 w-4" />}>
                <div className="divide-y divide-gray-100">
                  {data.recentActions.length === 0 ? <Empty text="No superuser actions recorded" /> : data.recentActions.map((action) => (
                    <div key={action.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{action.actionType}</p>
                        <span className="text-xs text-gray-500">{new Date(action.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-gray-600">{action.description}</p>
                      <p className="mt-1 text-xs text-gray-500">{action.superuser?.email ?? action.superuserId}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Recent Global Deployment Runs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <tr><th className="px-5 py-3">Run</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentRuns.map((run) => (
                      <tr key={run.id}>
                        <td className="px-5 py-4"><Link className="font-medium text-brand-700" href="/admin/deployments">{run.environment?.name ?? run.environmentId}</Link></td>
                        <td className="px-4 py-4">{run.tenant?.name ?? 'Platform'}</td>
                        <td className="px-4 py-4">{run.actionType}</td>
                        <td className="px-4 py-4">{run.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </>
  )
}

function Metric({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'gray' | 'green' | 'yellow' | 'red' }) {
  const colors = { gray: 'text-gray-900', green: 'text-green-700', yellow: 'text-yellow-700', red: 'text-red-700' }
  return <div className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p><p className={cn('mt-2 text-2xl font-bold', colors[tone])}>{value}</p></div>
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-lg border border-gray-200 bg-white"><div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">{icon}<h2 className="text-base font-semibold text-gray-900">{title}</h2></div><div className="px-5 py-2">{children}</div></section>
}

function RagRow({ status, value, total }: { status: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  const tone = status === 'RED' ? 'bg-red-500' : status === 'AMBER' ? 'bg-yellow-500' : status === 'GREEN' ? 'bg-green-500' : 'bg-gray-400'
  return <div className="py-2 text-sm"><div className="mb-1 flex justify-between"><span>{status}</span><span>{value}</span></div><div className="h-2 rounded bg-gray-100"><div className={cn('h-2 rounded', tone)} style={{ width: `${pct}%` }} /></div></div>
}

function Empty({ text }: { text: string }) {
  return <p className="py-4 text-sm text-gray-500">{text}</p>
}
