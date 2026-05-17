# Skill: Solution Blueprint

## Purpose

Generate a Solution Blueprint that describes, at a module and process area level, how NetSuite will be configured to meet the customer's requirements. The blueprint provides the bridge between the BRD (what the customer needs) and the Functional Design Documents (how it will be configured).

## When To Use

Use after the fit-gap analysis has been reviewed by the solution architect. The blueprint documents the high-level design decisions for each module in scope.

## Required Inputs

- Approved or reviewed fit-gap analysis
- Confirmed modules in scope
- Customer's business process context
- Any configuration decisions already made by the architect
- Integration requirements
- Data migration requirements
- Any known constraints (technical, process, organizational)

## Process

1. For each in-scope module, describe the high-level NetSuite configuration approach.
2. Document key configuration decisions and the rationale for each.
3. Identify which configuration items will require customer input or validation.
4. Describe the integration touchpoints for each module.
5. List the assumptions underlying the blueprint.

## Output Format

```markdown
# Solution Blueprint

**Project:** [Name]
**Customer:** [Name]
**Version:** 0.1 (Draft)
**Date:** [Date]
**Status:** DRAFT — Pending Solution Architect Review

---

## Module Blueprints

### [Module Name] — e.g., Financial Management

**Scope:** [Which financial processes are in scope]
**Key Configuration Decisions:**
| Decision | Approach | Rationale | Customer Validation Required? |
|---|---|---|---|

**Gaps Addressed by Customization:**
[Reference to relevant fit-gap entries and the resolution approach]

**Integration Touchpoints:**
[Other modules or external systems this module connects to]

**Open Items:**
[Configuration questions needing customer or architect decision]

---
[Repeat for each module]

---

## Cross-Module Design Considerations

[Dependencies between modules; shared master data; workflow handoffs]

## Key Assumptions

[All assumptions underlying the blueprint]

## Configuration Items Requiring Customer Validation

[Consolidated list of items that must be confirmed with the customer before functional design begins]
```

## Validation Rules

- Every in-scope module must have a blueprint section
- Key Configuration Decisions table must not be empty for any module
- Assumptions must be specific — generic assumptions ("customer will provide data") are not sufficient
- Open items must be listed; none may be silently omitted

## Risk Checks

- Flag any configuration decision that diverges from standard NetSuite best practices
- Flag if more than 3 custom SuiteScript items are required across the solution (scope risk)
- Flag if any module blueprint has more open items than resolved decisions (insufficient discovery)

## Do Not Do

- Do not describe implementation steps or go-live sequencing in the blueprint (that is the Implementation Strategy skill)
- Do not make configuration decisions that the customer must make (mark them as open items)
- Do not reference specific pricing for additional modules

## Example Output

> Financial Management Blueprint for Acme Manufacturing: single subsidiary, USD functional currency, calendar fiscal year, standard chart of accounts with additions for manufacturing cost centers. AP approval routing using two-level workflow for POs and vendor bills over $10,000. No custom SuiteScript required for financial management module. Open item: confirm chart of accounts structure with customer's CFO before functional design.
