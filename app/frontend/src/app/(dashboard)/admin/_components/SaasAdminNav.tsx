'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Building2, CreditCard, LockKeyhole, Rocket, ShieldCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin/global-dashboard', label: 'Global', icon: BarChart3 },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscription-plans', label: 'Plans', icon: ShieldCheck },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/deployment', label: 'Deployment', icon: Rocket },
  { href: '/admin/deployments', label: 'Global Deploy', icon: Rocket },
  { href: '/admin/security', label: 'Security', icon: LockKeyhole },
]

export function SaasAdminNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SaaS Administration</h1>
            <p className="text-sm text-gray-500">Tenant isolation, billing, usage, and access control</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  active ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export function TenantStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 ring-green-600/20',
    TRIAL: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    SUSPENDED: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    CANCELLED: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  }
  return (
    <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', styles[status] ?? styles.CANCELLED)}>
      {status}
    </span>
  )
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: 'bg-green-50 text-green-700 ring-green-600/20',
    PENDING: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
    VOID: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  }
  return (
    <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', styles[status] ?? styles.VOID)}>
      {status}
    </span>
  )
}
