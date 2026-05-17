# Skill: Workspace Navigation

## Purpose

Implement the project workspace navigation shell that clearly separates the global portfolio context from an individual project's context. When a user enters a project workspace, the navigation must make it unambiguous which project they are working in, and all navigation links must remain within that project's context.

## When To Use

Use when building the `ProjectWorkspaceShell` layout, the `ProjectWorkspaceSidebar`, and the workspace breadcrumb/header. Also use when adding new sections to the project workspace navigation.

## Required Inputs

- List of workspace sections defined in the product spec (overview, tasks, milestones, raid, documents, ai, settings)
- Project identity data (name, code, customer) from `GET /api/projects/:projectId`
- Route structure from the Product Architect Developer Agent

## Process

1. Implement the workspace shell layout in `app/frontend/app/projects/[projectId]/layout.tsx`.
2. Fetch the project name and customer for display in the workspace header.
3. Build `ProjectWorkspaceSidebar` with navigation links to all workspace sections.
4. Implement a breadcrumb showing: Home > Projects > [Project Name] > [Current Section].
5. Add a project switcher or "Back to Portfolio" link in the workspace header.
6. Highlight the active navigation link using `usePathname()`.
7. Implement workspace-level loading state (while project data loads).

## Output Format

```tsx
// app/frontend/app/projects/[projectId]/layout.tsx
// - Fetches project identity (name, customer)
// - Renders: top header (breadcrumb + project name) + left sidebar + main content slot
// - Sidebar links: Overview, Tasks, Milestones, RAID, Documents, AI, Settings

// app/frontend/components/workspace/ProjectWorkspaceSidebar.tsx
// - Receives projectId as prop
// - Renders navigation links with active state
// - "← Back to All Projects" link at top
```

## Validation Rules

- All workspace links must be prefixed with `/projects/[projectId]/` — no links that escape the workspace
- The current project name must always be visible in the workspace header
- The active section must be highlighted in the sidebar
- "Back to All Projects" must always be reachable

## Risk Checks

- Flag if the workspace layout allows navigation to other projects' data without explicitly going back to the portfolio
- Flag if project identity (name/customer) is not loaded in the workspace header

## Do Not Do

- Do not use global state to store the current project — derive it from the URL (`params.projectId`)
- Do not make the back-to-portfolio link invisible or hard to find
- Do not render the workspace shell before the project identity is loaded (use a loading state)

## Example Output

> Workspace header: "[← All Projects] | Acme Manufacturing ERP (AME-001) | Customer: Acme Corp". Sidebar links: Overview (active, highlighted), Tasks, Milestones, RAID, Documents, AI Assistant, Settings. Breadcrumb: Home > Projects > Acme Manufacturing ERP > Tasks.
