-- Prompt 13 — SaaS Multi-Tenant Management Layer
-- Models: SubscriptionPlan, Tenant, TenantUsage, BillingInvoice, TenantRole, TenantUserRole

-- Enums
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL');
CREATE TYPE "UsageMetricType" AS ENUM ('AI_OUTPUT_COUNT', 'API_USAGE', 'STORAGE_USED', 'ACTIVE_USERS');
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'VOID');

-- SubscriptionPlan
CREATE TABLE "SubscriptionPlan" (
    "id"            TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "features"      JSONB NOT NULL DEFAULT '[]',
    "pricePerMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pricePerYear"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUsers"      INTEGER NOT NULL DEFAULT 5,
    "maxProjects"   INTEGER NOT NULL DEFAULT 10,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- Tenant
CREATE TABLE "Tenant" (
    "id"                 TEXT NOT NULL,
    "organizationId"     TEXT NOT NULL,
    "name"               TEXT NOT NULL,
    "domain"             TEXT,
    "status"             "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscriptionPlanId" TEXT,
    "trialEndsAt"        TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_organizationId_key" ON "Tenant"("organizationId");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");
CREATE INDEX "Tenant_subscriptionPlanId_idx" ON "Tenant"("subscriptionPlanId");

ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_subscriptionPlanId_fkey"
    FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- TenantUsage
CREATE TABLE "TenantUsage" (
    "id"          TEXT NOT NULL,
    "tenantId"    TEXT NOT NULL,
    "metricType"  "UsageMetricType" NOT NULL,
    "value"       DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd"   TIMESTAMP(3) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TenantUsage_tenantId_idx" ON "TenantUsage"("tenantId");
CREATE INDEX "TenantUsage_metricType_idx" ON "TenantUsage"("metricType");
CREATE INDEX "TenantUsage_periodStart_idx" ON "TenantUsage"("periodStart");

ALTER TABLE "TenantUsage" ADD CONSTRAINT "TenantUsage_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BillingInvoice
CREATE TABLE "BillingInvoice" (
    "id"                 TEXT NOT NULL,
    "tenantId"           TEXT NOT NULL,
    "subscriptionPlanId" TEXT,
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd"   TIMESTAMP(3) NOT NULL,
    "amount"             DOUBLE PRECISION NOT NULL,
    "status"             "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod"      TEXT,
    "notes"              TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BillingInvoice_tenantId_idx" ON "BillingInvoice"("tenantId");
CREATE INDEX "BillingInvoice_status_idx" ON "BillingInvoice"("status");
CREATE INDEX "BillingInvoice_billingPeriodStart_idx" ON "BillingInvoice"("billingPeriodStart");

ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_subscriptionPlanId_fkey"
    FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- TenantRole
CREATE TABLE "TenantRole" (
    "id"          TEXT NOT NULL,
    "tenantId"    TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantRole_tenantId_name_key" ON "TenantRole"("tenantId", "name");
CREATE INDEX "TenantRole_tenantId_idx" ON "TenantRole"("tenantId");

ALTER TABLE "TenantRole" ADD CONSTRAINT "TenantRole_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TenantUserRole
CREATE TABLE "TenantUserRole" (
    "id"        TEXT NOT NULL,
    "tenantId"  TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "roleId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUserRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantUserRole_tenantId_userId_roleId_key" ON "TenantUserRole"("tenantId", "userId", "roleId");
CREATE INDEX "TenantUserRole_tenantId_idx" ON "TenantUserRole"("tenantId");
CREATE INDEX "TenantUserRole_userId_idx" ON "TenantUserRole"("userId");

ALTER TABLE "TenantUserRole" ADD CONSTRAINT "TenantUserRole_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantUserRole" ADD CONSTRAINT "TenantUserRole_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantUserRole" ADD CONSTRAINT "TenantUserRole_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "TenantRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: Default subscription plans
INSERT INTO "SubscriptionPlan" ("id","name","features","pricePerMonth","pricePerYear","maxUsers","maxProjects","isActive","updatedAt") VALUES
  ('plan-starter',  'Starter',      '["discovery","presales"]',                               49,  490,  3,   5,  true, NOW()),
  ('plan-growth',   'Growth',       '["discovery","presales","functional","technical"]',       149, 1490, 10,  25, true, NOW()),
  ('plan-scale',    'Scale',        '["discovery","presales","functional","technical","hypercare","governance"]', 349, 3490, 25, 100, true, NOW()),
  ('plan-enterprise','Enterprise',  '["all"]',                                                 0,   0,    999, 999, true, NOW());
