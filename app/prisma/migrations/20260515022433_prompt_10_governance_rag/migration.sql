-- CreateEnum
CREATE TYPE "GovernanceEventType" AS ENUM ('HALLUCINATION_DETECTED', 'VALIDATION_PASSED', 'VALIDATION_FAILED', 'REVIEW_SUBMITTED', 'QUALITY_SCORE_ASSIGNED');

-- CreateEnum
CREATE TYPE "ValidationType" AS ENUM ('SCHEMA_CHECK', 'DATA_CONSISTENCY', 'BUSINESS_RULE_CHECK');

-- CreateEnum
CREATE TYPE "ValidationResult" AS ENUM ('PASS', 'WARNING', 'FAIL');

-- CreateEnum
CREATE TYPE "ReviewGateStage" AS ENUM ('AI_SELF_VALIDATION', 'PEER_REVIEW', 'HUMAN_REVIEW', 'GOVERNANCE_APPROVAL');

-- CreateEnum
CREATE TYPE "ReviewGateStatusEnum" AS ENUM ('PENDING', 'PASSED', 'REJECTED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "RagStatus" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateTable
CREATE TABLE "GovernanceEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "aiGeneratedOutputId" TEXT NOT NULL,
    "agentName" TEXT,
    "skillName" TEXT,
    "eventType" "GovernanceEventType" NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "qualityScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "ragStatus" "RagStatus" NOT NULL DEFAULT 'AMBER',
    "reviewerId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutputValidation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "aiGeneratedOutputId" TEXT NOT NULL,
    "validationType" "ValidationType" NOT NULL,
    "result" "ValidationResult" NOT NULL DEFAULT 'PASS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutputValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewGateStatus" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "aiGeneratedOutputId" TEXT NOT NULL,
    "stage" "ReviewGateStage" NOT NULL,
    "status" "ReviewGateStatusEnum" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewGateStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GovernanceEvent_organizationId_idx" ON "GovernanceEvent"("organizationId");

-- CreateIndex
CREATE INDEX "GovernanceEvent_projectId_idx" ON "GovernanceEvent"("projectId");

-- CreateIndex
CREATE INDEX "GovernanceEvent_aiGeneratedOutputId_idx" ON "GovernanceEvent"("aiGeneratedOutputId");

-- CreateIndex
CREATE INDEX "GovernanceEvent_eventType_idx" ON "GovernanceEvent"("eventType");

-- CreateIndex
CREATE INDEX "GovernanceEvent_ragStatus_idx" ON "GovernanceEvent"("ragStatus");

-- CreateIndex
CREATE INDEX "GovernanceEvent_createdAt_idx" ON "GovernanceEvent"("createdAt");

-- CreateIndex
CREATE INDEX "OutputValidation_organizationId_idx" ON "OutputValidation"("organizationId");

-- CreateIndex
CREATE INDEX "OutputValidation_projectId_idx" ON "OutputValidation"("projectId");

-- CreateIndex
CREATE INDEX "OutputValidation_aiGeneratedOutputId_idx" ON "OutputValidation"("aiGeneratedOutputId");

-- CreateIndex
CREATE INDEX "OutputValidation_validationType_idx" ON "OutputValidation"("validationType");

-- CreateIndex
CREATE INDEX "OutputValidation_result_idx" ON "OutputValidation"("result");

-- CreateIndex
CREATE INDEX "ReviewGateStatus_organizationId_idx" ON "ReviewGateStatus"("organizationId");

-- CreateIndex
CREATE INDEX "ReviewGateStatus_projectId_idx" ON "ReviewGateStatus"("projectId");

-- CreateIndex
CREATE INDEX "ReviewGateStatus_aiGeneratedOutputId_idx" ON "ReviewGateStatus"("aiGeneratedOutputId");

-- CreateIndex
CREATE INDEX "ReviewGateStatus_stage_idx" ON "ReviewGateStatus"("stage");

-- CreateIndex
CREATE INDEX "ReviewGateStatus_status_idx" ON "ReviewGateStatus"("status");

-- AddForeignKey
ALTER TABLE "GovernanceEvent" ADD CONSTRAINT "GovernanceEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceEvent" ADD CONSTRAINT "GovernanceEvent_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceEvent" ADD CONSTRAINT "GovernanceEvent_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputValidation" ADD CONSTRAINT "OutputValidation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputValidation" ADD CONSTRAINT "OutputValidation_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewGateStatus" ADD CONSTRAINT "ReviewGateStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewGateStatus" ADD CONSTRAINT "ReviewGateStatus_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewGateStatus" ADD CONSTRAINT "ReviewGateStatus_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
