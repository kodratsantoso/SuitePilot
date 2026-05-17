# Skill: Relational Data Modeling

## Purpose

Design the relational structure for new data entities in the AI NetSuite Implementation OS, ensuring correct normalization, appropriate foreign key relationships, multi-tenant isolation, and data integrity rules before writing any Prisma schema.

## When To Use

Use when adding new entities to the data model — especially entities that have complex relationships (project → tasks → assignments, or project → AI conversations → outputs → reviews).

## Required Inputs

- Entity requirements from the current phase feature spec
- Existing entity definitions from `app/.ssot/architecture/DATA_MODEL.md`
- Query patterns that will be most common (to inform index and relation design)
- Multi-tenancy isolation requirements

## Process

1. Identify all entities involved and their cardinality (one-to-one, one-to-many, many-to-many).
2. Define the ownership chain: which entity owns the record, and which entities reference it.
3. Ensure every entity in a project context has `projectId` (for project-level separation).
4. Ensure every entity has `organizationId` directly or via a parent relation.
5. Define cascade rules: what happens when a parent is deleted (restrict, set null, cascade — never cascade-delete audit logs).
6. Identify any composite unique constraints needed.

## Output Format

```markdown
# Data Model Design — [Feature / Entities]

## Entity Relationships

```
Organization (1)
  └── Project (N) [organizationId]
        ├── ProjectTask (N) [projectId]
        │     └── TaskComment (N) [taskId, projectId]
        ├── ProjectMilestone (N) [projectId]
        └── RaidItem (N) [projectId]
```

## Entity Ownership Chain

| Entity | Direct Owner | Organization Scope |
|---|---|---|
| ProjectTask | Project | Via Project.organizationId |
| RaidItem | Project | Via Project.organizationId |

## Cascade Rules

| Parent | Child | On Parent Delete | Reason |
|---|---|---|---|
| Project | ProjectTask | RESTRICT | Do not silently delete tasks |
| Project | AuditLog | RESTRICT | Audit logs must never cascade-delete |

## Composite Unique Constraints

| Entity | Fields | Reason |
|---|---|---|
| ProjectMember | (projectId, userId) | One member record per user per project |
```

## Validation Rules

- Every entity in a project context must have `projectId`
- AuditLog must never cascade-delete
- Many-to-many relationships must have an explicit join table (not Prisma implicit)

## Risk Checks

- Flag if two entities store the same data (normalization violation)
- Flag if an entity is reachable from the project but doesn't have direct `projectId` (harder to query)

## Do Not Do

- Do not use JSON columns for data that has relational structure and needs to be queried
- Do not denormalize by copying data across tables (use relations and joins)

## Example Output

> RaidItem belongs to Project (via `projectId`). It has `organizationId` directly for fast org-scoped queries. Cascade on project deletion: RESTRICT (do not delete RAID items when project is soft-deleted; they may be needed for audit). Composite index on `(projectId, type, status)` for the filtered RAID log view.
