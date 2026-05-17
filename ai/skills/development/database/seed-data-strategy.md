# Skill: Seed Data Strategy

## Purpose

Design and implement a development seed script (`app/prisma/seed.ts`) that populates the database with representative but entirely fictional data, enabling developers to run the application locally without needing to create data manually.

## When To Use

Use when setting up the initial seed script, or when new entities are added that need representative seed data for development and testing.

## Required Inputs

- Prisma schema (all current entities)
- List of user roles and permissions needed for development
- Business scenarios to represent (e.g., 2 organizations, 3 projects each, various statuses)

## Process

1. Define a set of fictional organizations (2–3 for multi-tenant testing).
2. For each organization: create users with different roles, customers, and projects.
3. For each project: create tasks (mix of statuses), milestones (mix of statuses), RAID items.
4. Create at least one project in each status and health state.
5. Ensure the seed is idempotent (can be run multiple times without creating duplicates — use `upsert`).
6. Document the seed data structure as comments in the seed file.

## Output Format

```typescript
// app/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Organization 1 — Primary dev org
  const org1 = await prisma.organization.upsert({
    where: { slug: 'acme-consulting' },
    update: {},
    create: { name: 'Acme Consulting', slug: 'acme-consulting', plan: 'PROFESSIONAL' },
  })

  // Admin user for org1
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acme-consulting.com' },
    update: {},
    create: {
      organizationId: org1.id,
      email: 'admin@acme-consulting.com',
      hashedPassword: await bcrypt.hash('devpassword123', 12),
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  })

  // ... continue for customers, projects, tasks, milestones, RAID items
  console.log('Seed complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

## Validation Rules

- Seed data must be entirely fictional — no real company names, real people, or real email addresses
- Seed must be idempotent (use `upsert`, not `create`)
- Passwords in seed must be hashed (never plain text)
- Seed must cover at least: 2 orgs, 3 projects per org, each project with tasks + milestones + RAID items

## Risk Checks

- Flag if seed creates records with hardcoded UUIDs (brittle; use upsert on unique business keys instead)
- Flag if seed does not include at least one project in each status (can't test all status filters)

## Do Not Do

- Do not use real company names, real email addresses, or any PII in seed data
- Do not use `create` without `upsert` (seed will fail on second run)
- Do not seed production databases

## Example Output

> Seed creates 2 organizations ("Acme Consulting", "Beta Partners"), 2 users per org (admin + project manager), 2 customers per org, 3 projects per org (Active/Amber, On Hold/Unknown, Completed/Green), each project has 5 tasks (mix of statuses), 3 milestones (1 Completed, 1 In Progress, 1 Not Started), and 3 RAID items (1 Risk/Open, 1 Issue/In Progress, 1 Assumption/Validated).
