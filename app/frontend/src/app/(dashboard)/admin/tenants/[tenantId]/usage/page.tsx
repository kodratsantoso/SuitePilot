'use client'

import { useParams } from 'next/navigation'
import { Download, Plus } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useAdminMutation, useTenant, useTenantUsage } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { SaasAdminNav, TenantStatusBadge } from '../../../_components/SaasAdminNav'
import type { UsageMetricType } from '@/types'

const metrics: UsageMetricType[] = ['API_USAGE', 'AI_OUTPUT_COUNT', 'STORAGE_USED', 'ACTIVE_USERS']

export default function TenantUsagePage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params.tenantId
  const { data: tenant } = useTenant(tenantId)
  const { data, isLoading, error } = useTenantUsage(tenantId)
  const mutation = useAdminMutation()

  const recordSample = (metricType: UsageMetricType) => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - 1)
    mutation.mutate(() => adminApi.recordUsage(tenantId, {
      metricType,
      value: metricType === 'ACTIVE_USERS' ? 1 : 25,
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
    }))
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{tenant?.name ?? 'Tenant'} Usage</h2>
              {tenant && <TenantStatusBadge status={tenant.status} />}
            </div>
            <p className="text-sm text-gray-500">Usage is scoped to tenant ID {tenantId.slice(0, 8)} for billing and analytics.</p>
          </div>
          <Button variant="secondary" onClick={() => exportCsv(data?.records ?? [])}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric} className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{metric.replaceAll('_', ' ')}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{Math.round(data?.summary?.[metric] ?? 0).toLocaleString()}</p>
              <button className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={() => recordSample(metric)}>
                <Plus className="h-3 w-3" />
                Record sample
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Historical Usage</h2>
          </div>
          {isLoading ? <LoadingState /> : error ? (
            <div className="p-5 text-sm text-red-700">Failed to load usage: {error instanceof Error ? error.message : 'Unknown error'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Metric</th>
                    <th className="px-4 py-3 text-right">Value</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.records ?? []).map((record) => (
                    <tr key={record.id}>
                      <td className="px-5 py-4 font-medium text-gray-900">{record.metricType.replaceAll('_', ' ')}</td>
                      <td className="px-4 py-4 text-right text-gray-900">{record.value.toLocaleString()}</td>
                      <td className="px-4 py-4 text-gray-600">{formatDate(record.periodStart)} - {formatDate(record.periodEnd)}</td>
                      <td className="px-4 py-4 text-gray-600">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function exportCsv(records: Array<{ metricType: string; value: number; periodStart: string; periodEnd: string }>) {
  const rows = ['metricType,value,periodStart,periodEnd', ...records.map((r) => `${r.metricType},${r.value},${r.periodStart},${r.periodEnd}`)]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'tenant-usage.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
