# Skill: Responsive Layout

## Purpose

Implement responsive page layouts for the AI NetSuite Implementation OS that work correctly on desktop (1280px+) and tablet (768px+) viewports. The platform is primarily a desktop application used by implementation consultants, but it must not break on tablet screens.

## When To Use

Use when creating a new page layout, a new top-level section, or when a layout is reported as broken on a specific viewport.

## Required Inputs

- Page purpose and content requirements (what data needs to be shown)
- Navigation context (is this a global page or a project workspace page?)
- Content structure (sidebar + main, full width, split panel, etc.)
- shadcn/ui and Tailwind version in use

## Process

1. Determine the layout pattern: full-width with sidebar, two-panel, or single-column.
2. Implement the outer layout using Next.js App Router `layout.tsx`.
3. Use Tailwind responsive prefixes (`md:`, `lg:`) for breakpoint-specific styles.
4. Ensure the sidebar collapses or converts to a navigation sheet on tablet.
5. Ensure data tables are horizontally scrollable on tablet, not truncated.
6. Test at three widths: 768px (tablet), 1024px (laptop), 1440px (desktop).

## Output Format

Next.js layout and page files with Tailwind classes, following this structure:

```tsx
// app/frontend/app/projects/layout.tsx
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectsSidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
```

## Validation Rules

- No layout may use fixed pixel widths that would cause overflow on 768px viewport
- All data tables must have `overflow-x-auto` wrapper on tablet
- Sidebar must have a mobile/tablet alternative (collapsible or sheet)
- Main content area must always have sufficient padding to prevent content touching edges

## Risk Checks

- Flag if a layout contains deeply nested flex/grid that collapses incorrectly on tablet
- Flag if any interactive element is smaller than 44px tap target on mobile

## Do Not Do

- Do not use inline styles for layout — use Tailwind classes only
- Do not create layouts that require horizontal scrolling at the page level on desktop

## Example Output

> Project workspace layout: fixed left sidebar (240px, `w-60`) with project navigation links; main content area fills remaining width (`flex-1`). On tablet (md), sidebar becomes a collapsible sheet triggered by a hamburger icon in the top bar. Data tables within project pages use `<div className="overflow-x-auto">` wrappers.
