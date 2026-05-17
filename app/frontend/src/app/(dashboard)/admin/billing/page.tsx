'use client'

import { useMemo, useState } from 'react'
import { CreditCard, Send } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useAdminMutation, useSubscriptionPlans, useTenantInvoices, useTenants } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { InvoiceStatusBadge, SaasAdminNav } from '../_components/SaasAdminNav'

export default function BillingPage() {
  const { data: tenants } = useTenants()
  const { data: plans } = useSubscriptionPlans()
  const firstTenant = tenants?.[0]?.id ?? ''
  const [tenantId, setTenantId] = useState('')
  const selectedTenantId = tenantId || firstTenant
  const selectedTenant = useMemo(() => tenants?.find((tenant) => tenant.id === selectedTenantId), [tenants, selectedTenantId])
  const { data: invoices, isLoading, error } = useTenantInvoices(selectedTenantId)
  const mutation = useAdminMutation()
  const [amount, setAmount] = useState('0')

  const createInvoice = () => {
    const now = new Date()
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)
    mutation.mutate(() =>
      adminApi.createInvoice({
        tenantId: selectedTenantId,
        subscriptionPlanId: selectedTenant?.subscriptionPlanId ?? plans?.[0]?.id,
        billingPeriodStart: now.toISOString(),
        billingPeriodEnd: end.toISOString(),
        amount: Number(amount),
        paymentMethod: 'manual',
      })
    )
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={selectedTenantId} onChange={(e) => setTenantId(e.target.value)}>
              {(tenants ?? []).map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
            </Select>
            <Input type="number" min="0" placeholder="Invoice amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button onClick={createInvoice} disabled={!selectedTenantId} loading={mutation.isPending}>
              <CreditCard className="h-4 w-4" />
              Create Invoice
            </Button>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Billing scope: <span className="font-medium">{selectedTenant?.organizationId.slice(0, 8) ?? 'none'}</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Invoices</h2>
            <p className="text-sm text-gray-500">Payment actions write tenant audit logs and keep invoices tenant-scoped.</p>
          </div>
          {isLoading ? <LoadingState /> : error ? (
            <div className="p-5 text-sm text-red-700">Failed to load invoices: {error instanceof Error ? error.message : 'Unknown error'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(invoices ?? []).map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4"><code className="text-xs text-gray-600">{invoice.id.slice(0, 8)}</code></td>
                      <td className="px-4 py-4 text-gray-700">{formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}</td>
                      <td className="px-4 py-4 text-gray-700">{invoice.subscriptionPlan?.name ?? 'Manual'}</td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">${invoice.amount.toLocaleString()}</td>
                      <td className="px-4 py-4"><InvoiceStatusBadge status={invoice.status} /></td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="rounded-md px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50" onClick={() => mutation.mutate(() => adminApi.payInvoice(invoice.id, { paymentMethod: 'manual' }))}>Mark Paid</button>
                          <button className="rounded-md p-2 text-blue-700 hover:bg-blue-50" title="Send reminder"><Send className="h-4 w-4" /></button>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}
