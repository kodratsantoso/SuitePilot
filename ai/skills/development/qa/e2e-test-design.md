# Skill: E2E Test Design

## Purpose

Design and implement Playwright end-to-end tests for critical user workflows in the AI NetSuite Implementation OS — verifying that the complete stack (frontend + backend + database) works correctly together for the flows that matter most to users.

## When To Use

Use when a new user workflow is complete and ready for E2E coverage. Not every feature needs E2E tests — focus on the golden paths and the flows most likely to break silently.

## Required Inputs

- User workflow description (step-by-step as a user would do it)
- Starting state (what data must exist before the test)
- Expected end state (what should be true after the workflow)
- E2E checklist (`app/.ssot/validation/E2E_CHECKLIST.md`)

## Process

1. Set up the test with database seeding for the required starting state.
2. Use Playwright to navigate through the workflow steps.
3. Assert the expected UI state at each step.
4. Assert the database end state (via API call, not direct DB query).
5. Clean up after the test.

## Output Format

```typescript
// app/tests/e2e/project-creation.spec.ts
import { test, expect } from '@playwright/test'
import { seedTestOrg, cleanupTestOrg } from '../helpers/seed'

test.describe('Create Project workflow', () => {
  let orgId: string

  test.beforeEach(async () => {
    orgId = await seedTestOrg()
  })

  test.afterEach(async () => {
    await cleanupTestOrg(orgId)
  })

  test('user can create a project from the portfolio view', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name=email]', 'admin@test-org.com')
    await page.fill('[name=password]', 'testpassword123')
    await page.click('[type=submit]')

    await expect(page).toHaveURL('/projects')

    await page.click('[data-testid=create-project-button]')
    await page.fill('[name=name]', 'New Test Project')
    await page.selectOption('[name=type]', 'NEW_IMPLEMENTATION')
    await page.click('[type=submit]')

    await expect(page.locator('text=New Test Project')).toBeVisible()
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+\/overview/)
  })
})
```

## Validation Rules

- E2E tests must use `data-testid` attributes for element selection (not CSS classes or text)
- Tests must be completely independent — no shared state between tests
- AI provider calls must be intercepted and mocked in E2E tests

## Risk Checks

- Flag if E2E tests are run in CI without mocking AI provider APIs (cost and flakiness)
- Flag if tests rely on specific text content that is likely to change

## Do Not Do

- Do not use hardcoded sleep() calls — use Playwright `waitFor` methods
- Do not run E2E tests against production data

## Example Output

> E2E test: "User enters project workspace and views tasks". Steps: login → navigate to /projects → click project card → verify workspace URL → verify project name in header → navigate to Tasks → verify task table renders (even if empty with EmptyState). All assertions use `data-testid` attributes.
