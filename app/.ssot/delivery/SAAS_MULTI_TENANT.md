# SaaS Multi-Tenant Management Layer

> Last updated: 2026-05-16 (Prompt 13)

## Overview

The platform now supports subscription-based SaaS operations. Each organization is represented by exactly one tenant, and tenant data is isolated through `organizationId` plus tenant-scoped records.

## Tenant Isolation Rules

- `Tenant.organizationId` is unique and maps one tenant to one organization.
- SaaS records use `tenantId`; project/delivery records continue to use `organizationId`.
- Tenant role assignment rejects users whose `organizationId` does not match the tenant organization.
- All tenant CRUD, usage, billing, and RBAC APIs require authenticated admin-grade access.
- No tenant-specific identifiers are hardcoded in application code.

## Subscription Plan Feature Gating

- `SubscriptionPlan.features` is a JSON array of enabled feature keys.
- `all` grants access to every feature.
- Feature checks reject missing tenants, inactive tenants, inactive plans, and absent features.
- Plan metadata includes monthly/yearly price, max users, max projects, and active/deactivated status.

## Billing and Usage Tracking

- Invoices are tenant-scoped and may reference a subscription plan.
- Invoice creation rejects suspended/cancelled tenants and invalid billing periods.
- Invoice payment updates status to `PAID` and writes an audit log.
- Usage metrics supported: `AI_OUTPUT_COUNT`, `API_USAGE`, `STORAGE_USED`, `ACTIVE_USERS`.
- Usage dashboard returns raw records plus per-metric summaries.

## Tenant RBAC Architecture

- `TenantRole` stores tenant-specific role names and JSON permission keys.
- `TenantUserRole` assigns tenant roles to users.
- Assignments enforce tenant organization membership before write.
- Future modules should evaluate tenant permissions in addition to organization-level RBAC for tenant-admin workflows.

## Frontend Admin Routes

- `/admin/tenants`
- `/admin/subscription-plans`
- `/admin/billing`
- `/admin/tenants/:tenantId/usage`
- `/admin/tenants/:tenantId/roles`

## Known Limitations

- Payment gateway integration is represented as manual invoice status/payment method updates; external gateway webhooks are planned next.
- Feature gating API exists, but not every legacy module is yet wrapped by feature-specific middleware.
- Usage tracking is API-driven; automated metering hooks should be added to high-volume AI and API endpoints.
- Plan max user/project enforcement is documented and modeled but not yet enforced in project/user creation flows.

## Next Implementation Phase

Prompt 14 — Build Deployment & DevOps Layer: Automated CI/CD, Environment Management, Logging, Monitoring, and Self-Healing Pipelines
