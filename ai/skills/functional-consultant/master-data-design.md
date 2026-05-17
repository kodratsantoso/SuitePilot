# Skill: Master Data Design

## Purpose

Design the master data structure for a NetSuite implementation: chart of accounts, item types, customer/vendor record structures, and key configuration entities. Master data design is foundational — errors here propagate across the entire implementation.

## When To Use

Use early in the functional design phase, before process design documents are finalized. Master data decisions affect configuration in every module.

## Required Inputs

- Chart of accounts from the customer (existing, if migrating; or desired structure)
- Item types in use (inventory items, non-inventory, services, assemblies, kits)
- Customer segment structure (customer categories, price levels, terms groups)
- Vendor categories and payment terms
- Location/subsidiary structure
- Currency requirements
- Tax nexus requirements
- Department and class structure for reporting

## Process

1. Design the chart of accounts structure (account types, numbering convention, segment structure).
2. Define item type matrix.
3. Define customer record structure and segmentation.
4. Define vendor record structure.
5. Identify data quality requirements and transformation rules for migration.

## Output Format

```markdown
# Master Data Design Document

**Project:** [Name]
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending Senior Functional Consultant and Customer Finance Lead Review

> Chart of accounts design and account segmentation must be confirmed
> by the customer's CFO or Controller before any configuration begins.

## Chart of Accounts Design

**Numbering Convention:** [e.g., 5-digit: XXXXX]
**Segments:** [e.g., Account | Department | Class | Location]

| Account Range | Type | Description |
|---|---|---|
| 1000–1999 | Asset | Current and fixed assets |
| 2000–2999 | Liability | Current and long-term liabilities |
| 3000–3999 | Equity | Owner's equity and retained earnings |
| 4000–4999 | Income | Revenue accounts |
| 5000–5999 | Cost of Goods Sold | Direct costs |
| 6000–6999 | Expense | Operating expenses |

## Item Type Matrix

| Item Type | NetSuite Type | Use Case | Tracked in Inventory? |
|---|---|---|---|

## Customer Record Structure

| Field | Configuration | Notes |
|---|---|---|
| Customer Category | [Categories list] | |
| Price Level | [Default price level] | |
| Payment Terms | [Standard terms list] | |
| Credit Limit | [Default / managed per customer] | |

## Vendor Record Structure

| Field | Configuration | Notes |
|---|---|---|

## Subsidiary and Location Structure

[Single subsidiary or multi-subsidiary map]

## Currency Configuration

[Functional currency, transaction currencies, exchange rate management approach]

## Data Migration Notes

[Key data quality issues identified; transformation rules needed; migration volume estimates]

## Assumptions

[All master data assumptions — especially around chart of accounts and tax]

## Open Items Requiring Customer Confirmation

[List]
```

## Validation Rules

- Chart of accounts must be confirmed by the customer's finance lead before configuration
- Item type matrix must cover all item types identified in discovery
- Currency section is mandatory even if single-currency

## Risk Checks

- Flag if the customer is migrating a chart of accounts with more than 500 accounts without a rationalization plan
- Flag if the customer has multiple item types with unclear distinctions (item type errors cause tax and reporting problems)
- Flag multi-currency without confirming exchange rate management approach

## Do Not Do

- Do not finalize account numbers without customer finance team sign-off
- Do not configure tax codes in the master data without tax specialist review

## Example Output

> Item type matrix for Acme Manufacturing includes: Inventory Item (physical goods tracked in inventory), Non-Inventory Item (office supplies, expensed directly), Assembly Item (finished goods assembled from components), and Service Item (installation services). All inventory items tracked in NetSuite Inventory module. Assumption: no lot or serial number tracking required (customer confirmed). Flag: customer mentioned "kits" in discovery — confirm whether Bundle Item type or Assembly Item type is appropriate.
