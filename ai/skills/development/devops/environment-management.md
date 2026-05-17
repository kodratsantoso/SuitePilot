# Skill: Environment Management

## Purpose

Define and enforce the environment variable management strategy for the AI NetSuite Implementation OS — ensuring all required variables are documented, validated at startup, and never committed to version control.

## When To Use

Use when adding new environment variables, setting up a new deployment environment, or validating that the application fails loudly when required variables are missing.

## Required Inputs

- List of environment variables required by the application
- Current `.env.example` file
- Target environment (development / staging / production)

## Process

1. Document every new environment variable in `.env.example` with a comment explaining its purpose.
2. Implement a startup validation function that checks all required variables are set before the application starts.
3. Define which variables are required vs. optional per environment.
4. Group variables by category in `.env.example` (App, Database, Cache, AI Providers, Auth, Storage, Email).
5. Ensure CI/CD pipelines have all required variables set as secrets.

## Output Format

```typescript
// app/backend/lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
})

export const env = (() => {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
    process.exit(1)
  }
  return parsed.data
})()
```

## Validation Rules

- Application must fail to start if required environment variables are missing
- `.env.example` must be updated whenever a new variable is added
- No defaults for secrets (JWT_SECRET, SESSION_SECRET) — they must be explicitly set

## Risk Checks

- Flag if a new service is added without adding its URL/key to `.env.example`
- Flag if `process.env.X` is used directly without going through the validated `env` object

## Do Not Do

- Do not commit `.env` files
- Do not provide default values for secrets in the env schema
- Do not use different variable names for the same concept in different environments

## Example Output

> Application startup validation: if `JWT_SECRET` is not set or shorter than 32 characters, the backend prints `❌ Invalid environment variables: { JWT_SECRET: ["Required"] }` and exits with code 1 before accepting any connections.
