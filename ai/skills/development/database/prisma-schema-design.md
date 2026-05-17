# Skill: Prisma Schema Design

## Purpose

Design and write the `app/prisma/schema.prisma` file for the AI NetSuite Implementation OS, translating the data model in SSOT into valid Prisma syntax with correct types, relations, enums, indexes, and constraints.

## When To Use

Use when adding new entities to the schema, modifying existing entities, or reviewing the schema against the DATA_MODEL.md specification.

## Required Inputs

- Entity definitions from `app/.ssot/architecture/DATA_MODEL.md`
- List of enums required (Status, Health, Priority, Type enums)
- Relations between entities
- Performance requirements (which fields are commonly filtered/sorted)

## Process

1. Define each model with exact field names matching the data model spec.
2. Set Prisma types: `String`, `Int`, `Boolean`, `DateTime`, `Json`, `Decimal`.
3. Define relations using `@relation` with both sides of the relation.
4. Define enums for all typed status/category/type fields.
5. Add `@@index` for foreign keys and commonly queried fields.
6. Use `@default(now())` for `createdAt` and `@updatedAt` for `updatedAt`.
7. Use `@map` and `@@map` only when database column names must differ from Prisma field names.

## Output Format

```prisma
// app/prisma/schema.prisma (excerpt)

enum ProjectStatus {
  DRAFT
  PLANNED
  ACTIVE
  ON_HOLD
  AT_RISK
  DELAYED
  COMPLETED
  CANCELLED
}

enum ProjectHealth {
  GREEN
  AMBER
  RED
  UNKNOWN
}

model Project {
  id              String         @id @default(uuid())
  organizationId  String
  customerId      String
  name            String
  code            String
  type            ProjectType
  status          ProjectStatus  @default(DRAFT)
  health          ProjectHealth  @default(UNKNOWN)
  startDate       DateTime?
  targetGoLiveDate DateTime?
  description     String?
  createdById     String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?

  organization    Organization   @relation(fields: [organizationId], references: [id])
  customer        Customer       @relation(fields: [customerId], references: [id])
  createdBy       User           @relation("ProjectCreatedBy", fields: [createdById], references: [id])
  members         ProjectMember[]
  tasks           ProjectTask[]
  milestones      ProjectMilestone[]
  raidItems       RaidItem[]
  auditLogs       AuditLog[]

  @@index([organizationId])
  @@index([customerId])
  @@index([status])
  @@index([deletedAt])
}
```

## Validation Rules

- Every model must have `organizationId` or be reachable from a model that does
- Every model must have `id`, `createdAt`, `updatedAt`
- Foreign key fields must have a corresponding `@@index`
- Enums must be defined for all typed string fields (not free-text strings for status/type)
- `deletedAt DateTime?` must be present on entities where soft-delete is required

## Risk Checks

- Flag if a model is missing an `@@index` on its `organizationId` (performance risk on large tenants)
- Flag if a many-to-many relation is implicit (Prisma generates a hidden table — be explicit for tables that need metadata)
- Flag if `Json` type is used for data that should be a proper relational model

## Do Not Do

- Do not use `String` for ID fields — use `@id @default(uuid())` pattern
- Do not add `@unique` to fields that are only unique per-organization (use composite unique instead)
- Do not use Prisma `@@ignore` to hide schema errors — fix them

## Example Output

> ProjectTask model: `id String @id @default(uuid())`, `projectId String`, `title String`, `description String?`, `status TaskStatus @default(BACKLOG)`, `priority TaskPriority @default(MEDIUM)`, `ownerId String?`, `dueDate DateTime?`, `createdById String`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`. Indexes on: `projectId`, `status`, `ownerId`.
