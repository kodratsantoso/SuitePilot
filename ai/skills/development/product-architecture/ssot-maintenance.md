# Skill: SSOT Maintenance

## Purpose

Keep the Single Source of Truth (`app/.ssot/`) accurate, current, and consistent with the actual state of the codebase. SSOT files must never lag behind implementation — they are the ground truth for architecture, data model, APIs, and roadmap.

## When To Use

Use when completing a phase, making an architectural decision, adding a new entity or API, or when a code review reveals that SSOT files are out of sync with the implementation.

## Required Inputs

- The change that was made (new entity, new API, new architecture decision, phase completion)
- The current state of the affected SSOT file(s)
- Any ADRs that document the decision being reflected

## Process

1. Identify which SSOT files are affected by the change.
2. Update each affected file to reflect the current state accurately.
3. Add an entry to `app/.ssot/logs/CHANGELOG.md`.
4. If an architectural decision was made, write or update the relevant ADR.
5. Update `app/.ssot/product/TASKS.md` to mark completed tasks and add new ones.
6. Update `app/.ssot/product/PHASES.md` if a phase transitioned.

## Output Format

Updated SSOT files with accurate content. Each update must include:
- Revised "Last updated" date at the top of the file
- Clear, factual description of what changed
- No speculative or aspirational content mixed with factual current state

## Validation Rules

- Every SSOT file must have a "Last updated" date
- DATA_MODEL.md must match the actual Prisma schema (once implemented)
- API_CONTRACTS.md must match the actual implemented routes
- AGENT_REGISTRY.md must match the actual agent files that exist
- CHANGELOG.md must have an entry for every phase completion and significant change

## Risk Checks

- Flag if DATA_MODEL.md has not been updated after a Prisma schema change
- Flag if API_CONTRACTS.md does not include a recently implemented endpoint
- Flag if TASKS.md still lists a task as pending that has been in production for more than one week

## Do Not Do

- Do not describe aspirational future state in SSOT files as if it is current
- Do not leave "Last updated" dates stale
- Do not update CHANGELOG with vague entries like "updated files" — be specific

## Example Output

> SSOT update after adding ProjectTask entity: (1) DATA_MODEL.md — added ProjectTask section with all fields. (2) API_CONTRACTS.md — added tasks endpoints under /api/projects/:projectId/tasks. (3) TASKS.md — marked DB-001, BE-003, BE-004 as complete; added FE-007, FE-008 as pending. (4) CHANGELOG.md — added entry "Phase 1: Added ProjectTask database model and CRUD API." (5) PHASES.md — Phase 1 status updated to "In Progress."
