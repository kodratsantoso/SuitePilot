-- CreateTable
CREATE TABLE "DashboardKpiSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "workstreamId" TEXT,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" TEXT,
    "metadata" JSONB,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardKpiSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardTrendHistory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardTrendHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardRagSummary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "greenCount" INTEGER NOT NULL DEFAULT 0,
    "amberCount" INTEGER NOT NULL DEFAULT 0,
    "redCount" INTEGER NOT NULL DEFAULT 0,
    "totalOutputs" INTEGER NOT NULL DEFAULT 0,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardRagSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardHypercareSummary" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "resolvedIssues" INTEGER NOT NULL DEFAULT 0,
    "criticalIssues" INTEGER NOT NULL DEFAULT 0,
    "goLiveCompletion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "pendingChangeRequests" INTEGER NOT NULL DEFAULT 0,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardHypercareSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardKpiSnapshot_organizationId_idx" ON "DashboardKpiSnapshot"("organizationId");

-- CreateIndex
CREATE INDEX "DashboardKpiSnapshot_projectId_idx" ON "DashboardKpiSnapshot"("projectId");

-- CreateIndex
CREATE INDEX "DashboardKpiSnapshot_metricName_idx" ON "DashboardKpiSnapshot"("metricName");

-- CreateIndex
CREATE INDEX "DashboardKpiSnapshot_snapshotAt_idx" ON "DashboardKpiSnapshot"("snapshotAt");

-- CreateIndex
CREATE INDEX "DashboardTrendHistory_organizationId_idx" ON "DashboardTrendHistory"("organizationId");

-- CreateIndex
CREATE INDEX "DashboardTrendHistory_projectId_idx" ON "DashboardTrendHistory"("projectId");

-- CreateIndex
CREATE INDEX "DashboardTrendHistory_metricName_idx" ON "DashboardTrendHistory"("metricName");

-- CreateIndex
CREATE INDEX "DashboardTrendHistory_period_idx" ON "DashboardTrendHistory"("period");

-- CreateIndex
CREATE INDEX "DashboardRagSummary_organizationId_idx" ON "DashboardRagSummary"("organizationId");

-- CreateIndex
CREATE INDEX "DashboardRagSummary_projectId_idx" ON "DashboardRagSummary"("projectId");

-- CreateIndex
CREATE INDEX "DashboardRagSummary_snapshotAt_idx" ON "DashboardRagSummary"("snapshotAt");

-- CreateIndex
CREATE INDEX "DashboardHypercareSummary_organizationId_idx" ON "DashboardHypercareSummary"("organizationId");

-- CreateIndex
CREATE INDEX "DashboardHypercareSummary_projectId_idx" ON "DashboardHypercareSummary"("projectId");

-- CreateIndex
CREATE INDEX "DashboardHypercareSummary_snapshotAt_idx" ON "DashboardHypercareSummary"("snapshotAt");
