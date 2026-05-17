# Skill: Secret Management

## Purpose

Define and enforce the secret management strategy for the AI NetSuite Implementation OS — ensuring that API keys, tokens, passwords, and other sensitive values are never committed to version control, never logged, and never exposed in API responses.

## When To Use

Use when adding new secrets to the application, reviewing code for secret leakage, or setting up a new environment.

## Required Inputs

- List of secrets required by the application (from `.env.example`)
- Deployment environment (local, staging, production)
- CI/CD platform (GitHub Actions)

## Process

1. Document all secrets in `.env.example` with placeholder values.
2. Set real secrets as environment variables in the deployment environment (GitHub Actions Secrets for CI/CD).
3. Access secrets only through the validated `env` object (from environment management skill).
4. Implement a pre-commit hook that scans for common secret patterns before allowing commits.
5. Never log secret values — log only whether they are set or not.

## Output Format

```bash
# .gitignore must include:
.env
.env.*
!.env.example

# Pre-commit hook (using secretlint or similar):
# .husky/pre-commit
#!/bin/sh
npx secretlint "**/*"
```

```typescript
// CORRECT: log whether secret is configured, not its value
console.log('Anthropic API key configured:', !!env.ANTHROPIC_API_KEY)

// WRONG: never log the actual value
console.log('Anthropic API key:', env.ANTHROPIC_API_KEY)
```

## Validation Rules

- `.env` must be in `.gitignore` — verified at every PR
- No secret value may appear in any log line
- No secret value may appear in any API response body
- All CI/CD secrets must be set as environment secrets in the pipeline, not hardcoded in workflow files

## Risk Checks

- Flag any `console.log` that includes a variable that could contain a secret
- Flag any API response that echoes back configuration values

## Do Not Do

- Do not store secrets in the database
- Do not include secrets in error messages
- Do not use the same secrets across development, staging, and production environments

## Example Output

> Secret audit result: checked all `console.log` and `logger.info` calls — none output secret values. Confirmed `.env` is in `.gitignore`. GitHub Actions uses repository secrets for `ANTHROPIC_API_KEY`, `JWT_SECRET`, `DATABASE_URL`. Local developers use `.env` file (not committed). No secrets found in codebase via secretlint scan.
