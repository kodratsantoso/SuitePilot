'use client'

import { useState } from 'react'
import { AlertTriangle, Download, KeyRound, LockKeyhole, RotateCw, ShieldCheck } from 'lucide-react'
import { securityApi } from '@/lib/api'
import { useAccessLogs, useComplianceReport, useEncryptedFields, useSecrets, useSecurityMutation } from '@/hooks/useSecurity'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { LoadingState } from '@/components/shared/LoadingState'
import { SaasAdminNav } from '../_components/SaasAdminNav'
import { cn } from '@/lib/utils'
import type { AccessLog } from '@/types'

export default function SecurityAdminPage() {
  const [resultFilter, setResultFilter] = useState('')
  const [secretForm, setSecretForm] = useState({ secretName: '', secretType: 'API_KEY', secretValue: '', rotationPolicy: 'DAYS_90' })
  const [rotateValue, setRotateValue] = useState('')
  const { data: logs, isLoading: logsLoading, error: logsError } = useAccessLogs(resultFilter ? { result: resultFilter } : undefined)
  const { data: secrets } = useSecrets()
  const { data: fields } = useEncryptedFields()
  const { data: report } = useComplianceReport()
  const mutation = useSecurityMutation()

  const createSecret = () => {
    mutation.mutate(() =>
      securityApi.createSecret(secretForm).then(() => {
        setSecretForm({ secretName: '', secretType: 'API_KEY', secretValue: '', rotationPolicy: 'DAYS_90' })
      })
    )
  }

  const rotateFirstSecret = () => {
    const first = secrets?.[0]
    if (!first || !rotateValue) return
    mutation.mutate(() => securityApi.rotateSecret(first.id, { secretValue: rotateValue }).then(() => setRotateValue('')))
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Metric label="Encrypted Fields" value={report?.encryptedFields ?? 0} tone="green" />
          <Metric label="Active Secrets" value={report?.activeSecrets ?? 0} />
          <Metric label="Stale Secrets" value={report?.staleSecrets ?? 0} tone={(report?.staleSecrets ?? 0) > 0 ? 'red' : 'green'} />
          <Metric label="Failed Access" value={report?.failedAccess ?? 0} tone={(report?.failedAccess ?? 0) > 0 ? 'red' : 'green'} />
          <Metric label="Critical Alerts" value={report?.openCriticalAlerts ?? 0} tone={(report?.openCriticalAlerts ?? 0) > 0 ? 'red' : 'green'} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Compliance Readiness" icon={<ShieldCheck className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Readiness label="GDPR" ready={report?.gdprReady ?? false} />
              <Readiness label="PDPA" ready={report?.pdpaReady ?? false} />
            </div>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              Retention: <span className="font-medium">{report?.retentionPolicyDays ?? 365} days</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {(report?.dataSubjectRights ?? []).map((right) => (
                  <span key={right} className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{right}</span>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Secret Management" icon={<KeyRound className="h-4 w-4" />}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Secret name" value={secretForm.secretName} onChange={(e) => setSecretForm({ ...secretForm, secretName: e.target.value })} />
              <Select value={secretForm.secretType} onChange={(e) => setSecretForm({ ...secretForm, secretType: e.target.value })}>
                <option value="API_KEY">API key</option>
                <option value="DB_PASSWORD">DB password</option>
                <option value="TOKEN">Token</option>
                <option value="WEBHOOK_SECRET">Webhook secret</option>
                <option value="OAUTH_CLIENT_SECRET">OAuth client secret</option>
              </Select>
              <Input type="password" placeholder="Secret value" value={secretForm.secretValue} onChange={(e) => setSecretForm({ ...secretForm, secretValue: e.target.value })} />
              <Select value={secretForm.rotationPolicy} onChange={(e) => setSecretForm({ ...secretForm, rotationPolicy: e.target.value })}>
                <option value="DAYS_30">30 days</option>
                <option value="DAYS_60">60 days</option>
                <option value="DAYS_90">90 days</option>
                <option value="MANUAL">Manual</option>
              </Select>
              <Button onClick={createSecret} disabled={!secretForm.secretName || !secretForm.secretValue} loading={mutation.isPending}>
                <LockKeyhole className="h-4 w-4" />
                Store Encrypted
              </Button>
              <div className="flex gap-2">
                <Input type="password" placeholder="Rotate first secret" value={rotateValue} onChange={(e) => setRotateValue(e.target.value)} />
                <Button variant="secondary" onClick={rotateFirstSecret} disabled={!secrets?.[0] || !rotateValue} loading={mutation.isPending}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Encryption Status" icon={<LockKeyhole className="h-4 w-4" />}>
            <div className="divide-y divide-gray-100">
              {(fields ?? []).map((field) => (
                <div key={field.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{field.tableName}.{field.columnName}</p>
                    <p className="text-xs text-gray-500">At-rest protection registered</p>
                  </div>
                  <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20">{field.encryptionMethod}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Secrets" icon={<KeyRound className="h-4 w-4" />}>
            <div className="divide-y divide-gray-100">
              {(secrets ?? []).map((secret) => (
                <div key={secret.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{secret.secretName}</p>
                      <p className="text-xs text-gray-500">{secret.secretType} · {secret.secretValue}</p>
                    </div>
                    <StatusBadge status={secret.status} />
                  </div>
                </div>
              ))}
              {(secrets ?? []).length === 0 && <p className="py-6 text-sm text-gray-500">No secrets stored yet</p>}
            </div>
          </Panel>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h2 className="text-base font-semibold text-gray-900">Access Logs</h2>
            </div>
            <div className="flex gap-2">
              <Select className="w-44" value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
                <option value="">All results</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
              </Select>
              <Button variant="secondary" onClick={() => exportLogs(logs ?? [])}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          {logsLoading ? <LoadingState /> : logsError ? (
            <div className="p-5 text-sm text-red-700">Failed to load logs: {logsError instanceof Error ? logsError.message : 'Unknown error'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Tenant</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(logs ?? []).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-600">{formatDate(log.timestamp)}</td>
                      <td className="px-4 py-4 text-gray-900">{log.user?.name ?? log.userId?.slice(0, 8) ?? 'system'}</td>
                      <td className="px-4 py-4 text-gray-600">{log.tenant?.name ?? log.tenantId?.slice(0, 8) ?? 'shared'}</td>
                      <td className="px-4 py-4 text-gray-600">{log.entityType}</td>
                      <td className="px-4 py-4 text-gray-600">{log.actionType}</td>
                      <td className="px-4 py-4"><ResultBadge result={log.result} /></td>
                      <td className="px-4 py-4 text-gray-500">{log.ipAddress ?? 'n/a'}</td>
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

function Metric({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'gray' | 'green' | 'red' }) {
  const colors = { gray: 'text-gray-900', green: 'text-green-700', red: 'text-red-700' }
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={cn('mt-2 text-2xl font-bold', colors[tone])}>{value}</p>
    </div>
  )
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Readiness({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className={cn('rounded-md p-3 ring-1 ring-inset', ready ? 'bg-green-50 text-green-800 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20')}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs">{ready ? 'Ready' : 'Needs review'}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : status === 'ROTATED' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-gray-100 text-gray-700 ring-gray-500/20'
  return <span className={cn('rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', tone)}>{status}</span>
}

function ResultBadge({ result }: { result: string }) {
  const tone = result === 'SUCCESS' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
  return <span className={cn('rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', tone)}>{result}</span>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function exportLogs(logs: AccessLog[]) {
  const rows = ['timestamp,user,tenant,entity,action,result,ipAddress', ...logs.map((log) => [
    log.timestamp,
    log.user?.email ?? log.userId ?? 'system',
    log.tenant?.name ?? log.tenantId ?? 'shared',
    log.entityType,
    log.actionType,
    log.result,
    log.ipAddress ?? '',
  ].join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'access-logs.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
