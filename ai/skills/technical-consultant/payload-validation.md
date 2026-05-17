# Skill: Payload Validation

## Purpose

Validate and document the structure of API request and response payloads for NetSuite REST API integrations, RESTlets, and SuiteTalk SOAP calls. Identify structural errors, missing required fields, incorrect data types, and common NetSuite-specific payload issues.

## When To Use

Use when an integration is sending malformed payloads and receiving errors, when documenting expected payload structures for a new integration, or when reviewing integration payloads before development begins.

## Required Inputs

- The NetSuite record type or RESTlet endpoint involved
- The HTTP method (GET, POST, PUT, PATCH, DELETE)
- The payload example (JSON or XML) to validate or document
- The fields the integration intends to set or read
- The expected outcome of the API call
- Any error messages returned by the API (if troubleshooting)

## Process

1. Identify the record type and the relevant NetSuite REST API schema.
2. Validate required fields (presence, data type, format).
3. Identify field ID errors (wrong NetSuite internal field IDs).
4. Identify data type mismatches (string vs. number vs. boolean vs. reference object).
5. Flag NetSuite-specific payload patterns (subrecords, sublists, reference objects with `id` or `refName`).
6. Produce a corrected example payload with annotations.

## Output Format

```markdown
# Payload Validation Report

**Record Type / Endpoint:** [e.g., salesOrder, customer, RESTlet: customscript_acme_so]
**Method:** [POST / PUT / PATCH / GET]
**Date:** [Date]
**Status:** DRAFT — For Technical Consultant Review

## Validation Summary

| Finding | Severity | Field | Issue | Recommended Fix |
|---|---|---|---|---|
| Missing required field | HIGH | entity | `entity` is required for Sales Order | Add `entity: { id: [customer_id] }` |
| Wrong data type | MEDIUM | quantity | string "5" should be number 5 | Change to integer |
| Wrong field ID | HIGH | companyName | No such field on salesOrder | Use `entity` reference instead |

## Corrected Payload Example

```json
{
  "entity": { "id": 123 },
  "tranDate": "2026-05-13",
  "item": {
    "items": [
      {
        "item": { "id": 456 },
        "quantity": 5,
        "rate": 100.00
      }
    ]
  }
}
```

## Common NetSuite Payload Patterns

- **Reference fields** (entity, item, location): use `{ "id": internalId }` or `{ "refName": "Display Name" }` — not a plain string or number
- **Sublist fields** (line items): always use the `{ "items": [...] }` wrapper
- **Boolean fields**: use `true` / `false`, not "true" / "false"
- **Date fields**: use ISO 8601 format (YYYY-MM-DD)

## Assumptions

[Assumptions about the NetSuite account configuration that affect field availability]

## Items Requiring Technical Consultant Confirmation

[Fields or behaviors that cannot be confirmed without access to the NetSuite account]
```

## Validation Rules

- Validation summary must categorize findings by severity (HIGH / MEDIUM / LOW)
- Corrected payload example must be provided for any payload with HIGH severity findings
- NetSuite-specific patterns section must always be included
- Must not include actual data from production records

## Risk Checks

- Flag if the payload attempts to set fields that are system-controlled (internal ID, date created, etc.)
- Flag if the payload uses `refName` for lookups without confirming the display name is unique
- Flag if the payload does not use `application/json` content type

## Do Not Do

- Do not provide a definitive field list without noting that field availability depends on the NetSuite account configuration and enabled features
- Do not include real customer data, internal IDs, or production record references in examples

## Example Output

> Finding: `entity` field in Sales Order POST payload is passed as a string ("Acme Corp") rather than a reference object. NetSuite REST API requires reference fields to use `{ "id": internalId }` or `{ "refName": "Display Name" }`. Recommended fix: change `"entity": "Acme Corp"` to `"entity": { "refName": "Acme Corp" }` (or use internal ID for reliability). Severity: HIGH — the API will return 400 if the entity cannot be resolved.
