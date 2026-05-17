# Skill: API Test Design

## Purpose

Design and implement integration tests for all Hono API endpoints in the AI NetSuite Implementation OS — verifying correct behavior, input validation, authentication, multi-tenant isolation, and error responses.

## When To Use

Use after implementing each new API endpoint. Tests must exist before an endpoint is considered done.

## Required Inputs

- API contract for the endpoint being tested
- Prisma schema (for test data setup)
- Authentication flow (how to get a valid JWT for tests)
- Multi-tenant isolation requirements

## Process

1. Set up a test database (separate from development) with reset between test runs.
2. Create test data factories for required entities.
3. Write success case tests (correct input → correct response + side effects).
4. Write validation error tests (missing required field, wrong type, etc.).
5. Write auth error tests (no token, expired token, wrong org).
6. Write IDOR tests (accessing another org's resource returns 404, not 403).
7. Write business rule tests (e.g., cannot create task in a non-existent project).

## Output Format

```typescript
// app/tests/api/project-tasks.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestApp } from '../helpers/test-app'
import { createTestOrg, createTestUser, createTestProject } from '../factories'

describe('POST /api/projects/:projectId/tasks', () => {
  let app: TestApp
  let token: string
  let projectId: string

  beforeEach(async () => {
    await resetTestDatabase()
    const org = await createTestOrg()
    const user = await createTestUser(org.id)
    token = await getAuthToken(app, user)
    const project = await createTestProject(org.id)
    projectId = project.id
  })

  it('creates a task with valid input', async () => {
    const res = await app.request(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test task', status: 'TODO', priority: 'MEDIUM' }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.data.task.title).toBe('Test task')
  })

  it('returns 422 when title is missing', async () => {
    // ...
  })

  it('returns 404 when accessing another org\'s project', async () => {
    const otherOrg = await createTestOrg()
    const otherProject = await createTestProject(otherOrg.id)
    const res = await app.request(`/api/projects/${otherProject.id}/tasks`, { ... })
    expect(res.status).toBe(404)  // Not 403 — do not leak existence
  })
})
```

## Validation Rules

- Every endpoint must have at minimum: 1 success test, 1 validation error test, 1 auth test, 1 IDOR test
- Tests must reset database state before each test (no test order dependency)
- Tests must not make real AI provider calls — mock AI responses

## Risk Checks

- Flag if IDOR test is missing (most common security test gap)
- Flag if tests share database state between test cases (flaky tests)

## Do Not Do

- Do not test via a live browser or Playwright in API tests — use the HTTP test client
- Do not write tests that only test happy paths

## Example Output

> API test for `PATCH /api/projects/:projectId` covers: ✓ updates name and status with valid input; ✓ returns 422 for invalid status enum value; ✓ returns 401 without token; ✓ returns 404 for project belonging to a different organization; ✓ creates audit log entry on update.
