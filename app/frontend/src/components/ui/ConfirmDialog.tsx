'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onCancel} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
          role="alertdialog"
          aria-modal
          aria-labelledby="confirm-title"
        >
          <h3 id="confirm-title" className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
