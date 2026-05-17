# Deployment Validation Checklist

> Last updated: 2026-05-13

This checklist must be completed before any production deployment.

---

## Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All Prisma migrations applied to staging without errors
- [ ] `.env` variables confirmed for target environment
- [ ] No secrets in codebase (run secret scanning)
- [ ] CHANGELOG.md updated
- [ ] Release notes written

---

## Deployment

- [ ] Database migration applied
- [ ] Application deployed to target environment
- [ ] Health check endpoint returning 200
- [ ] Can authenticate and receive JWT
- [ ] Can read from database
- [ ] Can write to database (create a test record and delete it)
- [ ] AI provider connectivity confirmed (test API call)

---

## Post-Deployment

- [ ] Monitor error rate for 30 minutes post-deployment
- [ ] Monitor response times are within expected range
- [ ] No spike in database connection errors
- [ ] Audit log is recording entries
- [ ] Rollback procedure confirmed ready if needed

---

## Rollback Procedure

1. Revert the application deployment to the previous version
2. If a migration was applied, run the down migration
3. Confirm health check passes on previous version
4. Record the rollback in CHANGELOG.md and notify the team
