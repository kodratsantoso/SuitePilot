# Skill: O2C Process Design

## Purpose

Design the Order-to-Cash (O2C) business process for a NetSuite implementation, mapping requirements to NetSuite's sales order, fulfillment, invoicing, and accounts receivable functionality.

## When To Use

Use during the functional design phase for the O2C process area after the solution blueprint for Order Management and Accounts Receivable has been reviewed.

## Required Inputs

- Confirmed functional requirements for sales, fulfillment, invoicing, and AR
- Fit-gap results for O2C process area
- Solution blueprint for Order Management and AR modules
- Customer's current O2C process (as-is)
- Sales transaction types (standard sales, drop ship, back order, subscription)
- Revenue recognition requirements (point-in-time vs. over-time)
- Customer credit terms and credit limit management approach
- Returns/RMA process requirements
- Integration requirements (eCommerce, CRM, shipping carriers)

## Process

1. Document the to-be O2C flow step by step (Quote → Sales Order → Fulfillment → Invoice → Payment/Receipt).
2. For each step, specify the NetSuite transaction, roles, triggers, and approval rules.
3. Document configuration requirements.
4. Flag revenue recognition requirements for specialist review.
5. Identify automation opportunities.

## Output Format

```markdown
# Functional Design Document — O2C Process

**Project / Module:** Order-to-Cash
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending Senior Functional Consultant Review

## Process Overview

[End-to-end O2C flow description]

## Process Steps

| Step | Description | NetSuite Transaction | Role(s) | Trigger | Approval Rule |
|---|---|---|---|---|---|
| 1 | Quote | Estimate | Sales Rep | Customer request | None |
| 2 | Sales Order | Sales Order | Sales Rep/CSR | Quote accepted | [Approval if required] |
| 3 | Fulfillment | Item Fulfillment | Warehouse | SO approved | None |
| 4 | Invoice | Invoice | Billing Clerk | Fulfillment confirmed | None |
| 5 | Payment | Customer Payment | AR Clerk | Invoice sent | None |

## Configuration Requirements

| Item | Configuration Detail | Customer Validation Required? |
|---|---|---|

## Revenue Recognition Design

> **Note:** Revenue recognition configuration (ASC 606 / IFRS 15) requires review by a qualified accounting professional. The following is a draft description only.

[Revenue recognition approach if applicable]

## Returns and RMA Process

[If in scope: RMA flow, credit memo, restocking rules]

## Open Items

| ID | Question | Owner |
|---|---|---|

## Assumptions

[Currency, tax, shipping, credit management, and revenue recognition assumptions]
```

## Validation Rules

- All standard O2C steps must be addressed or explicitly excluded
- Revenue recognition section must be present if subscription or project-based billing is in scope
- Returns process must be addressed if the customer sells physical goods

## Risk Checks

- Flag any Advanced Revenue Management requirement — this is a complex module requiring specialist configuration
- Flag if eCommerce integration is in scope — high technical complexity
- Flag if multi-currency selling is required — exchange rate and FX gain/loss handling needed

## Do Not Do

- Do not finalize revenue recognition configuration without accounting team review
- Do not assume standard pricing applies if the customer has complex pricing tiers

## Example Output

> Step 3 — Item Fulfillment: Warehouse team receives pick notification via NetSuite fulfillment worklist. Items picked, packed, and shipment confirmed in NetSuite. Shipping carrier integration (FedEx/UPS) to be confirmed in Phase 2. Assumption: fulfillment is from a single warehouse location. Multi-location fulfillment is out of scope for Phase 1.
