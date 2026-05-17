export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  notFound: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`, 404),
  unauthorized: (msg = 'Authentication required') =>
    new AppError('UNAUTHORIZED', msg, 401),
  forbidden: (msg = 'Insufficient permissions') =>
    new AppError('FORBIDDEN', msg, 403),
  conflict: (msg: string) => new AppError('CONFLICT', msg, 409),
  validation: (msg: string) => new AppError('VALIDATION_ERROR', msg, 422),
  internal: (msg = 'An unexpected error occurred') =>
    new AppError('INTERNAL_SERVER_ERROR', msg, 500),
} as const
