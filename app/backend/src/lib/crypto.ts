import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { env } from './env.js'

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const material = env.SECURITY_ENCRYPTION_KEY ?? env.SESSION_SECRET
  return createHash('sha256').update(material).digest()
}

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return ['v1', iv.toString('base64url'), authTag.toString('base64url'), encrypted.toString('base64url')].join(':')
}

export function decryptSecret(cipherText: string): string {
  const [version, ivRaw, authTagRaw, encryptedRaw] = cipherText.split(':')
  if (version !== 'v1' || !ivRaw || !authTagRaw || !encryptedRaw) {
    throw new Error('Unsupported ciphertext format')
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(authTagRaw, 'base64url'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64url')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

export function maskSecret(cipherText: string): string {
  const digest = createHash('sha256').update(cipherText).digest('hex').slice(0, 10)
  return `encrypted:${digest}`
}
