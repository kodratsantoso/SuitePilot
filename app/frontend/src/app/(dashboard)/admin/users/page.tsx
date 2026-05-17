'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { globalAdminApi } from '@/lib/api'
import { useAdminMutation, useGlobalUsers } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { SaasAdminNav } from '../_components/SaasAdminNav'

const roles = ['SUPERUSER', 'OWNER', 'ADMIN', 'PROJECT_MANAGER', 'CONSULTANT', 'VIEWER', 'USER']

export default function GlobalUsersPage() {
  const [q, setQ] = useState('')
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({})
  const { data, isLoading, error } = useGlobalUsers(q ? { q } : undefined)
  const mutation = useAdminMutation()

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Global User & Role Management</h2>
            <p className="text-sm text-gray-500">Superuser-only role assignment across tenant organizations.</p>
          </div>
          <Input className="sm:w-80" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? <LoadingState /> : error ? (
            <div className="p-5 text-sm text-red-700">Failed to load users: {error instanceof Error ? error.message : 'Unknown error'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr><th className="px-5 py-3">User</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Current Roles</th><th className="px-4 py-3">Assign System Role</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data ?? []).map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4"><div className="font-medium text-gray-900">{user.name}</div><div className="text-xs text-gray-500">{user.email}</div></td>
                      <td className="px-4 py-4"><div>{user.organization?.tenant?.name ?? user.organization?.name}</div><div className="text-xs text-gray-500">{user.status}</div></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(user.userRoles ?? []).map((item) => <span key={item.id} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{item.role.name}</span>)}
                          {(user.userRoles ?? []).length === 0 && <span className="text-xs text-gray-500">No system role</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Select className="w-48" value={selectedRole[user.id] ?? ''} onChange={(e) => setSelectedRole({ ...selectedRole, [user.id]: e.target.value })}>
                            <option value="">Select role</option>
                            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                          </Select>
                          <Button
                            variant="secondary"
                            disabled={!selectedRole[user.id]}
                            loading={mutation.isPending}
                            onClick={() => mutation.mutate(() => globalAdminApi.updateUserRole(user.id, { role: selectedRole[user.id], description: 'Global user management update' }))}
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Apply
                          </Button>
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
