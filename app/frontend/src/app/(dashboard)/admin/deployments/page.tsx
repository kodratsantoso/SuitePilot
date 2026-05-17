'use client'

import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { globalAdminApi } from '@/lib/api'
import { useAdminMutation, useGlobalAlerts, useGlobalDashboard } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { SaasAdminNav } from '../_components/SaasAdminNav'

export default function GlobalDeploymentsPage() {
  const { data, isLoading, error } = useGlobalDashboard()
  const { data: alerts } = useGlobalAlerts()
  const mutation = useAdminMutation()
  const [form, setForm] = useState({ environmentId: '', serviceId: '', tenantId: '', actionType: 'DEPLOY', imageTag: '' })

  const environments = data?.recentRuns.map((run) => run.environment).filter(Boolean) ?? []

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Global Deployment Oversight</h2>
            <p className="text-sm text-gray-500">Trigger build, deploy, rollback, scale, and self-heal actions with superuser audit logging.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-6">
            <Input placeholder="Environment ID" value={form.environmentId} onChange={(e) => setForm({ ...form, environmentId: e.target.value })} />
            <Input placeholder="Service ID" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} />
            <Input placeholder="Tenant ID" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} />
            <Select value={form.actionType} onChange={(e) => setForm({ ...form, actionType: e.target.value })}>
              {['BUILD', 'TEST', 'DEPLOY', 'ROLLBACK', 'SCALE', 'SELF_HEAL'].map((action) => <option key={action} value={action}>{action}</option>)}
            </Select>
            <Input placeholder="Image tag" value={form.imageTag} onChange={(e) => setForm({ ...form, imageTag: e.target.value })} />
            <Button
              disabled={!form.environmentId}
              loading={mutation.isPending}
              onClick={() => mutation.mutate(() => globalAdminApi.triggerDeployment({
                environmentId: form.environmentId,
                serviceId: form.serviceId || undefined,
                tenantId: form.tenantId || undefined,
                actionType: form.actionType,
                imageTag: form.imageTag || undefined,
                description: 'Global deployment oversight trigger',
              }))}
            >
              <Rocket className="h-4 w-4" />
              Trigger
            </Button>
          </div>
          {environments.length > 0 && <p className="mt-3 text-xs text-gray-500">Recent environment IDs are available in the run table below.</p>}
        </section>

        {isLoading ? <LoadingState /> : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load deployment data.</div>
        ) : data ? (
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">CI/CD Runs Across Tenants</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr><th className="px-5 py-3">Environment</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentRuns.map((run) => (
                    <tr key={run.id}>
                      <td className="px-5 py-4"><div className="font-medium text-gray-900">{run.environment?.name ?? run.environmentId}</div><div className="text-xs text-gray-500">{run.environmentId}</div></td>
                      <td className="px-4 py-4">{run.service?.name ?? run.serviceId ?? 'Platform'}</td>
                      <td className="px-4 py-4">{run.tenant?.name ?? 'Platform'}</td>
                      <td className="px-4 py-4">{run.actionType}</td>
                      <td className="px-4 py-4">{run.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Critical Oversight Alerts</h2>
          </div>
          <div className="divide-y divide-gray-100 px-5">
            {(alerts?.deploymentAlerts ?? []).slice(0, 10).map((alert) => (
              <div key={alert.id} className="py-3 text-sm">
                <div className="font-medium text-gray-900">{alert.message}</div>
                <div className="text-xs text-gray-500">{alert.severity} · {alert.tenant?.name ?? 'Platform'} · {alert.environment?.name}</div>
              </div>
            ))}
            {(alerts?.deploymentAlerts ?? []).length === 0 && <p className="py-4 text-sm text-gray-500">No unresolved deployment alerts.</p>}
          </div>
        </section>
      </main>
    </>
  )
}
