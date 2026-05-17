-- CreateEnum
CREATE TYPE "WorkstreamStatus" AS ENUM ('PLANNED', 'ACTIVE', 'BLOCKED', 'COMPLETED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "ProcessCategory" AS ENUM ('PROCURE_TO_PAY', 'ORDER_TO_CASH', 'RECORD_TO_REPORT', 'INVENTORY_MANAGEMENT', 'FIXED_ASSET', 'CRM', 'MANUFACTURING', 'APPROVAL_WORKFLOW', 'REPORTING', 'PROJECT_ACCOUNTING');

-- CreateEnum
CREATE TYPE "FitCategory" AS ENUM ('FIT_STANDARD', 'FIT_WITH_CONFIGURATION', 'FIT_WITH_WORKFLOW', 'FIT_WITH_CUSTOMIZATION', 'FIT_WITH_INTEGRATION', 'GAP', 'OUT_OF_SCOPE');

-- CreateEnum
CREATE TYPE "UatScenarioStatus" AS ENUM ('DRAFT', 'READY', 'IN_TESTING', 'PASSED', 'FAILED', 'RETEST_REQUIRED');

-- CreateEnum
CREATE TYPE "UatCategory" AS ENUM ('POSITIVE_TEST', 'NEGATIVE_TEST', 'APPROVAL_TEST', 'INTEGRATION_TEST', 'REGRESSION_TEST', 'SECURITY_TEST');

-- CreateEnum
CREATE TYPE "SopStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeliverableType" AS ENUM ('PROCESS_MAPPING', 'FIT_GAP_ANALYSIS', 'UAT', 'SOP', 'CONFIGURATION_WORKBOOK', 'TRAINING_MATERIAL', 'MIGRATION_TEMPLATE');

-- CreateEnum
CREATE TYPE "FunctionalDeliverableStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "FunctionalWorkstream" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT,
    "status" "WorkstreamStatus" NOT NULL DEFAULT 'PLANNED',
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionalWorkstream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProcess" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workstreamId" TEXT,
    "processName" TEXT NOT NULL,
    "processCategory" "ProcessCategory" NOT NULL,
    "currentState" TEXT,
    "futureState" TEXT,
    "impactedModules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL,
    "businessProcessId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "actor" TEXT,
    "systemAction" TEXT,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitGapAnalysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "fitCategory" "FitCategory" NOT NULL,
    "rationale" TEXT NOT NULL,
    "recommendation" TEXT,
    "implementationImpact" TEXT,
    "assumptions" TEXT,
    "risks" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitGapAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UatScenario" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workstreamId" TEXT,
    "title" TEXT NOT NULL,
    "category" "UatCategory" NOT NULL DEFAULT 'POSITIVE_TEST',
    "precondition" TEXT,
    "testSteps" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "affectedModule" TEXT,
    "businessObjective" TEXT,
    "status" "UatScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UatScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workstreamId" TEXT,
    "title" TEXT NOT NULL,
    "purpose" TEXT,
    "scope" TEXT,
    "responsibilities" TEXT,
    "processSteps" TEXT,
    "approvalFlow" TEXT,
    "exceptionHandling" TEXT,
    "status" "SopStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SopDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalDeliverable" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workstreamId" TEXT,
    "deliverableType" "DeliverableType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "FunctionalDeliverableStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "reviewStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FunctionalDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FunctionalWorkstream_organizationId_idx" ON "FunctionalWorkstream"("organizationId");

-- CreateIndex
CREATE INDEX "FunctionalWorkstream_projectId_idx" ON "FunctionalWorkstream"("projectId");

-- CreateIndex
CREATE INDEX "FunctionalWorkstream_status_idx" ON "FunctionalWorkstream"("status");

-- CreateIndex
CREATE INDEX "BusinessProcess_organizationId_idx" ON "BusinessProcess"("organizationId");

-- CreateIndex
CREATE INDEX "BusinessProcess_projectId_idx" ON "BusinessProcess"("projectId");

-- CreateIndex
CREATE INDEX "BusinessProcess_workstreamId_idx" ON "BusinessProcess"("workstreamId");

-- CreateIndex
CREATE INDEX "BusinessProcess_processCategory_idx" ON "BusinessProcess"("processCategory");

-- CreateIndex
CREATE INDEX "ProcessStep_businessProcessId_idx" ON "ProcessStep"("businessProcessId");

-- CreateIndex
CREATE INDEX "ProcessStep_stepOrder_idx" ON "ProcessStep"("stepOrder");

-- CreateIndex
CREATE INDEX "FitGapAnalysis_organizationId_idx" ON "FitGapAnalysis"("organizationId");

-- CreateIndex
CREATE INDEX "FitGapAnalysis_projectId_idx" ON "FitGapAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "FitGapAnalysis_requirementId_idx" ON "FitGapAnalysis"("requirementId");

-- CreateIndex
CREATE INDEX "FitGapAnalysis_fitCategory_idx" ON "FitGapAnalysis"("fitCategory");

-- CreateIndex
CREATE INDEX "UatScenario_organizationId_idx" ON "UatScenario"("organizationId");

-- CreateIndex
CREATE INDEX "UatScenario_projectId_idx" ON "UatScenario"("projectId");

-- CreateIndex
CREATE INDEX "UatScenario_workstreamId_idx" ON "UatScenario"("workstreamId");

-- CreateIndex
CREATE INDEX "UatScenario_status_idx" ON "UatScenario"("status");

-- CreateIndex
CREATE INDEX "UatScenario_category_idx" ON "UatScenario"("category");

-- CreateIndex
CREATE INDEX "SopDocument_organizationId_idx" ON "SopDocument"("organizationId");

-- CreateIndex
CREATE INDEX "SopDocument_projectId_idx" ON "SopDocument"("projectId");

-- CreateIndex
CREATE INDEX "SopDocument_workstreamId_idx" ON "SopDocument"("workstreamId");

-- CreateIndex
CREATE INDEX "SopDocument_status_idx" ON "SopDocument"("status");

-- CreateIndex
CREATE INDEX "FunctionalDeliverable_organizationId_idx" ON "FunctionalDeliverable"("organizationId");

-- CreateIndex
CREATE INDEX "FunctionalDeliverable_projectId_idx" ON "FunctionalDeliverable"("projectId");

-- CreateIndex
CREATE INDEX "FunctionalDeliverable_workstreamId_idx" ON "FunctionalDeliverable"("workstreamId");

-- CreateIndex
CREATE INDEX "FunctionalDeliverable_deliverableType_idx" ON "FunctionalDeliverable"("deliverableType");

-- CreateIndex
CREATE INDEX "FunctionalDeliverable_status_idx" ON "FunctionalDeliverable"("status");

-- AddForeignKey
ALTER TABLE "FunctionalWorkstream" ADD CONSTRAINT "FunctionalWorkstream_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalWorkstream" ADD CONSTRAINT "FunctionalWorkstream_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProcess" ADD CONSTRAINT "BusinessProcess_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProcess" ADD CONSTRAINT "BusinessProcess_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "FunctionalWorkstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_businessProcessId_fkey" FOREIGN KEY ("businessProcessId") REFERENCES "BusinessProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitGapAnalysis" ADD CONSTRAINT "FitGapAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitGapAnalysis" ADD CONSTRAINT "FitGapAnalysis_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UatScenario" ADD CONSTRAINT "UatScenario_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UatScenario" ADD CONSTRAINT "UatScenario_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "FunctionalWorkstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SopDocument" ADD CONSTRAINT "SopDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SopDocument" ADD CONSTRAINT "SopDocument_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "FunctionalWorkstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalDeliverable" ADD CONSTRAINT "FunctionalDeliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalDeliverable" ADD CONSTRAINT "FunctionalDeliverable_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "FunctionalWorkstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
