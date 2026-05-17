# Skill: Deployment Validation

## Purpose

Implement and run the post-deployment validation checklist for the AI NetSuite Implementation OS — verifying that a deployment succeeded and the application is operating correctly before marking it as done.

## When To Use

Use after every deployment to staging or production. No deployment is complete without passing the deployment validation.

## Required Inputs

- Deployed environment URL
- List of critical API endpoints to check
- Database migration status
- Expected application version

## Process

1. Hit the health check endpoint and verify 200 response.
2. Verify the database migration has been applied (check migration status).
3. Test authentication flow (register or login with a test account).
4. Test one read operation and one write operation.
5. Verify AI provider connectivity (if configured).
6. Check error rate in the first 15 minutes post-deployment.
7. Document the validation result.

## Output Format

```bash
#!/bin/bash
# app/scripts/validate-deploy.sh

BASE_URL=${1:-"http://localhost:3001"}
echo "=== Deployment Validation: $BASE_URL ==="

# Health check
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
[ "$STATUS" = "200" ] && echo "✓ Health check" || { echo "✗ Health check FAILED ($STATUS)"; exit 1; }

# Database connection
DB_STATUS=$(curl -s "$BASE_URL/api/health" | jq -r '.data.database')
[ "$DB_STATUS" = "connected" ] && echo "✓ Database connected" || echo "✗ Database connection issue"

echo "=== Validation complete ==="
```

## Validation Rules

- Health check endpoint must return 200 with database status
- Deployment validation must be run within 5 minutes of deployment completing
- Failed validation must trigger a rollback assessment

## Risk Checks

- Flag if health check is not implemented before deployment
- Flag if deployment validation is skipped because "it looked fine"

## Do Not Do

- Do not use production credentials in validation scripts
- Do not skip validation for "small" deployments — all deployments require validation

## Example Output

> Deployment validation for staging: ✓ Health check (200), ✓ Database connected, ✓ Auth endpoint reachable (401 without token), ✓ Migration applied (latest: add_project_tasks_table). Validation passed. Deployment confirmed.
