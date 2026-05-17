# Skill: API Contract Design

## Purpose

Design clear, consistent API endpoint contracts for the AI NetSuite Implementation OS backend — specifying method, path, request schema, response shape, error codes, permission requirements, and audit log behavior — before implementation begins.

## When To Use

Use before implementing any new API endpoint. The contract must be documented in `app/.ssot/architecture/API_CONTRACTS.md` and approved before the Backend Developer Agent writes the route handler.

## Required Inputs

- Feature requirements from the current phase task list
- Data model for the entities involved
- RBAC permission requirements
- Existing API contracts to ensure naming consistency

## Process

1. Define the HTTP method and path following the established conventions (REST, noun-based, project-scoped where applicable).
2. Define request parameters (path params, query params) with types and validation rules.
3. Define the request body schema (for POST/PATCH) with required/optional fields.
4. Define the success response shape (200/201) following the standard envelope.
5. Define error responses (400, 401, 403, 404, 422) with error codes.
6. Define permission requirements (which role can call this endpoint).
7. Define audit log requirements (what gets logged on this call).

## Output Format

```markdown
### [METHOD] /api/[path]

**Purpose:** [One sentence]

**Permission:** [Role required]

**Request Parameters:**
| Name | Location | Type | Required | Description |
|---|---|---|---|---|

**Request Body:**
```json
{ "field": "type" }
```

**Response 200/201:**
```json
{ "success": true, "data": { ... } }
```

**Error Responses:**
| Code | HTTP Status | Trigger |
|---|---|---|
| VALIDATION_ERROR | 422 | Invalid request body |
| NOT_FOUND | 404 | Resource not found |

**Audit Log:** [What is logged and when]
```

## Validation Rules

- Every POST and PATCH must have a request body schema
- Every protected endpoint must specify its permission requirement
- Error responses must include 401, 404, and 422 at minimum
- Path params must use camelCase IDs matching the database entity ID field

## Risk Checks

- Flag if a new endpoint path conflicts with an existing path
- Flag if a GET endpoint requires a request body (REST violation)
- Flag if pagination is not defined for list endpoints that could return more than 20 records

## Do Not Do

- Do not design endpoints that return data outside the authenticated user's organization
- Do not design bulk endpoints that could be abused without rate limiting
- Do not invent new error codes — use the established error code taxonomy

## Example Output

> PATCH /api/projects/:projectId/tasks/:taskId. Purpose: Update a project task. Permission: project:member. Request body: `{ title?, description?, status?, priority?, ownerId?, dueDate? }` (all optional). Response 200: `{ success: true, data: { task } }`. Errors: 422 (validation), 404 (task or project not found), 401 (not authenticated), 403 (not project member). Audit log: `task.updated` event with actor, taskId, projectId, changed fields diff.
