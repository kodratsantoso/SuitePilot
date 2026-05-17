# Security Architecture

> Last updated: 2026-05-13
> Status: Principles defined — implementation in Phase 1 and Phase 14

---

## Security Principles

1. **Least privilege** — Users and AI agents have the minimum permissions required to perform their task.
2. **Defense in depth** — Security controls exist at the network, application, and data layers.
3. **No secrets in code** — All secrets are managed via environment variables or a secrets manager.
4. **Audit everything** — All authentication events and significant actions are logged immutably.
5. **AI outputs are untrusted by default** — Every AI-generated output must pass human review before use.

---

## Authentication

- JWT-based authentication with short-lived access tokens (15 minutes) and longer-lived refresh tokens (7 days)
- Passwords hashed with bcrypt (cost factor 12)
- Rate limiting on all auth endpoints
- Account lockout after repeated failed login attempts
- Password reset via time-limited, single-use email tokens

---

## Authorization

- Role-Based Access Control (RBAC) enforced at the API middleware layer
- Organization isolation: all queries are scoped to the authenticated user's organization
- AI agent actions are logged with actor type `AI_AGENT` and the invoking user as context
- Review approvals require a role with explicit `approve` permission on the relevant resource type

---

## Data Security

- All data at rest encrypted (database-level encryption via managed PostgreSQL provider)
- All data in transit encrypted (TLS 1.2+)
- PII fields (email, names) should be considered for field-level encryption in Phase 14
- Soft-delete preserves audit trail; hard-delete requires explicit data erasure request

---

## AI-Specific Security

- AI provider API keys are never exposed to the frontend
- All AI invocations are server-side only
- Prompt injection mitigation: user-supplied content is clearly delimited in prompts
- AI outputs are stored in the database, not returned raw to the client without storage
- Governance Agent reviews high-risk outputs before they enter the review workflow

---

## Dependencies

- All npm dependencies must be pinned (exact versions)
- Dependabot or equivalent automated dependency scanning to be configured in Phase 1
- No use of deprecated or unmaintained packages

---

## Phase 14 Additions (Planned)

- SSO / SAML / OIDC integration
- MFA enforcement for all users
- IP allowlisting for enterprise tenants
- Security audit and penetration test
- SOC 2 Type II readiness
- Data residency controls
- GDPR-compliant data deletion workflows
