import { describe, expect, it } from 'vitest'
import { createSecretSchema, rotateSecretSchema } from './schema.js'

describe('security data protection', () => {
  it('encrypts and decrypts secret values without exposing plaintext in storage format', async () => {
    process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5434/suitepilot'
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-jwt-secret-change-in-production-minimum-32'
    process.env['SESSION_SECRET'] = process.env['SESSION_SECRET'] ?? 'test-session-secret-change-in-production-min-32'
    process.env['SECURITY_ENCRYPTION_KEY'] = process.env['SECURITY_ENCRYPTION_KEY'] ?? 'test-security-encryption-key-change-prod-32'
    const { decryptSecret, encryptSecret, maskSecret } = await import('../../lib/crypto.js')
    const encrypted = encryptSecret('super-secret-value')
    expect(encrypted).not.toContain('super-secret-value')
    expect(decryptSecret(encrypted)).toBe('super-secret-value')
    expect(maskSecret(encrypted)).toMatch(/^encrypted:/)
  })

  it('validates create and rotate secret payloads', () => {
    expect(createSecretSchema.safeParse({
      secretType: 'API_KEY',
      secretName: 'anthropic',
      secretValue: 'value',
      rotationPolicy: 'DAYS_90',
    }).success).toBe(true)

    expect(rotateSecretSchema.safeParse({ secretValue: '' }).success).toBe(false)
  })
})
