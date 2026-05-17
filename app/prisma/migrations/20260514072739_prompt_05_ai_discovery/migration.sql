-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'QUALIFIED', 'PROSPECT', 'CUSTOMER', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('NEW_IMPLEMENTATION', 'OPTIMIZATION', 'INTEGRATION', 'SUPPORT', 'UPGRADE', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PLANNED', 'ACTIVE', 'ON_HOLD', 'AT_RISK', 'DELAYED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectHealth" AS ENUM ('GREEN', 'AMBER', 'RED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProjectPhase" AS ENUM ('PRESALES', 'DISCOVERY', 'DESIGN', 'BUILD', 'UAT', 'CUTOVER', 'HYPERCARE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('PROJECT_MANAGER', 'FUNCTIONAL_CONSULTANT', 'TECHNICAL_CONSULTANT', 'SOLUTION_ARCHITECT', 'QA', 'DEVELOPER', 'STAKEHOLDER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RaidType" AS ENUM ('RISK', 'ASSUMPTION', 'ISSUE', 'DEPENDENCY', 'DECISION');

-- CreateEnum
CREATE TYPE "RaidStatus" AS ENUM ('OPEN', 'MONITORING', 'MITIGATED', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DiscoverySessionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('COMPANY_PROFILE', 'FINANCE', 'PROCUREMENT', 'INVENTORY', 'SALES', 'CRM', 'MANUFACTURING', 'REPORTING', 'INTEGRATION', 'COMPLIANCE', 'PAIN_POINT', 'GOVERNANCE', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "RequirementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RequirementSource" AS ENUM ('MANUAL', 'AI_EXTRACTED', 'MEETING', 'DOCUMENT', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "AssumptionStatus" AS ENUM ('OPEN', 'VALIDATED', 'INVALID', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "AiConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'LOCKED');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AiOutputType" AS ENUM ('DISCOVERY_SUMMARY', 'REQUIREMENT_ANALYSIS', 'PAIN_POINT_ANALYSIS', 'MODULE_RECOMMENDATION', 'SCOPE_DRAFT', 'PROPOSAL_DRAFT', 'BRD_DRAFT', 'FIT_GAP_DRAFT', 'RISK_SUMMARY', 'MEETING_SUMMARY');

-- CreateEnum
CREATE TYPE "AiOutputStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVISED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AiReviewStatus" AS ENUM ('APPROVED', 'REJECTED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'APPROVE', 'REJECT');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "companySize" TEXT,
    "country" TEXT,
    "website" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectType" "ProjectType" NOT NULL DEFAULT 'NEW_IMPLEMENTATION',
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "health" "ProjectHealth" NOT NULL DEFAULT 'UNKNOWN',
    "currentPhase" "ProjectPhase" NOT NULL DEFAULT 'PRESALES',
    "startDate" TIMESTAMP(3),
    "targetGoLiveDate" TIMESTAMP(3),
    "actualGoLiveDate" TIMESTAMP(3),
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "projectManagerId" TEXT,
    "functionalLeadId" TEXT,
    "technicalLeadId" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'STAKEHOLDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "ownerId" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "RaidType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RaidStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "Severity",
    "probability" "Severity",
    "impact" "Severity",
    "mitigation" TEXT,
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaidItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" "AuditAction" NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoverySession" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DiscoverySessionStatus" NOT NULL DEFAULT 'DRAFT',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoverySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryQuestion" (
    "id" TEXT NOT NULL,
    "discoverySessionId" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryAnswer" (
    "id" TEXT NOT NULL,
    "discoveryQuestionId" TEXT NOT NULL,
    "discoverySessionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "QuestionCategory",
    "priority" "RequirementPriority" NOT NULL DEFAULT 'MEDIUM',
    "source" "RequirementSource" NOT NULL DEFAULT 'MANUAL',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainPoint" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "impactedArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PainPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assumption" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "description" TEXT NOT NULL,
    "status" "AssumptionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryRisk" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "mitigation" TEXT,
    "status" "RaidStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoveryRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendedModule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "moduleName" TEXT NOT NULL,
    "rationale" TEXT,
    "implementationImpact" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendedModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "title" TEXT NOT NULL,
    "agentName" TEXT,
    "skillName" TEXT,
    "status" "AiConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokenUsage" INTEGER,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneratedOutput" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "discoverySessionId" TEXT,
    "conversationId" TEXT,
    "outputType" "AiOutputType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "AiOutputStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedByAgent" TEXT,
    "generatedBySkill" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGeneratedOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiReview" (
    "id" TEXT NOT NULL,
    "aiGeneratedOutputId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "AiReviewStatus" NOT NULL,
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_email_key" ON "User"("organizationId", "email");

-- CreateIndex
CREATE INDEX "Role_organizationId_idx" ON "Role"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_organizationId_name_key" ON "Role"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_customerId_idx" ON "Project"("customerId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_health_idx" ON "Project"("health");

-- CreateIndex
CREATE UNIQUE INDEX "Project_organizationId_projectCode_key" ON "Project"("organizationId", "projectCode");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectTask_projectId_idx" ON "ProjectTask"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTask_status_idx" ON "ProjectTask"("status");

-- CreateIndex
CREATE INDEX "ProjectTask_ownerId_idx" ON "ProjectTask"("ownerId");

-- CreateIndex
CREATE INDEX "ProjectTask_dueDate_idx" ON "ProjectTask"("dueDate");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMilestone_status_idx" ON "ProjectMilestone"("status");

-- CreateIndex
CREATE INDEX "ProjectMilestone_targetDate_idx" ON "ProjectMilestone"("targetDate");

-- CreateIndex
CREATE INDEX "RaidItem_projectId_idx" ON "RaidItem"("projectId");

-- CreateIndex
CREATE INDEX "RaidItem_type_idx" ON "RaidItem"("type");

-- CreateIndex
CREATE INDEX "RaidItem_status_idx" ON "RaidItem"("status");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_projectId_idx" ON "AuditLog"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "DiscoverySession_organizationId_idx" ON "DiscoverySession"("organizationId");

-- CreateIndex
CREATE INDEX "DiscoverySession_projectId_idx" ON "DiscoverySession"("projectId");

-- CreateIndex
CREATE INDEX "DiscoverySession_status_idx" ON "DiscoverySession"("status");

-- CreateIndex
CREATE INDEX "DiscoveryQuestion_discoverySessionId_idx" ON "DiscoveryQuestion"("discoverySessionId");

-- CreateIndex
CREATE INDEX "DiscoveryQuestion_category_idx" ON "DiscoveryQuestion"("category");

-- CreateIndex
CREATE INDEX "DiscoveryAnswer_discoverySessionId_idx" ON "DiscoveryAnswer"("discoverySessionId");

-- CreateIndex
CREATE INDEX "DiscoveryAnswer_discoveryQuestionId_idx" ON "DiscoveryAnswer"("discoveryQuestionId");

-- CreateIndex
CREATE INDEX "Requirement_organizationId_idx" ON "Requirement"("organizationId");

-- CreateIndex
CREATE INDEX "Requirement_projectId_idx" ON "Requirement"("projectId");

-- CreateIndex
CREATE INDEX "Requirement_discoverySessionId_idx" ON "Requirement"("discoverySessionId");

-- CreateIndex
CREATE INDEX "Requirement_priority_idx" ON "Requirement"("priority");

-- CreateIndex
CREATE INDEX "PainPoint_organizationId_idx" ON "PainPoint"("organizationId");

-- CreateIndex
CREATE INDEX "PainPoint_projectId_idx" ON "PainPoint"("projectId");

-- CreateIndex
CREATE INDEX "PainPoint_discoverySessionId_idx" ON "PainPoint"("discoverySessionId");

-- CreateIndex
CREATE INDEX "PainPoint_severity_idx" ON "PainPoint"("severity");

-- CreateIndex
CREATE INDEX "Assumption_organizationId_idx" ON "Assumption"("organizationId");

-- CreateIndex
CREATE INDEX "Assumption_projectId_idx" ON "Assumption"("projectId");

-- CreateIndex
CREATE INDEX "Assumption_discoverySessionId_idx" ON "Assumption"("discoverySessionId");

-- CreateIndex
CREATE INDEX "Assumption_status_idx" ON "Assumption"("status");

-- CreateIndex
CREATE INDEX "DiscoveryRisk_organizationId_idx" ON "DiscoveryRisk"("organizationId");

-- CreateIndex
CREATE INDEX "DiscoveryRisk_projectId_idx" ON "DiscoveryRisk"("projectId");

-- CreateIndex
CREATE INDEX "DiscoveryRisk_discoverySessionId_idx" ON "DiscoveryRisk"("discoverySessionId");

-- CreateIndex
CREATE INDEX "DiscoveryRisk_severity_idx" ON "DiscoveryRisk"("severity");

-- CreateIndex
CREATE INDEX "RecommendedModule_organizationId_idx" ON "RecommendedModule"("organizationId");

-- CreateIndex
CREATE INDEX "RecommendedModule_projectId_idx" ON "RecommendedModule"("projectId");

-- CreateIndex
CREATE INDEX "RecommendedModule_discoverySessionId_idx" ON "RecommendedModule"("discoverySessionId");

-- CreateIndex
CREATE INDEX "AiConversation_organizationId_idx" ON "AiConversation"("organizationId");

-- CreateIndex
CREATE INDEX "AiConversation_projectId_idx" ON "AiConversation"("projectId");

-- CreateIndex
CREATE INDEX "AiConversation_discoverySessionId_idx" ON "AiConversation"("discoverySessionId");

-- CreateIndex
CREATE INDEX "AiConversation_status_idx" ON "AiConversation"("status");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AiMessage_role_idx" ON "AiMessage"("role");

-- CreateIndex
CREATE INDEX "AiMessage_createdAt_idx" ON "AiMessage"("createdAt");

-- CreateIndex
CREATE INDEX "AiGeneratedOutput_organizationId_idx" ON "AiGeneratedOutput"("organizationId");

-- CreateIndex
CREATE INDEX "AiGeneratedOutput_projectId_idx" ON "AiGeneratedOutput"("projectId");

-- CreateIndex
CREATE INDEX "AiGeneratedOutput_discoverySessionId_idx" ON "AiGeneratedOutput"("discoverySessionId");

-- CreateIndex
CREATE INDEX "AiGeneratedOutput_conversationId_idx" ON "AiGeneratedOutput"("conversationId");

-- CreateIndex
CREATE INDEX "AiGeneratedOutput_outputType_idx" ON "AiGeneratedOutput"("outputType");

-- CreateIndex
CREATE INDEX "AiGeneratedOutput_status_idx" ON "AiGeneratedOutput"("status");

-- CreateIndex
CREATE INDEX "AiReview_aiGeneratedOutputId_idx" ON "AiReview"("aiGeneratedOutputId");

-- CreateIndex
CREATE INDEX "AiReview_reviewerId_idx" ON "AiReview"("reviewerId");

-- CreateIndex
CREATE INDEX "AiReview_status_idx" ON "AiReview"("status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_functionalLeadId_fkey" FOREIGN KEY ("functionalLeadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_technicalLeadId_fkey" FOREIGN KEY ("technicalLeadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidItem" ADD CONSTRAINT "RaidItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidItem" ADD CONSTRAINT "RaidItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidItem" ADD CONSTRAINT "RaidItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidItem" ADD CONSTRAINT "RaidItem_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoverySession" ADD CONSTRAINT "DiscoverySession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoverySession" ADD CONSTRAINT "DiscoverySession_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoverySession" ADD CONSTRAINT "DiscoverySession_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryQuestion" ADD CONSTRAINT "DiscoveryQuestion_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryAnswer" ADD CONSTRAINT "DiscoveryAnswer_discoveryQuestionId_fkey" FOREIGN KEY ("discoveryQuestionId") REFERENCES "DiscoveryQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryAnswer" ADD CONSTRAINT "DiscoveryAnswer_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryAnswer" ADD CONSTRAINT "DiscoveryAnswer_answeredBy_fkey" FOREIGN KEY ("answeredBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPoint" ADD CONSTRAINT "PainPoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPoint" ADD CONSTRAINT "PainPoint_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assumption" ADD CONSTRAINT "Assumption_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assumption" ADD CONSTRAINT "Assumption_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryRisk" ADD CONSTRAINT "DiscoveryRisk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryRisk" ADD CONSTRAINT "DiscoveryRisk_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedModule" ADD CONSTRAINT "RecommendedModule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedModule" ADD CONSTRAINT "RecommendedModule_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedOutput" ADD CONSTRAINT "AiGeneratedOutput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedOutput" ADD CONSTRAINT "AiGeneratedOutput_discoverySessionId_fkey" FOREIGN KEY ("discoverySessionId") REFERENCES "DiscoverySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedOutput" ADD CONSTRAINT "AiGeneratedOutput_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedOutput" ADD CONSTRAINT "AiGeneratedOutput_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiReview" ADD CONSTRAINT "AiReview_aiGeneratedOutputId_fkey" FOREIGN KEY ("aiGeneratedOutputId") REFERENCES "AiGeneratedOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiReview" ADD CONSTRAINT "AiReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
