'use client'

import { Activity, AlertTriangle, CheckCircle2, RotateCcw, Rocket, Wrench } from 'lucide-react'
import { deploymentApi } from '@/lib/api'
import { useDeploymentMutation, useDeploymentOverview } from '@/hooks/useDeployment'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { SaasAdminNav } from '../_components/SaasAdminNav'
import { cn } from '@/lib/utils'
import type { DeploymentEnvironment, DeploymentRun, DeploymentService } from '@/types'

export default function DeploymentAdminPage() {
  const { data, isLoading, error } = useDeploymentOverview()
  const mutation = useDeploymentMutation()
  const firstService = data?.environments.flatMap((env) => (env.services ?? []).map((service) => ({ env, service })))[0]

  const triggerDeploy = (env: DeploymentEnvironment, service: DeploymentService) => {
    mutation.mutate(() =>
      deploymentApi.trigger({
        environmentId: env.id,
        serviceId: service.id,
        tenantId: service.tenantId ?? undefined,
        actionType: 'DEPLOY',
        imageTag: `${env.slug}-${Date.now()}`,
        version: 'prompt-14',
      })
    )
  }

  const rollback = (env: DeploymentEnvironment, service: DeploymentService) => {
    mutation.mutate(() => deploymentApi.rollback({ environmentId: env.id, serviceId: service.id, tenantId: service.tenantId ?? undefined, reason: 'Admin dashboard rollback' }))
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? <LoadingState /> : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load deployment dashboard: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        ) : data ? (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Metric label="Environments" value={data.totals.environments} />
              <Metric label="Services" value={data.totals.services} />
              <Metric label="Healthy" value={data.totals.healthyServices} tone="green" />
              <Metric label="Open Alerts" value={data.totals.openAlerts} tone={data.totals.openAlerts ? 'red' : 'green'} />
              <Metric label="Failed Runs" value={data.totals.failedRuns} tone={data.totals.failedRuns ? 'red' : 'green'} />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Deployment Control Plane</h2>
                  <p className="text-sm text-gray-500">Trigger CI/CD actions, rollback failed services, and run self-healing checks.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!firstService}
                    loading={mutation.isPending}
                    onClick={() => firstService && triggerDeploy(firstService.env, firstService.service)}
                  >
                    <Rocket className="h-4 w-4" />
                    Trigger Deploy
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!firstService}
                    loading={mutation.isPending}
                    onClick={() => firstService && mutation.mutate(() => deploymentApi.selfHeal(firstService.service.id))}
                  >
                    <Wrench className="h-4 w-4" />
                    Self-Heal
                  </Button>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              {data.environments.map((env) => (
                <article key={env.id} className="rounded-lg border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{env.name}</h3>
                        <p className="text-xs text-gray-500">{env.region ?? 'global'} · {env.secretsRef ?? 'secrets/ref'}</p>
                      </div>
                      <StatusBadge status={env.status} />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(env.services ?? []).map((service) => (
                      <div key={service.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.module} · {service.imageTag ?? 'untagged'}</p>
                            {service.tenant && <p className="mt-1 text-xs text-brand-700">Tenant: {service.tenant.name}</p>}
                          </div>
                          <HealthBadge status={service.healthStatus} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>{service.currentReplicas}/{service.desiredReplicas} replicas</span>
                          <span>{service.status}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="rounded-md px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50" onClick={() => triggerDeploy(env, service)}>Deploy</button>
                          <button className="rounded-md px-2 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-50" onClick={() => rollback(env, service)}>
                            <RotateCcw className="mr-1 inline h-3 w-3" />
                            Rollback
                          </button>
                          <button className="rounded-md px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50" onClick={() => mutation.mutate(() => deploymentApi.selfHeal(service.id))}>Heal</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Alerts" icon={<AlertTriangle className="h-4 w-4" />}>
                <div className="divide-y divide-gray-100">
                  {data.openAlerts.length === 0 ? (
                    <EmptyLine text="No open alerts" />
                  ) : data.openAlerts.map((alert) => (
                    <div key={alert.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{alert.environment?.name} · {alert.service?.name ?? 'environment'}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Metrics" icon={<Activity className="h-4 w-4" />}>
                <div className="divide-y divide-gray-100">
                  {data.metrics.slice(0, 8).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{metric.metricType.replaceAll('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{metric.environment?.name} · {metric.service?.name ?? 'environment'}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{metric.value}{metric.unit ?? ''}</p>
                    </div>
                  ))}
                  {data.metrics.length === 0 && <EmptyLine text="No metrics recorded yet" />}
                </div>
              </Panel>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Deployment History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Run</th>
                      <th className="px-4 py-3">Environment</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentRuns.map((run) => <RunRow key={run.id} run={run} />)}
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

function Metric({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'gray' | 'green' | 'red' }) {
  const colors = { gray: 'text-gray-900', green: 'text-green-700', red: 'text-red-700' }
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={cn('mt-2 text-2xl font-bold', colors[tone])}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
  return <span className={cn('rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', tone)}>{status}</span>
}

function HealthBadge({ status }: { status: string }) {
  const tone = status === 'HEALTHY' ? 'bg-green-50 text-green-700 ring-green-600/20' : status === 'UNHEALTHY' ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
  return <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', tone)}><CheckCircle2 className="h-3 w-3" />{status}</span>
}

function SeverityBadge({ severity }: { severity: string }) {
  const tone = severity === 'CRITICAL' ? 'bg-red-50 text-red-700 ring-red-600/20' : severity === 'WARNING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'
  return <span className={cn('rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', tone)}>{severity}</span>
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-5">{children}</div>
    </section>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <p className="py-6 text-sm text-gray-500">{text}</p>
}

function RunRow({ run }: { run: DeploymentRun }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-4"><code className="text-xs text-gray-600">{run.id.slice(0, 8)}</code></td>
      <td className="px-4 py-4 text-gray-700">{run.environment?.name ?? run.environmentId}</td>
      <td className="px-4 py-4 text-gray-700">{run.service?.name ?? 'all services'}</td>
      <td className="px-4 py-4 text-gray-700">{run.actionType}</td>
      <td className="px-4 py-4"><StatusBadge status={run.status} /></td>
      <td className="px-4 py-4 text-xs text-gray-500">{run.logs?.[run.logs.length - 1]?.message ?? 'No logs'}</td>
    </tr>
  )
}
