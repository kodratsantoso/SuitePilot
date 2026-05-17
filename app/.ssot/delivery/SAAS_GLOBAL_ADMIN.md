# SaaS Global Admin & Superuser Console

## Scope

Prompt 17 introduces a superuser-only operating console for cross-tenant oversight. It covers tenant lifecycle controls, subscription overrides, global user role assignment, deployment triggers, critical alerts, and auditability for master actions.

## Superuser RBAC

- Global endpoints are mounted under `/api/admin/*`.
- Superuser access requires a JWT role of `SUPERUSER` or an email listed in `SUPERUSER_EMAILS`.
- Tenant isolation remains the default for tenant-scoped APIs; only superuser routes aggregate across tenants.
- Superuser actions are recorded in `SuperuserActionLog`.

## Workflows

- Global dashboard: review tenant KPIs, project RAG, AI output quality, alerts, deployment runs, and action logs.
- Tenant lifecycle: activate, suspend, cancel, or override subscription plan/trial values.
- User management: assign system roles across organizations with audit logging.
- Deployment oversight: trigger build, test, deploy, rollback, scale, or self-heal actions from the global console.

## Cross-Tenant Analytics Rules

- Aggregations must only be returned through superuser-guarded endpoints.
- Tenant/project drill-down links must preserve explicit tenant/project context.
- Tenant-specific operational APIs remain organization-scoped unless called from the global superuser API.

## Known Limitations

- Deployment triggers are simulated control-plane records until an external CI/CD runner is attached.
- Global role changes update database role assignments; active JWTs may need reissue to reflect role changes immediately.
- Exportable reports are represented by structured API responses and can be formalized in a later reporting phase.

## Next Phase

Prompt 18 should add continuous SaaS operations monitoring, SLA dashboards, and predictive capacity planning.
