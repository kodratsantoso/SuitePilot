-- Prompt 17 — Global Admin & Superuser Console

CREATE TYPE "SuperuserActionType" AS ENUM ('TenantActivation', 'SubscriptionOverride', 'UserRoleChange', 'DeploymentTrigger');
CREATE TYPE "GlobalMetricType" AS ENUM ('CrossTenantKPI', 'AIOutputQuality', 'RAGDistribution', 'UsageSummary');

CREATE TABLE "SuperuserActionLog" (
    "id" TEXT NOT NULL,
    "superuserId" TEXT NOT NULL,
    "actionType" "SuperuserActionType" NOT NULL,
    "targetTenantId" TEXT,
    "targetProjectId" TEXT,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperuserActionLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GlobalAnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "metricType" "GlobalMetricType" NOT NULL,
    "value" JSONB NOT NULL,
    "tenantId" TEXT,
    "projectId" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SuperuserActionLog_superuserId_idx" ON "SuperuserActionLog"("superuserId");
CREATE INDEX "SuperuserActionLog_actionType_idx" ON "SuperuserActionLog"("actionType");
CREATE INDEX "SuperuserActionLog_targetTenantId_idx" ON "SuperuserActionLog"("targetTenantId");
CREATE INDEX "SuperuserActionLog_targetProjectId_idx" ON "SuperuserActionLog"("targetProjectId");
CREATE INDEX "SuperuserActionLog_timestamp_idx" ON "SuperuserActionLog"("timestamp");

CREATE INDEX "GlobalAnalyticsSnapshot_metricType_idx" ON "GlobalAnalyticsSnapshot"("metricType");
CREATE INDEX "GlobalAnalyticsSnapshot_tenantId_idx" ON "GlobalAnalyticsSnapshot"("tenantId");
CREATE INDEX "GlobalAnalyticsSnapshot_projectId_idx" ON "GlobalAnalyticsSnapshot"("projectId");
CREATE INDEX "GlobalAnalyticsSnapshot_snapshotDate_idx" ON "GlobalAnalyticsSnapshot"("snapshotDate");

ALTER TABLE "SuperuserActionLog" ADD CONSTRAINT "SuperuserActionLog_superuserId_fkey" FOREIGN KEY ("superuserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SuperuserActionLog" ADD CONSTRAINT "SuperuserActionLog_targetTenantId_fkey" FOREIGN KEY ("targetTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SuperuserActionLog" ADD CONSTRAINT "SuperuserActionLog_targetProjectId_fkey" FOREIGN KEY ("targetProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GlobalAnalyticsSnapshot" ADD CONSTRAINT "GlobalAnalyticsSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GlobalAnalyticsSnapshot" ADD CONSTRAINT "GlobalAnalyticsSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
