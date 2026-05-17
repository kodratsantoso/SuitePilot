-- Roadmap foundation completion: document engine, agent registry, RAG, and evaluation

CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'ARCHIVED');
CREATE TYPE "EvaluationRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'NEEDS_REVIEW');

CREATE TABLE "AiAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "definitionPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiSkill" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "definitionPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiOutputVersion" (
    "id" TEXT NOT NULL,
    "aiGeneratedOutputId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiOutputVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" "AiOutputType" NOT NULL,
    "description" TEXT,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT,
    "aiGeneratedOutputId" TEXT,
    "title" TEXT NOT NULL,
    "documentType" "AiOutputType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentSection" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewComment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "ReviewComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "citationRef" TEXT,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RetrievalLog" (
    "id" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "usedInOutputId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RetrievalLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvaluationCase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "skillName" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL,
    "riskLevel" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EvaluationCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiEvaluationRun" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "evaluationCaseId" TEXT NOT NULL,
    "aiGeneratedOutputId" TEXT,
    "runBy" TEXT NOT NULL,
    "status" "EvaluationRunStatus" NOT NULL DEFAULT 'QUEUED',
    "score" DOUBLE PRECISION,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiEvaluationRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiAgent_name_key" ON "AiAgent"("name");
CREATE UNIQUE INDEX "AiSkill_name_key" ON "AiSkill"("name");
CREATE UNIQUE INDEX "AiOutputVersion_aiGeneratedOutputId_version_key" ON "AiOutputVersion"("aiGeneratedOutputId", "version");
CREATE UNIQUE INDEX "DocumentTemplate_name_documentType_key" ON "DocumentTemplate"("name", "documentType");
CREATE UNIQUE INDEX "DocumentVersion_documentId_version_key" ON "DocumentVersion"("documentId", "version");
CREATE UNIQUE INDEX "KnowledgeChunk_documentId_chunkIndex_key" ON "KnowledgeChunk"("documentId", "chunkIndex");

CREATE INDEX "AiAgent_role_idx" ON "AiAgent"("role");
CREATE INDEX "AiAgent_isActive_idx" ON "AiAgent"("isActive");
CREATE INDEX "AiSkill_agentId_idx" ON "AiSkill"("agentId");
CREATE INDEX "AiSkill_category_idx" ON "AiSkill"("category");
CREATE INDEX "AiSkill_isActive_idx" ON "AiSkill"("isActive");
CREATE INDEX "ProjectDocument_organizationId_idx" ON "ProjectDocument"("organizationId");
CREATE INDEX "ProjectDocument_projectId_idx" ON "ProjectDocument"("projectId");
CREATE INDEX "ProjectDocument_documentType_idx" ON "ProjectDocument"("documentType");
CREATE INDEX "ProjectDocument_status_idx" ON "ProjectDocument"("status");
CREATE INDEX "DocumentSection_documentId_idx" ON "DocumentSection"("documentId");
CREATE INDEX "ReviewComment_documentId_idx" ON "ReviewComment"("documentId");
CREATE INDEX "KnowledgeSource_organizationId_idx" ON "KnowledgeSource"("organizationId");
CREATE INDEX "KnowledgeSource_projectId_idx" ON "KnowledgeSource"("projectId");
CREATE INDEX "KnowledgeSource_status_idx" ON "KnowledgeSource"("status");
CREATE INDEX "KnowledgeDocument_sourceId_idx" ON "KnowledgeDocument"("sourceId");
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");
CREATE INDEX "RetrievalLog_chunkId_idx" ON "RetrievalLog"("chunkId");
CREATE INDEX "RetrievalLog_usedInOutputId_idx" ON "RetrievalLog"("usedInOutputId");
CREATE INDEX "EvaluationCase_organizationId_idx" ON "EvaluationCase"("organizationId");
CREATE INDEX "EvaluationCase_projectId_idx" ON "EvaluationCase"("projectId");
CREATE INDEX "EvaluationCase_skillName_idx" ON "EvaluationCase"("skillName");
CREATE INDEX "AiEvaluationRun_organizationId_idx" ON "AiEvaluationRun"("organizationId");
CREATE INDEX "AiEvaluationRun_projectId_idx" ON "AiEvaluationRun"("projectId");
CREATE INDEX "AiEvaluationRun_status_idx" ON "AiEvaluationRun"("status");

ALTER TABLE "AiSkill" ADD CONSTRAINT "AiSkill_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiOutputVersion" ADD CONSTRAINT "AiOutputVersion_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentSection" ADD CONSTRAINT "DocumentSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ProjectDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ProjectDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ProjectDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewComment" ADD CONSTRAINT "ReviewComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RetrievalLog" ADD CONSTRAINT "RetrievalLog_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "KnowledgeChunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvaluationCase" ADD CONSTRAINT "EvaluationCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEvaluationRun" ADD CONSTRAINT "AiEvaluationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEvaluationRun" ADD CONSTRAINT "AiEvaluationRun_evaluationCaseId_fkey" FOREIGN KEY ("evaluationCaseId") REFERENCES "EvaluationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEvaluationRun" ADD CONSTRAINT "AiEvaluationRun_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AiEvaluationRun" ADD CONSTRAINT "AiEvaluationRun_runBy_fkey" FOREIGN KEY ("runBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
