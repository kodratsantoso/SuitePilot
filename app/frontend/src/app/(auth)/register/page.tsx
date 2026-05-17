'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ orgName: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form.orgName, form.name, form.email, form.password)
      router.push('/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your workspace</h1>
          <p className="mt-2 text-sm text-gray-500">Set up your organization on SuitePilot</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'orgName' as const, label: 'Organization Name', type: 'text', placeholder: 'Acme Consulting' },
              { key: 'name' as const, label: 'Your Name', type: 'text', placeholder: 'Alex Johnson' },
              { key: 'email' as const, label: 'Email', type: 'email', placeholder: 'alex@example.com' },
              { key: 'password' as const, label: 'Password', type: 'password', placeholder: '8+ characters' },
            ].map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="block text-sm font-medium text-gray-700">
                  {f.label}
                </label>
                <input
                  id={f.key}
                  type={f.type}
                  required
                  placeholder={f.placeholder}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  {...field(f.key)}
                />
              </div>
            ))}

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Creating workspace...' : 'Create workspace'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
