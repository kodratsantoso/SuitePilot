# Skill: Module Boundary Design

## Purpose

Define the boundaries between modules in the AI NetSuite Implementation OS monorepo — which code lives where, what each module owns, and how modules communicate. Clear module boundaries prevent the codebase from becoming a tangled monolith as the platform grows through 15 phases.

## When To Use

Use at the start of each new phase before implementation begins, or when a proposed feature would add a new module or significantly cross existing module boundaries. Also use when refactoring is needed due to boundary violations discovered in code review.

## Required Inputs

- Current monorepo structure (file tree)
- List of new entities, services, or pages being added in this phase
- Existing architecture documentation (`app/.ssot/architecture/ARCHITECTURE.md`)
- Any known pain points in the current module structure

## Process

1. Enumerate all modules in the monorepo (`app/frontend`, `app/backend`, `app/prisma`, `app/packages`).
2. For each new feature, assign it to a module based on the following ownership rules:
   - Data persistence: `app/prisma/`
   - API routes and middleware: `app/backend/`
   - UI and user interaction: `app/frontend/`
   - Shared types, constants, utilities: `app/packages/`
   - AI orchestration logic: `app/backend/ai/`
3. Identify any proposed cross-module communication and define the clean interface (e.g., API call, shared package type, event).
4. Flag any violations of the "no direct database access from frontend" rule.
5. Document the boundary decisions in a module boundary map.

## Output Format

```markdown
# Module Boundary Map — [Phase or Feature Name]

**Date:** [Date]
**Status:** DRAFT — For Engineering Lead Review

## Module Ownership

| Module | Owns | Does Not Own |
|---|---|---|
| `app/prisma/` | Schema, migrations, seed | Business logic, API |
| `app/backend/` | Routes, services, middleware, AI orchestration | Schema, UI |
| `app/frontend/` | Pages, components, hooks, API client | Business logic, DB access |
| `app/packages/` | Shared TypeScript types, Zod schemas, constants | Runtime logic |

## New Feature Assignments

| Feature / Entity | Module | File Path Pattern | Notes |
|---|---|---|---|

## Cross-Module Interfaces

| From Module | To Module | Interface Type | Description |
|---|---|---|---|

## Boundary Violations Identified (if any)

| Location | Violation | Recommended Fix |
|---|---|---|

## Assumptions

[Any assumptions about the module structure that informed these decisions]
```

## Validation Rules

- Every new file must be assigned to exactly one module
- No frontend file may import from `app/prisma/` or `app/backend/` directly
- Shared types must live in `app/packages/types/` — not duplicated in both frontend and backend
- The AI orchestration layer (`app/backend/ai/`) is part of the backend module, not a separate deployment unit

## Risk Checks

- Flag if a single service file exceeds 300 lines (boundary violation likely; refactor into sub-services)
- Flag if frontend files import Prisma types directly (tight coupling)
- Flag if the same business logic appears in both frontend and backend (should be API contract only)

## Do Not Do

- Do not create new top-level directories in the monorepo without an ADR
- Do not allow "shared" to become a dumping ground — every file in `app/packages/` must have a clear owner

## Example Output

> Feature: ProjectTask entity. Module assignments: Schema → `app/prisma/schema.prisma` (add ProjectTask model); Service → `app/backend/services/project-task.service.ts`; Routes → `app/backend/routes/project-tasks.ts`; Types → `app/packages/types/project-task.types.ts`; Page → `app/frontend/app/projects/[projectId]/tasks/page.tsx`; Component → `app/frontend/components/tasks/TaskTable.tsx`.
