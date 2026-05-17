# Skill: Project Dashboard UI

## Purpose

Build the global project portfolio dashboard — the top-level `/projects` page — that displays all projects in the organization with status, health, and key metrics, and allows users to filter, search, and navigate to individual project workspaces.

## When To Use

Use when implementing or updating the `/projects` page or the ProjectCard/ProjectList components.

## Required Inputs

- Project data model (from `app/.ssot/architecture/DATA_MODEL.md`)
- Project status, health, and type enums
- API contract for `GET /api/projects` (response shape, filter params)
- Design system components available (shadcn/ui)

## Process

1. Implement the `GET /api/projects` React Query hook with filter and search params.
2. Build the `ProjectList` component that renders a grid or table of projects.
3. Build the `ProjectCard` component showing: name, customer, status badge, health badge, go-live date, PM, progress bar.
4. Implement `ProjectStatusBadge` and `ProjectHealthBadge` with color coding.
5. Implement filter controls: status filter, health filter, type filter, search by name/customer.
6. Implement `EmptyState` for when no projects match filters.
7. Implement `LoadingState` (skeleton cards) while data loads.
8. Implement `ErrorState` for API failures.
9. Each project card links to `/projects/[projectId]/overview`.

## Output Format

```tsx
// app/frontend/app/projects/page.tsx
// Renders: search bar, filter controls, ProjectList (grid of ProjectCards)
// Empty state: "No projects found. Create your first project."
// Loading state: skeleton cards
// Error state: "Failed to load projects. Please try again."
```

## Validation Rules

- No hardcoded project data in components — all data from API
- Status and health badges must use the correct color scheme: Green=success, Amber=warning, Red=destructive
- Search must be debounced (300ms) to avoid excessive API calls
- Links to project workspaces must use Next.js `<Link>` not `<a>`

## Risk Checks

- Flag if the page renders a blank screen when no projects exist (must show EmptyState)
- Flag if filter state is not preserved in URL params (breaking the back button)

## Do Not Do

- Do not use `useEffect` for data fetching — use React Query
- Do not show raw API error messages to users — show friendly error state
- Do not hardcode project count, team names, or any business data

## Example Output

> ProjectCard renders: project name ("Acme Manufacturing ERP"), customer chip, StatusBadge (ACTIVE, blue), HealthBadge (AMBER, yellow), go-live date ("Go-live: 2026-09-01"), progress bar (42%), PM name. Card is fully clickable and navigates to `/projects/[id]/overview`. On hover, card has a subtle shadow elevation.
