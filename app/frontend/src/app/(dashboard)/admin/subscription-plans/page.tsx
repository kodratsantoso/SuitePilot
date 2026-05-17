'use client'

import { useState } from 'react'
import { CheckCircle2, Trash2 } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useAdminMutation, useSubscriptionPlans } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SaasAdminNav } from '../_components/SaasAdminNav'

export default function SubscriptionPlansPage() {
  const { data: plans, isLoading, error } = useSubscriptionPlans()
  const mutation = useAdminMutation()
  const [form, setForm] = useState({
    name: '',
    features: 'discovery,presales',
    pricePerMonth: '0',
    pricePerYear: '0',
    maxUsers: '5',
    maxProjects: '10',
  })

  const createPlan = () => {
    mutation.mutate(() =>
      adminApi.createPlan({
        name: form.name,
        features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
        pricePerMonth: Number(form.pricePerMonth),
        pricePerYear: Number(form.pricePerYear),
        maxUsers: Number(form.maxUsers),
        maxProjects: Number(form.maxProjects),
      }).then(() => setForm({ name: '', features: 'discovery,presales', pricePerMonth: '0', pricePerYear: '0', maxUsers: '5', maxProjects: '10' }))
    )
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Create Subscription Plan</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-6">
            <Input placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="features,csv" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
            <Input type="number" min="0" placeholder="Monthly" value={form.pricePerMonth} onChange={(e) => setForm({ ...form, pricePerMonth: e.target.value })} />
            <Input type="number" min="0" placeholder="Yearly" value={form.pricePerYear} onChange={(e) => setForm({ ...form, pricePerYear: e.target.value })} />
            <Input type="number" min="1" placeholder="Max users" value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: e.target.value })} />
            <Button onClick={createPlan} loading={mutation.isPending} disabled={!form.name}>Create</Button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Plan Catalog</h2>
            <p className="text-sm text-gray-500">Features listed here drive module access and feature gating.</p>
          </div>
          {isLoading ? <LoadingState /> : error ? (
            <div className="p-5 text-sm text-red-700">Failed to load plans: {error instanceof Error ? error.message : 'Unknown error'}</div>
          ) : (
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {(plans ?? []).map((plan) => (
                <article key={plan.id} className="rounded-lg border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">{plan._count?.tenants ?? 0} tenants</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">${plan.pricePerMonth}/mo · ${plan.pricePerYear}/yr</p>
                    </div>
                    <button title="Delete" className="rounded-md p-2 text-red-700 hover:bg-red-50" onClick={() => mutation.mutate(() => adminApi.deletePlan(plan.id))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Max users</p>
                      <p className="font-semibold text-gray-900">{plan.maxUsers}</p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Max projects</p>
                      <p className="font-semibold text-gray-900">{plan.maxProjects}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.features.map((feature) => (
                      <span key={feature} className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
                        <CheckCircle2 className="h-3 w-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
