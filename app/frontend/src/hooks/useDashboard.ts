'use client'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'

export function usePortfolioSummary() {
  return useQuery({ queryKey: ['portfolio-summary'], queryFn: () => dashboardApi.getPortfolioSummary().then(r => r.data) })
}
export function useProjectDashboard(projectId: string) {
  return useQuery({ queryKey: ['project-dashboard', projectId], queryFn: () => dashboardApi.getProjectDashboard(projectId).then(r => r.data), enabled: !!projectId })
}
export function useRagOverview(projectId?: string) {
  return useQuery({ queryKey: ['rag-overview', projectId], queryFn: () => dashboardApi.getRagOverview(projectId).then(r => r.data) })
}
export function useHypercareSummary(projectId?: string) {
  return useQuery({ queryKey: ['hypercare-summary', projectId], queryFn: () => dashboardApi.getHypercareSummary(projectId).then(r => r.data) })
}
export function useKpiTrends(params: { projectId?: string; metric: string; timeRange?: number }) {
  return useQuery({ queryKey: ['kpi-trends', params], queryFn: () => dashboardApi.getKpiTrends(params).then(r => r.data) })
}
