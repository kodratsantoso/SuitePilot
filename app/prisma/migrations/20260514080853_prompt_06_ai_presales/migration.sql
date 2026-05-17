-- CreateEnum
CREATE TYPE "EstimatedComplexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "ProposalSectionType" AS ENUM ('EXECUTIVE_SUMMARY', 'CHALLENGES', 'PROPOSED_SOLUTION', 'SCOPE', 'TIMELINE', 'ASSUMPTIONS', 'RISKS', 'DELIVERABLES', 'NEXT_STEPS');

-- CreateTable
CREATE TABLE "RequirementCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequirementCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementAnalysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "requirementId" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "evidence" JSONB,
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequirementAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainPointClassification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "painPointId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "rootCause" TEXT,
    "recommendation" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PainPointClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetsuiteModuleCatalog" (
    "id" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "dependencies" JSONB,
    "implementationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetsuiteModuleCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleRecommendationAnalysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "moduleName" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "impactedArea" TEXT,
    "implementationImpact" TEXT,
    "assumptions" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "evidence" JSONB,
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleRecommendationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScopeEstimation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "scopeSummary" TEXT NOT NULL,
    "implementationApproach" TEXT,
    "estimatedComplexity" "EstimatedComplexity" NOT NULL DEFAULT 'MEDIUM',
    "assumptions" TEXT,
    "exclusions" TEXT,
    "risks" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScopeEstimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalDraftSection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "generatedOutputId" TEXT NOT NULL,
    "sectionType" "ProposalSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalDraftSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequirementCategory_name_key" ON "RequirementCategory"("name");

-- CreateIndex
CREATE INDEX "RequirementAnalysis_organizationId_idx" ON "RequirementAnalysis"("organizationId");

-- CreateIndex
CREATE INDEX "RequirementAnalysis_projectId_idx" ON "RequirementAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "RequirementAnalysis_requirementId_idx" ON "RequirementAnalysis"("requirementId");

-- CreateIndex
CREATE INDEX "RequirementAnalysis_discoverySessionId_idx" ON "RequirementAnalysis"("discoverySessionId");

-- CreateIndex
CREATE INDEX "PainPointClassification_organizationId_idx" ON "PainPointClassification"("organizationId");

-- CreateIndex
CREATE INDEX "PainPointClassification_projectId_idx" ON "PainPointClassification"("projectId");

-- CreateIndex
CREATE INDEX "PainPointClassification_painPointId_idx" ON "PainPointClassification"("painPointId");

-- CreateIndex
CREATE UNIQUE INDEX "NetsuiteModuleCatalog_moduleName_key" ON "NetsuiteModuleCatalog"("moduleName");

-- CreateIndex
CREATE INDEX "ModuleRecommendationAnalysis_organizationId_idx" ON "ModuleRecommendationAnalysis"("organizationId");

-- CreateIndex
CREATE INDEX "ModuleRecommendationAnalysis_projectId_idx" ON "ModuleRecommendationAnalysis"("projectId");

-- CreateIndex
CREATE INDEX "ModuleRecommendationAnalysis_discoverySessionId_idx" ON "ModuleRecommendationAnalysis"("discoverySessionId");

-- CreateIndex
CREATE INDEX "ScopeEstimation_organizationId_idx" ON "ScopeEstimation"("organizationId");

-- CreateIndex
CREATE INDEX "ScopeEstimation_projectId_idx" ON "ScopeEstimation"("projectId");

-- CreateIndex
CREATE INDEX "ScopeEstimation_discoverySessionId_idx" ON "ScopeEstimation"("discoverySessionId");

-- CreateIndex
CREATE INDEX "ProposalDraftSection_organizationId_idx" ON "ProposalDraftSection"("organizationId");

-- CreateIndex
CREATE INDEX "ProposalDraftSection_projectId_idx" ON "ProposalDraftSection"("projectId");

-- CreateIndex
CREATE INDEX "ProposalDraftSection_generatedOutputId_idx" ON "ProposalDraftSection"("generatedOutputId");

-- CreateIndex
CREATE INDEX "ProposalDraftSection_sortOrder_idx" ON "ProposalDraftSection"("sortOrder");

-- AddForeignKey
ALTER TABLE "RequirementAnalysis" ADD CONSTRAINT "RequirementAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementAnalysis" ADD CONSTRAINT "RequirementAnalysis_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementAnalysis" ADD CONSTRAINT "RequirementAnalysis_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPointClassification" ADD CONSTRAINT "PainPointClassification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPointClassification" ADD CONSTRAINT "PainPointClassification_painPointId_fkey" FOREIGN KEY ("painPointId") REFERENCES "PainPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleRecommendationAnalysis" ADD CONSTRAINT "ModuleRecommendationAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleRecommendationAnalysis" ADD CONSTRAINT "ModuleRecommendationAnalysis_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeEstimation" ADD CONSTRAINT "ScopeEstimation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScopeEstimation" ADD CONSTRAINT "ScopeEstimation_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalDraftSection" ADD CONSTRAINT "ProposalDraftSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalDraftSection" ADD CONSTRAINT "ProposalDraftSection_generatedOutputId_fkey" FOREIGN KEY ("generatedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
