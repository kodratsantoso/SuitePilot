'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}

const sizes = { sm: 'w-80', md: 'w-[480px]', lg: 'w-[580px]' }

export function Sheet({ open, onClose, title, children, size = 'md', footer }: SheetProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full flex-col border-l border-gray-200 bg-white shadow-2xl',
          sizes[size]
        )}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4">{footer}</div>
        )}
      </div>
    </>
  )
}
