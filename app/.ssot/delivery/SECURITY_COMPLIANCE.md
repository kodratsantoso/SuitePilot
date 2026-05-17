# Security, Compliance & Data Protection

> Last updated: 2026-05-16 (Prompt 15)

## Encryption Methods and Scope

Operational encryption registry is stored in `EncryptedField`.

| Scope | Method | Notes |
|---|---|---|
| `SecretStore.secretValue` | AES-256-GCM | Encrypted before database write |
| `BillingInvoice.paymentMethod` | AES-256-GCM | Registered for encryption hardening |
| `AiMessage.content` | AES-256-GCM | Registered for AI data protection hardening |
| `AiGeneratedOutput.content` | AES-256-GCM | Registered for generated-output protection hardening |
| `User.email` | HASHED | Registered for lookup/minimization strategy |

The runtime secret encryption helper uses AES-256-GCM with a SHA-256 derived key from `SECURITY_ENCRYPTION_KEY`, falling back to `SESSION_SECRET` in development.

## Secret Management and Rotation Policies

Secrets are stored in `SecretStore` with:

- `organizationId` mandatory
- optional `tenantId`
- `secretType`
- encrypted `secretValue`
- `rotationPolicy`: MANUAL, DAYS_30, DAYS_60, DAYS_90
- `status`: ACTIVE, ROTATED, REVOKED

Rotation endpoint:

- `PATCH /api/security/secrets/:secretId/rotate`
- replaces encrypted secret value
- updates `lastRotatedAt`
- writes access log and audit log

## Access Log Format and Retention

`AccessLog` records:

- organizationId
- userId
- tenantId
- projectId
- entityType
- entityId
- actionType
- result
- ipAddress
- userAgent
- timestamp

Default retention policy documented in compliance report: 365 days.

## GDPR/PDPA Readiness Checklist

- [x] Sensitive secret values encrypted at rest
- [x] Access logs available and exportable
- [x] Tenant isolation enforced for secret operations
- [x] Secret rotation supported
- [x] Compliance report exposes GDPR/PDPA readiness indicators
- [x] CI security check added
- [ ] Data subject request workflow should be expanded into user-facing request management
- [ ] Full encryption migration for all historical AI content remains future hardening

## Tenant-Level Isolation Rules

- Secret APIs only access records by authenticated `organizationId`.
- Tenant-scoped secret operations validate tenant ownership.
- Access logs can be filtered by tenant only after ownership validation.
- Security dashboards never expose plaintext secret values; values are masked.

## Known Limitations

- Vault integration is represented by internal encrypted `SecretStore`; external Vault/KMS integration is planned.
- Historical AI/message content is registered in `EncryptedField` but not yet migrated to ciphertext.
- TLS termination is configured in production Compose through Traefik, but real certificates require deployment DNS and ACME setup.

## Next Implementation Phase

Prompt 16 — Final QA, End-to-End Testing & Release Layer: Regression Testing, Load Testing, Release Validation, and SaaS Production Go-Live
