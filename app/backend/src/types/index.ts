// App-wide type definitions for Hono context variables

export interface AuthUser {
  id: string
  organizationId: string
  email: string
  name: string
  role: string
}

export type AppVariables = {
  user: AuthUser
}

export type AppEnv = {
  Variables: AppVariables
}

// Standard API response envelopes
export type SuccessResponse<T> = {
  success: true
  data: T
  meta?: PaginationMeta
}

export type ErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type PaginationMeta = {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export type PaginationQuery = {
  page?: string
  perPage?: string
}

export function parsePagination(query: PaginationQuery): { page: number; perPage: number; skip: number } {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1)
  const perPage = Math.min(100, Math.max(1, parseInt(query.perPage ?? '20', 10) || 20))
  const skip = (page - 1) * perPage
  return { page, perPage, skip }
}

export function paginationMeta(total: number, page: number, perPage: number): PaginationMeta {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  }
}
