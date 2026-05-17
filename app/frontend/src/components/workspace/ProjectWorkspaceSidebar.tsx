'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarLink {
  href: string
  label: string
  icon: React.ReactNode
}

interface ProjectWorkspaceSidebarProps {
  projectId: string
  projectName: string
  projectCode: string
}

const NavIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-4 w-4 items-center justify-center">{children}</span>
)

export function ProjectWorkspaceSidebar({
  projectId,
  projectName,
  projectCode,
}: ProjectWorkspaceSidebarProps) {
  const pathname = usePathname()
  const base = `/projects/${projectId}`

  const links: SidebarLink[] = [
    {
      href: `${base}/overview`,
      label: 'Overview',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/tasks`,
      label: 'Tasks',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M3 4h10M3 8h10M3 12h6" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/milestones`,
      label: 'Milestones',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <circle cx="8" cy="8" r="6" />
            <path strokeLinecap="round" d="M8 5v3l2 2" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/raid`,
      label: 'RAID Log',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M8 2v12M2 8h12" />
            <circle cx="8" cy="8" r="6" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/activity`,
      label: 'Activity',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M1 8h2l2-5 3 10 2-5 2 3 1-1" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/documents`,
      label: 'Documents',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M3 3h7l3 3v7a1 1 0 01-1 1H4a1 1 0 01-1-1V3z" />
            <path strokeLinecap="round" d="M10 3v3h3" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/functional`,
      label: 'Functional',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M2 4h12M2 8h8M2 12h6" />
            <path strokeLinecap="round" d="M13 10l-2 2 2 2" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/technical`,
      label: 'Technical',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M5 4l-3 4 3 4M11 4l3 4-3 4" />
            <path strokeLinecap="round" d="M9 3l-2 10" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/hypercare`,
      label: 'Hypercare',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M8 2l1.5 4h4l-3.5 2.5 1.5 4L8 10l-3.5 2.5 1.5-4L2.5 6h4z" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/governance`,
      label: 'Governance',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M8 2l1.5 3h3l-2.5 2 1 3L8 8.5 5 10l1-3L3.5 5h3z" />
            <circle cx="8" cy="13" r="1" fill="currentColor" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/ai`,
      label: 'AI Workspace',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M8 2C5.239 2 3 4.015 3 6.5c0 1.38.633 2.614 1.636 3.456L4.5 12h7l-.136-2.044A4.496 4.496 0 0013 6.5C13 4.015 10.761 2 8 2z" />
            <path strokeLinecap="round" d="M6 12v1.5a2 2 0 004 0V12" />
            <path strokeLinecap="round" d="M6.5 6.5h3M8 5v3" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/continuous-improvement`,
      label: 'Improvement',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <path strokeLinecap="round" d="M2 12l4-5 3 3 5-7" />
            <path strokeLinecap="round" d="M12 4h2v2" />
          </svg>
        </NavIcon>
      ),
    },
    {
      href: `${base}/settings`,
      label: 'Settings',
      icon: (
        <NavIcon>
          <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
            <circle cx="8" cy="8" r="2.5" />
            <path strokeLinecap="round" d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14" />
          </svg>
        </NavIcon>
      ),
    },
  ]

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      {/* Back to portfolio */}
      <div className="border-b border-gray-100 px-3 py-3">
        <Link
          href="/projects"
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M10 3L5 8l5 5" />
          </svg>
          All Projects
        </Link>
      </div>

      {/* Project identity */}
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-xs font-medium text-brand-600">{projectCode}</p>
        <p className="mt-0.5 text-sm font-semibold leading-tight text-gray-900 line-clamp-2">{projectName}</p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
