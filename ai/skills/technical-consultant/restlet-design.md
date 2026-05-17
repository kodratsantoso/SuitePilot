# Skill: RESTlet Design

## Purpose

Design the specification for a custom NetSuite RESTlet endpoint: define its purpose, HTTP methods, request/response schemas, authentication requirements, error handling, and deployment considerations. RESTlets are custom server-side scripts that expose NetSuite functionality as REST APIs.

## When To Use

Use when an integration requires a custom NetSuite endpoint that the standard REST Record API or SuiteTalk SOAP API cannot support, or when a specific custom business logic must be exposed via API.

## Required Inputs

- Business requirement or use case for the RESTlet
- Data to be exposed or manipulated (record types, fields)
- HTTP methods needed (GET, POST, PUT, DELETE)
- Calling system (who will call this RESTlet)
- Authentication method (Token-Based Authentication required — Basic Auth deprecated)
- Expected request volume and frequency
- Error handling requirements
- Any existing RESTlets to be extended (if applicable)

## Process

1. Define the RESTlet's purpose, endpoint URL pattern, and script deployment details.
2. Specify each HTTP method supported with its request and response schema.
3. Define input validation rules.
4. Define error response codes and formats.
5. Document governance and performance considerations.
6. Note SuiteScript version (must be 2.1).

## Output Format

```markdown
# RESTlet Design Specification

**Script Name:** [e.g., customscript_acme_so_restlet]
**Deployment Name:** [e.g., customdeploy_acme_so_restlet]
**Script Type:** RESTlet
**SuiteScript Version:** 2.1
**Status:** DRAFT — Pending Senior Technical Consultant Review

> All RESTlet designs are drafts until reviewed and approved by a Senior Technical Consultant.
> Generated code scaffolds (if any) must not be deployed to production without review.

## Purpose

[1–2 sentences describing what this RESTlet does and why it is needed]

## Endpoint

| Item | Value |
|---|---|
| URL Pattern | `/app/site/hosting/restlet.nl?script=[ID]&deploy=[ID]` |
| Authentication | OAuth 1.0 Token-Based Authentication |
| Content-Type | application/json |

## HTTP Methods

### GET — [Description]

**Request Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|

**Response Schema:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "..." }
}
```

### POST — [Description]

[Request body schema and response schema]

## Validation Rules

[Input validation rules for each method]

## Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| INVALID_INPUT | 400 | Request body failed validation |
| NOT_FOUND | 404 | Record not found |
| UNAUTHORIZED | 401 | Authentication failed |
| SERVER_ERROR | 500 | Unexpected server error |

## Governance Considerations

[NetSuite governance unit implications; rate limiting notes; large record set warnings]

## Assumptions

[All assumptions about the integration context]
```

## Validation Rules

- SuiteScript version must always be 2.1
- Authentication must be Token-Based Authentication — never Basic Auth
- Error codes and response schema must be defined for every method
- Governance considerations are mandatory (governance units are a real constraint)

## Risk Checks

- Flag if the RESTlet performs large record set searches without pagination
- Flag if governance unit consumption per call is likely to be high (complex operations)
- Flag if the RESTlet will be called at high frequency (> 100 calls/minute) — rate limiting must be addressed

## Do Not Do

- Do not recommend Basic Auth — it is deprecated in NetSuite
- Do not produce RESTlet specifications without defining error handling
- Do not skip governance unit considerations

## Example Output

> GET method: accepts Sales Order internal ID as a query parameter. Returns SO header fields (entity, trandate, amount, status) and line items array (item, quantity, rate, amount). Error: if SO not found, returns 404 with NOT_FOUND code. Governance consideration: search-based retrieval uses 10 governance units per call; acceptable for expected volume of 50 calls/hour.
