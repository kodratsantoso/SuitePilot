# SuitePilot Tests

Test suites are organized around the roadmap validation layers:

- backend API and service tests under `app/backend/src/**/*.test.ts`
- frontend rendering and workflow tests under `app/frontend/src/**/*.test.tsx`
- E2E and Docker smoke tests can be promoted here when the test runner is introduced

Every production endpoint should have at least one permission/tenant-isolation validation path.
