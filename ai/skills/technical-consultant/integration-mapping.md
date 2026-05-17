# Skill: Integration Mapping

## Purpose

Produce a detailed field-level integration mapping document for a specific integration between NetSuite and an external system. The mapping defines which source fields map to which target fields, the transformation logic required, and any validation rules.

## When To Use

Use after the integration architecture document has been reviewed and a specific integration has been selected for technical design. Integration mapping is a prerequisite for integration development.

## Required Inputs

- Integration ID and name (from integration architecture document)
- Source system name and record/object type
- Target system name and record/entity type
- List of fields from the source system (with data types and examples)
- List of fields available in the target system (NetSuite record fields and their IDs)
- Business rules for transformation (e.g., status code mapping, default values)
- Error handling requirements (what happens if a required field is missing)
- Integration direction and frequency

## Process

1. For each source field, identify the target field.
2. Document the transformation rule (direct map, lookup, concatenate, default, conditional).
3. Identify fields that require lookup (e.g., customer name → NetSuite internal ID).
4. Flag required fields and default values.
5. Document what happens on missing or invalid data (skip, reject, default).

## Output Format

```markdown
# Integration Mapping Document

**Integration ID:** [INT-XXX]
**Integration Name:** [e.g., Salesforce → NetSuite Customer Sync]
**Direction:** [Inbound / Outbound / Bidirectional]
**Version:** 0.1 (Draft)
**Status:** DRAFT — Pending Technical Consultant Review

## Field Mapping Table

| # | Source Field | Source Type | Target Record | Target Field ID | Transformation Rule | Required? | Default | On Missing |
|---|---|---|---|---|---|---|---|---|
| 1 | AccountName | String | Customer | companyname | Direct map | Yes | — | Reject |
| 2 | AccountType | String | Customer | category | Lookup: type_map | Yes | — | Reject |
| 3 | BillingCity | String | Customer | billcity | Direct map | No | — | Skip |
| 4 | Owner.Email | String | Customer | salesrep | Lookup: employee by email | No | Default Rep ID | Default |

## Lookup Tables

### type_map (AccountType → NetSuite Customer Category)

| Source Value | NetSuite Value |
|---|---|
| Prospect | [Internal ID of "Prospect" category] |
| Customer | [Internal ID of "Customer" category] |

## Error Handling Rules

| Error Type | Action |
|---|---|
| Required field missing | Reject record; log error with source record ID |
| Lookup value not found | Reject record; alert integration admin |
| Duplicate record detected | Update existing record (upsert on [key field]) |

## Assumptions

[Assumptions about field format, data quality, lookup availability]

## Open Items for Technical Consultant

[Items requiring development decision]
```

## Validation Rules

- Every source field must have a mapping decision (map, skip, or reject with reason)
- Required field list must be confirmed with functional consultant
- Lookup tables must list all known values (unknown values trigger alerts, not silent failures)

## Risk Checks

- Flag if more than 5 lookup tables are required (high transformation complexity)
- Flag if any field requires date/timezone conversion (common source of bugs)
- Flag if NetSuite internal IDs are hardcoded in the mapping (must be resolved dynamically)

## Do Not Do

- Do not hardcode customer-specific NetSuite internal IDs as final values
- Do not omit error handling rules
- Do not assume direct-map without confirming data type compatibility

## Example Output

> Field 4: Salesforce Owner.Email → NetSuite Sales Rep (salesrep field). Transformation: lookup Employee record by email address. If email not found in NetSuite: assign default sales rep ID (to be confirmed by customer — placeholder "DEFAULT_REP"). Required: No. On missing: use default. Risk: if Salesforce users are not synced to NetSuite as Employees, this lookup will frequently fail.
