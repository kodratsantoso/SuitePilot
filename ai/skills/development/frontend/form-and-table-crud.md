# Skill: Form and Table CRUD

## Purpose

Implement create/read/update/delete functionality for project management entities (tasks, milestones, RAID items, etc.) using forms with validation and data tables with actions. This skill defines the patterns to follow consistently across all CRUD interfaces in the platform.

## When To Use

Use when implementing any list + detail view with create/edit/delete functionality. Applies to: tasks, milestones, RAID items, team members, customers, projects, and any future entity.

## Required Inputs

- Entity data model (fields, types, required/optional)
- API contracts for the entity (list, create, update, delete endpoints)
- Validation rules for the entity
- shadcn/ui components available

## Process

1. Implement the React Query hooks: `useEntityList()`, `useCreateEntity()`, `useUpdateEntity()`, `useDeleteEntity()`.
2. Build the data table using shadcn/ui `DataTable` pattern with sortable columns and row actions.
3. Build the create/edit form using `react-hook-form` with Zod schema validation.
4. Use a `Sheet` or `Dialog` for create/edit forms (side panel preferred for complex forms, dialog for simple).
5. Implement optimistic updates where appropriate (immediate UI feedback before API confirmation).
6. Implement row-level delete with a confirmation dialog.
7. Handle empty state, loading state, and error state.
8. Surface API validation errors (422) inline on the form field.

## Output Format

```tsx
// Components:
// - EntityTable.tsx — data table with sort, filter, row actions
// - EntityForm.tsx — create/edit form with Zod validation
// - EntityActions.tsx — row action menu (edit, delete)
// - useEntityQueries.ts — all React Query hooks for this entity
//
// Validation: Zod schema matching the API request body Zod schema
// Error handling: form-level error display, toast notifications for success/failure
```

## Validation Rules

- Every form field must display its validation error inline (not just a generic error toast)
- Delete actions must always require confirmation
- Mutation success must show a toast notification ("Task created successfully")
- All data tables must have a loading skeleton state (not a spinner that shifts layout)

## Risk Checks

- Flag if form submission does not disable the submit button while the mutation is pending (double-submit risk)
- Flag if delete does not have a confirmation step
- Flag if the table does not handle the empty state (blank screen risk)

## Do Not Do

- Do not use `useState` + `useEffect` for API data — use React Query mutations and queries
- Do not show raw Zod error objects to users
- Do not implement different patterns for different entities — be consistent

## Example Output

> TaskTable renders a shadcn/ui DataTable with columns: Title, Status (badge), Priority (badge), Owner, Due Date, Actions. Row actions: Edit (opens TaskForm Sheet), Delete (opens confirm Dialog). TaskForm uses react-hook-form with Zod schema. On submit: calls `useCreateTask()` or `useUpdateTask()` mutation. On success: toast "Task saved", sheet closes, table refetches.
