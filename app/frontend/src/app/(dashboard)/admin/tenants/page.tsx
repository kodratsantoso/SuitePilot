'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Activity, PauseCircle, PlayCircle, Trash2 } from 'lucide-react'
import { adminApi, globalAdminApi } from '@/lib/api'
import { useAdminMutation, useAdminSummary, useGlobalTenants, useSubscriptionPlans } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { SaasAdminNav, TenantStatusBadge } from '../_components/SaasAdminNav'

export default function TenantAdminPage() {
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({ organizationId: '', name: '', domain: '', subscriptionPlanId: '' })
  const [overridePlan, setOverridePlan] = useState<Record<string, string>>({})
  const { data: summary } = useAdminSummary()
  const { data: tenants, isLoading, error } = useGlobalTenants(status ? { status } : undefined)
  const { data: plans } = useSubscriptionPlans()
  const mutation = useAdminMutation()

  const createTenant = () => {
    mutation.mutate(() =>
      adminApi.createTenant({
        organizationId: form.organizationId,
        name: form.name,
        domain: form.domain || undefined,
        subscriptionPlanId: form.subscriptionPlanId || undefined,
      }).then(() => {
        setForm({ organizationId: '', name: '', domain: '', subscriptionPlanId: '' })
      })
    )
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Metric label="Total Tenants" value={summary?.totalTenants ?? 0} />
          <Metric label="Active" value={summary?.activeTenants ?? 0} tone="green" />
          <Metric label="Trial" value={summary?.trialTenants ?? 0} tone="blue" />
          <Metric label="Suspended" value={summary?.suspendedTenants ?? 0} tone="yellow" />
          <Metric label="Pending Invoices" value={summary?.pendingInvoices ?? 0} tone="red" />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Create Tenant</h2>
              <p className="text-sm text-gray-500">Bind one organization to one isolated SaaS tenant.</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">organizationId scoped</span>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <Input placeholder="Organization UUID" value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })} />
            <Input placeholder="Tenant name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
            <Select value={form.subscriptionPlanId} onChange={(e) => setForm({ ...form, subscriptionPlanId: e.target.value })}>
              <option value="">No plan</option>
              {(plans ?? []).map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
            </Select>
            <Button onClick={createTenant} loading={mutation.isPending} disabled={!form.organizationId || !form.name}>Create</Button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tenant Registry</h2>
              <p className="text-sm text-gray-500">Every row is isolated by tenant and organization scope.</p>
            </div>
            <Select className="w-full sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>

          {isLoading ? <LoadingState /> : error ? (
            <div className="p-5 text-sm text-red-700">Failed to load tenants: {error instanceof Error ? error.message : 'Unknown error'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Tenant</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Isolation</th>
                    <th className="px-4 py-3 text-right">Usage</th>
                    <th className="px-4 py-3 text-right">Invoices</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(tenants ?? []).map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-xs text-gray-500">{tenant.organization?.name ?? tenant.organizationId}</div>
                      </td>
                      <td className="px-4 py-4"><TenantStatusBadge status={tenant.status} /></td>
                      <td className="px-4 py-4 text-gray-700">{tenant.subscriptionPlan?.name ?? 'Unassigned'}</td>
                      <td className="px-4 py-4"><code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{tenant.organizationId.slice(0, 8)}</code></td>
                      <td className="px-4 py-4 text-right">{tenant._count?.usageRecords ?? 0}</td>
                      <td className="px-4 py-4 text-right">{tenant._count?.invoices ?? 0}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link className="rounded-md p-2 text-gray-600 hover:bg-gray-100" title="Usage" href={`/admin/tenants/${tenant.id}/usage`}><Activity className="h-4 w-4" /></Link>
                          <Link className="rounded-md px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50" href={`/admin/tenants/${tenant.id}/roles`}>Roles</Link>
                          <Select className="w-36" value={overridePlan[tenant.id] ?? tenant.subscriptionPlanId ?? ''} onChange={(e) => setOverridePlan({ ...overridePlan, [tenant.id]: e.target.value })}>
                            <option value="">No plan</option>
                            {(plans ?? []).map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
                          </Select>
                          <button className="rounded-md px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50" title="Override subscription" onClick={() => mutation.mutate(() => globalAdminApi.overrideSubscription(tenant.id, { subscriptionPlanId: overridePlan[tenant.id] || null, description: 'Tenant management subscription override' }))}>Override</button>
                          <button className="rounded-md p-2 text-green-700 hover:bg-green-50" title="Activate" onClick={() => mutation.mutate(() => globalAdminApi.updateTenantStatus(tenant.id, { status: 'ACTIVE', description: 'Tenant activated from global console' }))}><PlayCircle className="h-4 w-4" /></button>
                          <button className="rounded-md p-2 text-yellow-700 hover:bg-yellow-50" title="Suspend" onClick={() => mutation.mutate(() => globalAdminApi.updateTenantStatus(tenant.id, { status: 'SUSPENDED', description: 'Tenant suspended from global console' }))}><PauseCircle className="h-4 w-4" /></button>
                          <button className="rounded-md p-2 text-red-700 hover:bg-red-50" title="Delete" onClick={() => mutation.mutate(() => adminApi.deleteTenant(tenant.id))}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
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

function Metric({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'gray' | 'green' | 'blue' | 'yellow' | 'red' }) {
  const colors = {
    gray: 'text-gray-900',
    green: 'text-green-700',
    blue: 'text-blue-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
  }
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[tone]}`}>{value}</p>
    </div>
  )
}
