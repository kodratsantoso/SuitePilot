import { QueryProvider } from '@/providers/QueryProvider'

// Dashboard layout — wraps all authenticated pages with React Query context
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </QueryProvider>
  )
}
