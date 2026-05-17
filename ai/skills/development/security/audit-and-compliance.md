# Skill: Audit and Compliance

## Purpose

Implement and validate the audit trail and compliance infrastructure for the AI NetSuite Implementation OS — ensuring that all significant actions are logged immutably, that the audit log supports compliance reporting, and that the platform is prepared for enterprise security requirements (SOC 2, GDPR).

## When To Use

Use when implementing the audit log infrastructure, when adding new audit events, or when conducting a compliance readiness review.

## Required Inputs

- AuditLog entity definition from DATA_MODEL.md
- List of required audit events (from audit-log-implementation skill)
- Compliance requirements (GDPR data subject access, SOC 2 logging requirements)

## Process

1. Verify the AuditLog table has no update or delete permissions in Prisma.
2. Implement the `GET /api/audit` endpoint with pagination and filtering (by action, resourceType, actorId, date range).
3. Define data retention policy (how long audit logs are kept).
4. Implement data export for compliance (all audit logs for an organization).
5. Document which actions are logged and which are not (coverage map).

## Output Format

Audit log coverage map:

```markdown
# Audit Log Coverage

## Always Logged
- User login / logout / registration
- Project create / update / archive
- ProjectTask create / update / delete / status change
- ProjectMilestone create / update / status change
- RaidItem create / update / status change
- AiGeneratedOutput status change (every transition)
- AiReview decision (approve / reject / revision)
- User role change
- Organization settings change

## Not Logged (by design)
- Read operations (GET requests) — too high volume; use access logs instead
- UI navigation events
- Health check requests
```

## Validation Rules

- AuditLog records must not have Prisma update or delete methods called on them
- The audit log endpoint must be paginated (max 100 per page)
- Audit log entries must be filterable by date range (compliance requirement: "show all actions between X and Y")

## Risk Checks

- Flag if AuditLog table allows update or delete in Prisma schema (add `@@deny` or service-layer-only access)
- Flag if audit log entries are older than the retention policy but have not been archived

## Do Not Do

- Do not delete audit log entries to save storage — archive them if needed
- Do not make audit log read access available to all users — restrict to ADMIN and OWNER roles

## Example Output

> Compliance audit: confirmed AuditLog has no update/delete calls in any service file. `GET /api/audit?from=2026-01-01&to=2026-05-13&action=project.created` returns paginated list of 47 project creation events in the date range, with actor, timestamp, and resource ID for each. Export available as JSON for compliance reporting.
