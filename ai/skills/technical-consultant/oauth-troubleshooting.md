# Skill: OAuth Troubleshooting

## Purpose

Diagnose and provide resolution guidance for OAuth 1.0 Token-Based Authentication (TBA) issues in NetSuite integrations. NetSuite's TBA is the required authentication method for REST and SOAP integrations — it is frequently misconfigured, leading to authentication errors that block integrations.

## When To Use

Use when an integration is returning authentication errors (401 Unauthorized, INVALID_LOGIN_ATTEMPT, TBA_INVALID_TOKEN) or when setting up TBA for the first time and encountering issues.

## Required Inputs

- The error message received (exact text or code)
- The integration method being used (REST Record API / SuiteTalk SOAP / RESTlet)
- NetSuite account ID
- Integration record name and Application ID (not the secret)
- Whether TBA has been enabled for the NetSuite account (Manage Authentication settings)
- Whether the Integration record has TBA enabled
- Whether the Token has been generated and confirmed active
- The OAuth signing method being used (HMAC-SHA256 required)
- Example request headers (Authorization header structure — without actual token values)

## Process

1. Identify the error category from the error code.
2. Check the most common root causes for that error category.
3. Provide a step-by-step diagnostic checklist.
4. Provide resolution steps.
5. Provide verification steps to confirm the fix worked.

## Output Format

```markdown
# OAuth TBA Troubleshooting Report

**Integration:** [Name]
**Error:** [Error code / message]
**Date:** [Date]
**Status:** DRAFT — For Technical Consultant Review

## Error Classification

[Category: Configuration Error / Token Error / Signing Error / Account Setting Error]

## Likely Root Causes (in priority order)

1. [Most likely cause]
2. [Second most likely cause]
3. [...]

## Diagnostic Checklist

### Step 1: Verify Account-Level TBA Settings
- [ ] Navigate to Setup > Company > Enable Features > SuiteCloud tab
- [ ] Confirm "Token-Based Authentication" is checked under Authentication
- [ ] Confirm "SOAP Web Services" and/or "REST Web Services" are enabled as needed

### Step 2: Verify Integration Record
- [ ] Navigate to Setup > Integration > Manage Integrations
- [ ] Find the integration record by name
- [ ] Confirm "Token-Based Authentication" checkbox is enabled on the record
- [ ] Confirm the integration is not in a suspended state

### Step 3: Verify Token
- [ ] Navigate to Setup > Users/Roles > Access Tokens
- [ ] Confirm the token exists and is active (not revoked)
- [ ] Confirm the token is associated with the correct integration and user/role

### Step 4: Verify OAuth Signing
- [ ] Confirm signing method is HMAC-SHA256 (not HMAC-SHA1 — not supported)
- [ ] Verify the OAuth signature base string construction (method + URL + parameters)
- [ ] Confirm the Account ID in the header matches the NetSuite account ID format (e.g., 1234567 not TSTDRV1234567 for production)

## Resolution Steps

[Specific steps based on the root cause identified]

## Verification

[How to confirm the fix worked: example successful API call structure]

## Assumptions

[What was assumed about the integration setup based on the inputs provided]

## Items Requiring Human Verification

[Steps that cannot be performed by the AI and require the technical consultant to check in the actual NetSuite environment]
```

## Validation Rules

- Output must include the diagnostic checklist — never just give a single answer without the full checklist
- Items requiring human verification in the actual NetSuite environment must be listed
- Never include actual token values, consumer keys, or secrets in the output

## Risk Checks

- Flag if the error suggests the token was revoked (security incident possibility)
- Flag if the integration is using Basic Auth — this must be migrated to TBA immediately
- Flag if the Account ID format is wrong (TSTDRV vs. production — common confusion)

## Do Not Do

- Do not request or display actual OAuth tokens, consumer secrets, or private keys
- Do not suggest disabling TBA as a solution
- Do not assume the issue is in code before verifying NetSuite account settings

## Example Output

> Error: INVALID_LOGIN_ATTEMPT (401). Classification: Token Error. Most likely cause: Token has been revoked or regenerated after the integration was configured. Check Setup > Users/Roles > Access Tokens and verify the token status. If revoked, generate a new token, update the integration credentials, and re-test. Secondary cause: Token belongs to a role that does not have REST Web Services permission — verify the role has the correct permissions under Setup > Users/Roles > Manage Roles.
