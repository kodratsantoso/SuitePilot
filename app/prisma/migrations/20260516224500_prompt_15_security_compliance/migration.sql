-- Prompt 15 — Security, Compliance & Data Protection Layer

CREATE TYPE "EncryptionMethod" AS ENUM ('AES_256_GCM', 'RSA', 'HASHED');
CREATE TYPE "SecretType" AS ENUM ('API_KEY', 'DB_PASSWORD', 'TOKEN', 'WEBHOOK_SECRET', 'OAUTH_CLIENT_SECRET');
CREATE TYPE "RotationPolicy" AS ENUM ('MANUAL', 'DAYS_30', 'DAYS_60', 'DAYS_90');
CREATE TYPE "AccessActionType" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'ROTATE_SECRET', 'REVOKE_SECRET', 'LOGIN', 'LOGOUT', 'SECURITY_CHECK');
CREATE TYPE "AccessResult" AS ENUM ('SUCCESS', 'FAILURE');
CREATE TYPE "SecretStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED');

CREATE TABLE "EncryptedField" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "columnName" TEXT NOT NULL,
    "encryptionMethod" "EncryptionMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EncryptedField_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "tenantId" TEXT,
    "projectId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "actionType" "AccessActionType" NOT NULL,
    "result" "AccessResult" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecretStore" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tenantId" TEXT,
    "secretType" "SecretType" NOT NULL,
    "secretName" TEXT NOT NULL,
    "secretValue" TEXT NOT NULL,
    "encryptionMethod" "EncryptionMethod" NOT NULL DEFAULT 'AES_256_GCM',
    "status" "SecretStatus" NOT NULL DEFAULT 'ACTIVE',
    "rotationPolicy" "RotationPolicy" NOT NULL DEFAULT 'DAYS_90',
    "lastRotatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretStore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EncryptedField_tableName_columnName_key" ON "EncryptedField"("tableName", "columnName");
CREATE INDEX "EncryptedField_tableName_idx" ON "EncryptedField"("tableName");

CREATE INDEX "AccessLog_organizationId_idx" ON "AccessLog"("organizationId");
CREATE INDEX "AccessLog_userId_idx" ON "AccessLog"("userId");
CREATE INDEX "AccessLog_tenantId_idx" ON "AccessLog"("tenantId");
CREATE INDEX "AccessLog_projectId_idx" ON "AccessLog"("projectId");
CREATE INDEX "AccessLog_entityType_idx" ON "AccessLog"("entityType");
CREATE INDEX "AccessLog_actionType_idx" ON "AccessLog"("actionType");
CREATE INDEX "AccessLog_result_idx" ON "AccessLog"("result");
CREATE INDEX "AccessLog_timestamp_idx" ON "AccessLog"("timestamp");

CREATE UNIQUE INDEX "SecretStore_organizationId_tenantId_secretName_key" ON "SecretStore"("organizationId", "tenantId", "secretName");
CREATE INDEX "SecretStore_organizationId_idx" ON "SecretStore"("organizationId");
CREATE INDEX "SecretStore_tenantId_idx" ON "SecretStore"("tenantId");
CREATE INDEX "SecretStore_secretType_idx" ON "SecretStore"("secretType");
CREATE INDEX "SecretStore_status_idx" ON "SecretStore"("status");

ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SecretStore" ADD CONSTRAINT "SecretStore_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SecretStore" ADD CONSTRAINT "SecretStore_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "EncryptedField" ("id", "tableName", "columnName", "encryptionMethod", "updatedAt") VALUES
  ('ef-secret-store-value', 'SecretStore', 'secretValue', 'AES_256_GCM', NOW()),
  ('ef-user-email', 'User', 'email', 'HASHED', NOW()),
  ('ef-billing-payment-method', 'BillingInvoice', 'paymentMethod', 'AES_256_GCM', NOW()),
  ('ef-ai-message-content', 'AiMessage', 'content', 'AES_256_GCM', NOW()),
  ('ef-ai-output-content', 'AiGeneratedOutput', 'content', 'AES_256_GCM', NOW());
