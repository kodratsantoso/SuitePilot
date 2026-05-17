'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { adminApi, organizationApi } from '@/lib/api'
import { useAdminMutation, useTenant, useTenantRoles, useTenantUserRoles } from '@/hooks/useAdminSaas'
import { LoadingState } from '@/components/shared/LoadingState'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { SaasAdminNav, TenantStatusBadge } from '../../../_components/SaasAdminNav'
import { useState } from 'react'

export default function TenantRolesPage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params.tenantId
  const { data: tenant } = useTenant(tenantId)
  const { data: roles, isLoading, error } = useTenantRoles(tenantId)
  const { data: userRoles } = useTenantUserRoles(tenantId)
  const { data: members } = useQuery({ queryKey: ['organization-members'], queryFn: () => organizationApi.listMembers().then(r => r.data) })
  const mutation = useAdminMutation()
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: 'project:read,ai:invoke' })
  const [assignment, setAssignment] = useState({ userId: '', roleId: '' })

  const createRole = () => {
    mutation.mutate(() =>
      adminApi.createRole(tenantId, {
        name: roleForm.name,
        description: roleForm.description || undefined,
        permissions: roleForm.permissions.split(',').map((p) => p.trim()).filter(Boolean),
      }).then(() => setRoleForm({ name: '', description: '', permissions: 'project:read,ai:invoke' }))
    )
  }

  const assignRole = () => {
    mutation.mutate(() => adminApi.assignUserRole(tenantId, assignment))
  }

  return (
    <>
      <SaasAdminNav />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{tenant?.name ?? 'Tenant'} Roles</h2>
                {tenant && <TenantStatusBadge status={tenant.status} />}
              </div>
              <p className="text-sm text-gray-500">Assignments are constrained to users inside this tenant organization.</p>
            </div>
            <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">{tenant?.organizationId ?? tenantId}</code>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-base font-semibold text-gray-900">Create Role</h3>
            <div className="mt-4 space-y-3">
              <Input placeholder="Role name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} />
              <Input placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
              <Input placeholder="permission:key,csv" value={roleForm.permissions} onChange={(e) => setRoleForm({ ...roleForm, permissions: e.target.value })} />
              <Button onClick={createRole} disabled={!roleForm.name} loading={mutation.isPending}>
                <ShieldCheck className="h-4 w-4" />
                Create Role
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-base font-semibold text-gray-900">Assign User Role</h3>
            <div className="mt-4 space-y-3">
              <Select value={assignment.userId} onChange={(e) => setAssignment({ ...assignment, userId: e.target.value })}>
                <option value="">Select user</option>
                {(members ?? []).map((member) => <option key={member.id} value={member.id}>{member.name} · {member.email}</option>)}
              </Select>
              <Select value={assignment.roleId} onChange={(e) => setAssignment({ ...assignment, roleId: e.target.value })}>
                <option value="">Select role</option>
                {(roles ?? []).map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </Select>
              <Button onClick={assignRole} disabled={!assignment.userId || !assignment.roleId} loading={mutation.isPending}>
                <UserPlus className="h-4 w-4" />
                Assign Role
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900">Permission Summary</h3>
          </div>
          {isLoading ? <LoadingState /> : error ? (
            <div className="p-5 text-sm text-red-700">Failed to load roles: {error instanceof Error ? error.message : 'Unknown error'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-4 py-3">Permissions</th>
                    <th className="px-4 py-3 text-right">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(roles ?? []).map((role) => (
                    <tr key={role.id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((permission) => (
                            <span key={permission} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{permission}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">{role._count?.userRoles ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900">User Assignments</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {(userRoles ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.user?.name}</p>
                  <p className="text-xs text-gray-500">{item.user?.email}</p>
                </div>
                <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">{item.role?.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
