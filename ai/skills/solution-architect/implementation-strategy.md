# Skill: Implementation Strategy

## Purpose

Define the implementation strategy for a NetSuite engagement: the phasing of module delivery, the rationale for sequencing, key dependencies, milestone structure, and critical path risks. The strategy guides the project plan and sets expectations for both the delivery team and the customer.

## When To Use

Use after the solution blueprint has been drafted and before the project plan is created by the PMO Agent. The implementation strategy is a prerequisite for realistic project planning.

## Required Inputs

- Solution blueprint
- Fit-gap analysis (to understand customization scope)
- Customer's target go-live date
- Customer's organizational change capacity
- Known resource constraints (customer side and delivery side)
- Integration complexity
- Data migration complexity

## Process

1. Define implementation phases (e.g., Phase 1: Core Financials; Phase 2: Procurement and Inventory).
2. For each phase, list the modules, process areas, and key deliverables.
3. Sequence phases based on dependencies (which modules must be live before others can go live).
4. Identify the critical path — the sequence of activities that determines the earliest possible go-live.
5. Flag timeline risks.

## Output Format

```markdown
# Implementation Strategy

**Project:** [Name]
**Customer:** [Name]
**Status:** DRAFT — Pending Solution Architect and PM Review

## Recommended Phasing

| Phase | Modules / Scope | Target Duration | Key Milestone |
|---|---|---|---|

## Phase Descriptions

### Phase 1: [Name]
**Scope:** [Modules and process areas]
**Rationale for this phase:** [Why these modules go first]
**Key deliverables:** [List]
**Dependencies:** [What must be in place before this phase can complete]

[Repeat for each phase]

## Critical Path

[Description of the critical path: which activities have zero float and drive the go-live date]

## Key Risks to Timeline

| Risk | Impact | Mitigation |
|---|---|---|

## Assumptions

[Timeline and phasing assumptions]
```

## Validation Rules

- All in-scope modules must appear in at least one phase
- Critical path must be explicitly identified, not left vague
- Each phase must have a rationale for its sequencing

## Risk Checks

- Flag if the total phased timeline exceeds the customer's stated go-live target
- Flag if data migration is not assigned to a specific phase with adequate time
- Flag if UAT is given less than 3 weeks in any phase

## Do Not Do

- Do not produce a detailed project plan (that is the PMO Agent's responsibility)
- Do not commit specific dates — use durations only unless dates are confirmed by the PM

## Example Output

> Phase 1 (Weeks 1–12): Core Financial Management and basic Procurement. Rationale: establishes the foundational chart of accounts and vendor management before inventory is introduced. Phase 2 (Weeks 10–20): Inventory Management and Order Management. Dependency: Phase 1 item/vendor master must be complete before Phase 2 configuration begins.
