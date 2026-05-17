'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, globalAdminApi } from '@/lib/api'

export function useAdminSummary() {
  return useQuery({ queryKey: ['admin-summary'], queryFn: () => adminApi.getSummary().then(r => r.data) })
}

export function useTenants(params?: Record<string, string>) {
  return useQuery({ queryKey: ['tenants', params], queryFn: () => adminApi.listTenants(params).then(r => r.data) })
}

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => adminApi.getTenant(tenantId).then(r => r.data),
    enabled: !!tenantId,
  })
}

export function useSubscriptionPlans() {
  return useQuery({ queryKey: ['subscription-plans'], queryFn: () => adminApi.listPlans().then(r => r.data) })
}

export function useTenantUsage(tenantId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tenant-usage', tenantId, params],
    queryFn: () => adminApi.getUsage(tenantId, params).then(r => r.data),
    enabled: !!tenantId,
  })
}

export function useTenantInvoices(tenantId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tenant-invoices', tenantId, params],
    queryFn: () => adminApi.listInvoices(tenantId, params).then(r => r.data),
    enabled: !!tenantId,
  })
}

export function useTenantRoles(tenantId: string) {
  return useQuery({
    queryKey: ['tenant-roles', tenantId],
    queryFn: () => adminApi.listRoles(tenantId).then(r => r.data),
    enabled: !!tenantId,
  })
}

export function useTenantUserRoles(tenantId: string) {
  return useQuery({
    queryKey: ['tenant-user-roles', tenantId],
    queryFn: () => adminApi.listUserRoles(tenantId).then(r => r.data),
    enabled: !!tenantId,
  })
}

export function useAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-summary'] })
      void queryClient.invalidateQueries({ queryKey: ['tenants'] })
      void queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      void queryClient.invalidateQueries({ queryKey: ['tenant-usage'] })
      void queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['tenant-roles'] })
      void queryClient.invalidateQueries({ queryKey: ['tenant-user-roles'] })
      void queryClient.invalidateQueries({ queryKey: ['global-dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['global-tenants'] })
      void queryClient.invalidateQueries({ queryKey: ['global-users'] })
      void queryClient.invalidateQueries({ queryKey: ['global-alerts'] })
    },
  })
}

export function useGlobalDashboard() {
  return useQuery({ queryKey: ['global-dashboard'], queryFn: () => globalAdminApi.getDashboard().then(r => r.data) })
}

export function useGlobalTenants(params?: Record<string, string>) {
  return useQuery({ queryKey: ['global-tenants', params], queryFn: () => globalAdminApi.listTenants(params).then(r => r.data) })
}

export function useGlobalUsers(params?: Record<string, string>) {
  return useQuery({ queryKey: ['global-users', params], queryFn: () => globalAdminApi.listUsers(params).then(r => r.data) })
}

export function useGlobalAlerts() {
  return useQuery({ queryKey: ['global-alerts'], queryFn: () => globalAdminApi.getAlerts().then(r => r.data) })
}
