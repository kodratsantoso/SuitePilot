# Skill: P2P Process Design

## Purpose

Design the Purchase-to-Pay (P2P) business process for a NetSuite implementation, mapping the customer's requirements to NetSuite's procurement and accounts payable functionality and documenting the agreed process flow, configuration decisions, and open items.

## When To Use

Use during the functional design phase after the solution blueprint for procurement/AP modules has been reviewed by the architect. Use to produce the Functional Design Document (FDD) for the P2P process area.

## Required Inputs

- Confirmed functional requirements for procurement and AP
- Fit-gap analysis results for P2P process area
- Solution blueprint for Purchasing and Accounts Payable modules
- Customer's current P2P process description (as-is)
- Approval authority matrix (who can approve what amounts)
- Vendor payment terms and preferred payment methods
- Number of procurement locations / subsidiaries
- Integration requirements (e.g., receiving from warehouse system, payment to bank)

## Process

1. Document the to-be process flow step by step (Requisition → PO → Receipt → Vendor Bill → Payment).
2. For each step, define the NetSuite transaction type, roles involved, and approval rules.
3. Document configuration requirements per step.
4. Identify automation opportunities (workflows, approval routing).
5. Flag any custom requirements from the fit-gap that affect this process.

## Output Format

```markdown
# Functional Design Document — P2P Process

**Project / Module:** Purchase-to-Pay
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending Senior Functional Consultant Review

## Process Overview

[Description of the end-to-end P2P process as it will work in NetSuite]

## Process Steps

| Step | Description | NetSuite Transaction | Role(s) | Trigger | Approval Rule |
|---|---|---|---|---|---|
| 1 | Purchase Requisition | Purchase Requisition | Requestor | Manual | [Approval rule] |
| 2 | PO Creation | Purchase Order | Buyer | PR approved | [Approval rule] |
| 3 | Goods Receipt | Item Receipt | Warehouse | PO received | None (confirmation) |
| 4 | Vendor Bill | Vendor Bill | AP Clerk | Item Receipt | [Approval rule] |
| 5 | Payment | Vendor Payment | AP Manager | Bill approved | [Approval rule] |

## Configuration Requirements

| Item | Configuration Detail | Customer Validation Required? |
|---|---|---|

## Approval Routing Design

[Description of approval rules, thresholds, and escalation paths]

## Open Items

| ID | Question | Owner |
|---|---|---|

## Assumptions

[All assumptions including: single/multi-location, currency, payment method, tax handling]
```

## Validation Rules

- All five standard P2P steps must appear; any skipped step must be explicitly noted as "Not Applicable" with reason
- Approval routing must be defined for every transaction type with an approval requirement
- Assumptions must include tax treatment and currency assumptions

## Risk Checks

- Flag if three-way matching (PO + Receipt + Bill) is not configured when the customer receives physical goods
- Flag if payment is being processed outside NetSuite (bank integration required)
- Flag if vendor bill approval is missing for any invoice above $0

## Do Not Do

- Do not configure tax rules or withholding tax without flagging that these require tax specialist review
- Do not assume a single-level approval is sufficient without the customer confirming their authority matrix

## Example Output

> Step 4 — Vendor Bill: AP Clerk creates vendor bill in NetSuite upon receipt of supplier invoice. System performs 3-way match against PO and Item Receipt. Bills under $5,000 auto-approved; bills $5,000–$50,000 require AP Manager approval; bills over $50,000 require CFO approval. Payment terms default from vendor record. Assumption: all vendors are paid via bank transfer; check payments not required.
