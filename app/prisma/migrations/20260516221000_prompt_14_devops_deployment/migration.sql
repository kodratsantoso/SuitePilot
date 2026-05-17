-- Prompt 14 — Deployment & DevOps Layer

CREATE TYPE "DeploymentEnvironmentType" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');
CREATE TYPE "DeploymentEnvironmentStatus" AS ENUM ('ACTIVE', 'DEGRADED', 'MAINTENANCE', 'OFFLINE');
CREATE TYPE "DeploymentServiceStatus" AS ENUM ('PENDING', 'BUILDING', 'DEPLOYING', 'RUNNING', 'DEGRADED', 'FAILED', 'ROLLING_BACK', 'STOPPED');
CREATE TYPE "DeploymentHealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN');
CREATE TYPE "DeploymentActionType" AS ENUM ('BUILD', 'TEST', 'DEPLOY', 'ROLLBACK', 'SCALE', 'SELF_HEAL');
CREATE TYPE "DeploymentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'ROLLED_BACK');
CREATE TYPE "ServiceMetricType" AS ENUM ('CPU_USAGE', 'MEMORY_USAGE', 'LATENCY_MS', 'ERROR_RATE', 'UPTIME_SECONDS');
CREATE TYPE "DeploymentAlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "DeploymentAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

CREATE TABLE "DeploymentEnvironment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "DeploymentEnvironmentType" NOT NULL,
    "status" "DeploymentEnvironmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "region" TEXT,
    "baseUrl" TEXT,
    "registryUrl" TEXT,
    "secretsRef" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeploymentEnvironment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeploymentService" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "image" TEXT,
    "imageTag" TEXT,
    "desiredReplicas" INTEGER NOT NULL DEFAULT 1,
    "currentReplicas" INTEGER NOT NULL DEFAULT 0,
    "status" "DeploymentServiceStatus" NOT NULL DEFAULT 'PENDING',
    "healthStatus" "DeploymentHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastDeployedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeploymentService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeploymentRun" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tenantId" TEXT,
    "environmentId" TEXT NOT NULL,
    "serviceId" TEXT,
    "actionType" "DeploymentActionType" NOT NULL,
    "status" "DeploymentRunStatus" NOT NULL DEFAULT 'QUEUED',
    "version" TEXT,
    "imageTag" TEXT,
    "commitSha" TEXT,
    "rollbackTargetRunId" TEXT,
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "logs" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "DeploymentRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServiceMetric" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "serviceId" TEXT,
    "tenantId" TEXT,
    "metricType" "ServiceMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeploymentAlert" (
    "id" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "serviceId" TEXT,
    "tenantId" TEXT,
    "severity" "DeploymentAlertSeverity" NOT NULL,
    "status" "DeploymentAlertStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DeploymentAlert_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeploymentEnvironment_slug_key" ON "DeploymentEnvironment"("slug");
CREATE INDEX "DeploymentEnvironment_type_idx" ON "DeploymentEnvironment"("type");
CREATE INDEX "DeploymentEnvironment_status_idx" ON "DeploymentEnvironment"("status");

CREATE UNIQUE INDEX "DeploymentService_environmentId_tenantId_name_key" ON "DeploymentService"("environmentId", "tenantId", "name");
CREATE INDEX "DeploymentService_environmentId_idx" ON "DeploymentService"("environmentId");
CREATE INDEX "DeploymentService_tenantId_idx" ON "DeploymentService"("tenantId");
CREATE INDEX "DeploymentService_status_idx" ON "DeploymentService"("status");
CREATE INDEX "DeploymentService_healthStatus_idx" ON "DeploymentService"("healthStatus");

CREATE INDEX "DeploymentRun_organizationId_idx" ON "DeploymentRun"("organizationId");
CREATE INDEX "DeploymentRun_tenantId_idx" ON "DeploymentRun"("tenantId");
CREATE INDEX "DeploymentRun_environmentId_idx" ON "DeploymentRun"("environmentId");
CREATE INDEX "DeploymentRun_serviceId_idx" ON "DeploymentRun"("serviceId");
CREATE INDEX "DeploymentRun_actionType_idx" ON "DeploymentRun"("actionType");
CREATE INDEX "DeploymentRun_status_idx" ON "DeploymentRun"("status");
CREATE INDEX "DeploymentRun_startedAt_idx" ON "DeploymentRun"("startedAt");

CREATE INDEX "ServiceMetric_environmentId_idx" ON "ServiceMetric"("environmentId");
CREATE INDEX "ServiceMetric_serviceId_idx" ON "ServiceMetric"("serviceId");
CREATE INDEX "ServiceMetric_tenantId_idx" ON "ServiceMetric"("tenantId");
CREATE INDEX "ServiceMetric_metricType_idx" ON "ServiceMetric"("metricType");
CREATE INDEX "ServiceMetric_measuredAt_idx" ON "ServiceMetric"("measuredAt");

CREATE INDEX "DeploymentAlert_environmentId_idx" ON "DeploymentAlert"("environmentId");
CREATE INDEX "DeploymentAlert_serviceId_idx" ON "DeploymentAlert"("serviceId");
CREATE INDEX "DeploymentAlert_tenantId_idx" ON "DeploymentAlert"("tenantId");
CREATE INDEX "DeploymentAlert_severity_idx" ON "DeploymentAlert"("severity");
CREATE INDEX "DeploymentAlert_status_idx" ON "DeploymentAlert"("status");

ALTER TABLE "DeploymentService" ADD CONSTRAINT "DeploymentService_environmentId_fkey"
  FOREIGN KEY ("environmentId") REFERENCES "DeploymentEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeploymentService" ADD CONSTRAINT "DeploymentService_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DeploymentRun" ADD CONSTRAINT "DeploymentRun_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeploymentRun" ADD CONSTRAINT "DeploymentRun_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeploymentRun" ADD CONSTRAINT "DeploymentRun_environmentId_fkey"
  FOREIGN KEY ("environmentId") REFERENCES "DeploymentEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeploymentRun" ADD CONSTRAINT "DeploymentRun_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "DeploymentService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeploymentRun" ADD CONSTRAINT "DeploymentRun_triggeredBy_fkey"
  FOREIGN KEY ("triggeredBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ServiceMetric" ADD CONSTRAINT "ServiceMetric_environmentId_fkey"
  FOREIGN KEY ("environmentId") REFERENCES "DeploymentEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceMetric" ADD CONSTRAINT "ServiceMetric_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "DeploymentService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceMetric" ADD CONSTRAINT "ServiceMetric_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DeploymentAlert" ADD CONSTRAINT "DeploymentAlert_environmentId_fkey"
  FOREIGN KEY ("environmentId") REFERENCES "DeploymentEnvironment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeploymentAlert" ADD CONSTRAINT "DeploymentAlert_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "DeploymentService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeploymentAlert" ADD CONSTRAINT "DeploymentAlert_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "DeploymentEnvironment" ("id", "name", "slug", "type", "status", "region", "baseUrl", "registryUrl", "secretsRef", "updatedAt")
VALUES
  ('env-development', 'Development', 'development', 'DEVELOPMENT', 'ACTIVE', 'local', 'http://localhost:5100', 'local/suitepilot', 'env/development', NOW()),
  ('env-staging', 'Staging', 'staging', 'STAGING', 'ACTIVE', 'ap-southeast-1', 'https://staging.suitepilot.example', 'ghcr.io/suitepilot', 'env/staging', NOW()),
  ('env-production', 'Production', 'production', 'PRODUCTION', 'ACTIVE', 'ap-southeast-1', 'https://suitepilot.example', 'ghcr.io/suitepilot', 'env/production', NOW());

INSERT INTO "DeploymentService" ("id", "environmentId", "name", "module", "image", "imageTag", "desiredReplicas", "currentReplicas", "status", "healthStatus", "lastCheckedAt", "updatedAt")
VALUES
  ('svc-dev-backend', 'env-development', 'backend', 'api', 'suitepilot/backend', 'local', 1, 1, 'RUNNING', 'HEALTHY', NOW(), NOW()),
  ('svc-dev-frontend', 'env-development', 'frontend', 'web', 'suitepilot/frontend', 'local', 1, 1, 'RUNNING', 'HEALTHY', NOW(), NOW()),
  ('svc-dev-postgres', 'env-development', 'postgres', 'database', 'postgres:15-alpine', '15-alpine', 1, 1, 'RUNNING', 'HEALTHY', NOW(), NOW()),
  ('svc-staging-backend', 'env-staging', 'backend', 'api', 'ghcr.io/suitepilot/backend', 'staging', 2, 2, 'RUNNING', 'HEALTHY', NOW(), NOW()),
  ('svc-staging-frontend', 'env-staging', 'frontend', 'web', 'ghcr.io/suitepilot/frontend', 'staging', 2, 2, 'RUNNING', 'HEALTHY', NOW(), NOW()),
  ('svc-prod-backend', 'env-production', 'backend', 'api', 'ghcr.io/suitepilot/backend', 'stable', 3, 3, 'RUNNING', 'HEALTHY', NOW(), NOW()),
  ('svc-prod-frontend', 'env-production', 'frontend', 'web', 'ghcr.io/suitepilot/frontend', 'stable', 3, 3, 'RUNNING', 'HEALTHY', NOW(), NOW());
