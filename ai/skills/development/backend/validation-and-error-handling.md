# Skill: Validation and Error Handling

## Purpose

Implement consistent, user-friendly request validation and error handling across all Hono API endpoints in the AI NetSuite Implementation OS. Every API error must be structured, safe (no internal details leaked), and actionable.

## When To Use

Use when implementing any new route handler, or when an existing route is returning inconsistent errors. Every route must follow this pattern.

## Required Inputs

- Zod schema for the request body or query params
- List of business rule validations that cannot be expressed as Zod types
- Standard error codes for this domain

## Process

1. Define a Zod schema for every request body and validated query parameter.
2. Run Zod validation at the route handler level before calling the service layer.
3. Return 422 with field-level errors for Zod validation failures.
4. Use `AppError` class to represent service-layer errors with a code, message, and HTTP status.
5. Implement a global error handler in Hono that converts all errors to the standard response envelope.
6. Never expose stack traces or internal Prisma error details in API responses.

## Output Format

```typescript
// Zod schema (in app/backend/validators/project-task.validator.ts)
export const createProjectTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().datetime().optional(),
  ownerId: z.string().uuid().optional(),
})

// Route handler pattern (app/backend/routes/project-tasks.ts)
app.post('/projects/:projectId/tasks', authMiddleware, async (c) => {
  const body = await c.req.json()
  const parsed = createProjectTaskSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.issues } }, 422)
  }
  // ... call service
})

// Global error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ success: false, error: { code: err.code, message: err.message } }, err.status)
  }
  // Log internally, return generic error externally
  console.error(err)
  return c.json({ success: false, error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred' } }, 500)
})
```

## Validation Rules

- Every POST/PATCH endpoint must use a Zod schema
- 422 responses must include `details` with per-field error information
- 500 responses must never include stack traces or Prisma error messages
- The `AppError` class must be used for all intentional error throws in the service layer

## Risk Checks

- Flag if a route handler has no input validation
- Flag if any error handler re-throws Prisma or internal error messages to the client
- Flag if a route uses `try/catch` with `catch(e) { return null }` (silent failure)

## Do Not Do

- Do not validate the same data in both the route handler and the service function
- Do not use `any` type for error parameters in catch blocks
- Do not return `{ error: "Something went wrong" }` without a machine-readable error code

## Example Output

> POST /api/projects — Zod validation on `{ name, customerId, code, type, targetGoLiveDate }`. If name is missing: 422 with `{ code: "VALIDATION_ERROR", details: [{ path: ["name"], message: "Required" }] }`. If customerId is not a valid UUID: 422 with field-level error on customerId. If customer not found in org: AppError("NOT_FOUND") → 404 `{ code: "NOT_FOUND", message: "Customer not found" }`.
