# Skill: R2R Process Design

## Purpose

Design the Record-to-Report (R2R) process, covering the financial close cycle, journal entries, reconciliations, period-end close, and management reporting in NetSuite. The R2R process is the backbone of the finance function.

## When To Use

Use during functional design for the financial management module after the solution blueprint has been reviewed. Always involve the customer's finance lead in validating R2R design decisions.

## Required Inputs

- Confirmed financial management requirements
- Chart of accounts structure (from master data design or architect input)
- Fiscal year and period structure
- Multi-subsidiary or single subsidiary
- Consolidation requirements
- Intercompany transaction requirements
- Key reports required (P&L, Balance Sheet, Cash Flow)
- Financial close calendar and current close cycle time
- Reconciliation requirements

## Process

1. Document the monthly close process step by step.
2. Define journal entry types and approval rules.
3. Define period-end close checklist items in NetSuite.
4. Describe the standard reports to be configured.
5. Flag any consolidation or intercompany requirements for architect review.

## Output Format

```markdown
# Functional Design Document — R2R Process

**Project / Module:** Record-to-Report (Financial Management)
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending Senior Functional Consultant and Customer CFO Review

> **Important:** Financial close process design, chart of accounts structure, and
> reporting configuration must be validated by the customer's accounting leadership
> before finalizing. This document is a starting point, not an accounting prescription.

## Fiscal Year and Period Structure

[Fiscal year type, period structure, and close calendar]

## Monthly Close Process

| Step | Activity | Owner | NetSuite Action | Target Day in Close |
|---|---|---|---|---|

## Journal Entry Types

| Type | Description | Approval Required | Auto-Reversal? |
|---|---|---|---|

## Period-End Close Checklist (NetSuite)

[Key NetSuite close tasks: lock prior periods, run depreciation, reconcile subledgers, etc.]

## Standard Reports

| Report | NetSuite Report Type | Frequency | Audience |
|---|---|---|---|

## Consolidation Design (if applicable)

[Consolidation approach, elimination rules, intercompany balancing]

## Assumptions

[All financial assumptions: currency, GAAP vs. IFRS, consolidation approach, depreciation method]

## Open Items for CFO Validation

[List of items requiring explicit customer accounting team confirmation]
```

## Validation Rules

- Fiscal year and period structure must be explicitly confirmed (not assumed)
- Journal entry approval rules must be defined
- Consolidation section is required if OneWorld is in scope

## Risk Checks

- Flag if multi-entity consolidation is required but OneWorld is not in scope
- Flag if IFRS reporting is required — complex configuration requiring specialist review
- Flag if the financial close cycle is under 5 business days — assess NetSuite automation needs

## Do Not Do

- Do not specify depreciation methods without customer accounting team confirmation
- Do not configure tax-related journals without tax specialist review
- Do not claim the report design is "standard" without confirming with the customer's finance team

## Example Output

> Monthly close step 3: Run fixed asset depreciation (NetSuite Fixed Assets Management module). Owner: Accounting Manager. NetSuite action: Depreciation Run process — generates automatic journal entries. Target: Day 2 of close. Assumption: straight-line depreciation is the primary method; accelerated depreciation requires separate confirmation from customer.
