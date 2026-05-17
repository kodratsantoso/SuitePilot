-- Prompt 12 — AI Continuous Improvement Layer
-- Migration: FeedbackEntry, OptimizationRecommendation, OptimizationScore

-- Enums
CREATE TYPE "FeedbackType" AS ENUM ('HUMAN_REVIEW', 'GOVERNANCE_FLAG', 'HYPERCARE_OUTCOME', 'TASK_OUTCOME', 'RISK_OBSERVED', 'AI_OUTPUT_PERFORMANCE');
CREATE TYPE "FeedbackSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "RecommendationType" AS ENUM ('PROCESS', 'AI_MODEL', 'WORKFLOW', 'RISK_MITIGATION');
CREATE TYPE "RecommendationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED', 'IMPLEMENTED', 'REJECTED');
CREATE TYPE "OptimizationMetricType" AS ENUM ('EFFICIENCY', 'ACCURACY', 'RISK_MITIGATION', 'AI_OUTPUT_QUALITY');

-- FeedbackEntry
CREATE TABLE "FeedbackEntry" (
    "id"                  TEXT NOT NULL,
    "organizationId"      TEXT NOT NULL,
    "projectId"           TEXT NOT NULL,
    "workstreamId"        TEXT,
    "aiGeneratedOutputId" TEXT,
    "feedbackType"        "FeedbackType" NOT NULL,
    "description"         TEXT NOT NULL,
    "severity"            "FeedbackSeverity" NOT NULL DEFAULT 'MEDIUM',
    "confidenceScore"     DOUBLE PRECISION,
    "createdBy"           TEXT NOT NULL,
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FeedbackEntry_organizationId_idx" ON "FeedbackEntry"("organizationId");
CREATE INDEX "FeedbackEntry_projectId_idx" ON "FeedbackEntry"("projectId");
CREATE INDEX "FeedbackEntry_feedbackType_idx" ON "FeedbackEntry"("feedbackType");
CREATE INDEX "FeedbackEntry_severity_idx" ON "FeedbackEntry"("severity");
CREATE INDEX "FeedbackEntry_createdAt_idx" ON "FeedbackEntry"("createdAt");

ALTER TABLE "FeedbackEntry" ADD CONSTRAINT "FeedbackEntry_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedbackEntry" ADD CONSTRAINT "FeedbackEntry_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeedbackEntry" ADD CONSTRAINT "FeedbackEntry_aiGeneratedOutputId_fkey"
    FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- OptimizationRecommendation
CREATE TABLE "OptimizationRecommendation" (
    "id"                 TEXT NOT NULL,
    "organizationId"     TEXT NOT NULL,
    "projectId"          TEXT NOT NULL,
    "workstreamId"       TEXT,
    "recommendationType" "RecommendationType" NOT NULL,
    "description"        TEXT NOT NULL,
    "confidenceScore"    DOUBLE PRECISION,
    "impactScore"        DOUBLE PRECISION,
    "status"             "RecommendationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy"          TEXT NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OptimizationRecommendation_organizationId_idx" ON "OptimizationRecommendation"("organizationId");
CREATE INDEX "OptimizationRecommendation_projectId_idx" ON "OptimizationRecommendation"("projectId");
CREATE INDEX "OptimizationRecommendation_recommendationType_idx" ON "OptimizationRecommendation"("recommendationType");
CREATE INDEX "OptimizationRecommendation_status_idx" ON "OptimizationRecommendation"("status");

ALTER TABLE "OptimizationRecommendation" ADD CONSTRAINT "OptimizationRecommendation_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OptimizationRecommendation" ADD CONSTRAINT "OptimizationRecommendation_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- OptimizationScore
CREATE TABLE "OptimizationScore" (
    "id"             TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId"      TEXT NOT NULL,
    "workstreamId"   TEXT,
    "metricType"     "OptimizationMetricType" NOT NULL,
    "score"          DOUBLE PRECISION NOT NULL,
    "ragStatus"      "RagStatus" NOT NULL,
    "calculatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptimizationScore_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OptimizationScore_organizationId_idx" ON "OptimizationScore"("organizationId");
CREATE INDEX "OptimizationScore_projectId_idx" ON "OptimizationScore"("projectId");
CREATE INDEX "OptimizationScore_metricType_idx" ON "OptimizationScore"("metricType");
CREATE INDEX "OptimizationScore_calculatedAt_idx" ON "OptimizationScore"("calculatedAt");

ALTER TABLE "OptimizationScore" ADD CONSTRAINT "OptimizationScore_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
