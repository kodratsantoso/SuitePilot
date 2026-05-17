-- CreateEnum
CREATE TYPE "HypercareTaskStatus" AS ENUM ('BACKLOG', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'ESCALATED');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "GoLiveStatus" AS ENUM ('PENDING', 'COMPLETED', 'BLOCKED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('PROPOSED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "PostImplRiskStatus" AS ENUM ('OPEN', 'MONITORING', 'MITIGATED', 'CLOSED');

-- CreateTable
CREATE TABLE "HypercareTask" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT,
    "status" "HypercareTaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HypercareTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hypercareTaskId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoLiveReadiness" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "checklistItem" TEXT NOT NULL,
    "status" "GoLiveStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoLiveReadiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requestedBy" TEXT,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'PROPOSED',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImplementationRisk" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "status" "PostImplRiskStatus" NOT NULL DEFAULT 'OPEN',
    "mitigation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostImplementationRisk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HypercareTask_organizationId_idx" ON "HypercareTask"("organizationId");

-- CreateIndex
CREATE INDEX "HypercareTask_projectId_idx" ON "HypercareTask"("projectId");

-- CreateIndex
CREATE INDEX "HypercareTask_status_idx" ON "HypercareTask"("status");

-- CreateIndex
CREATE INDEX "HypercareTask_priority_idx" ON "HypercareTask"("priority");

-- CreateIndex
CREATE INDEX "Issue_organizationId_idx" ON "Issue"("organizationId");

-- CreateIndex
CREATE INDEX "Issue_projectId_idx" ON "Issue"("projectId");

-- CreateIndex
CREATE INDEX "Issue_hypercareTaskId_idx" ON "Issue"("hypercareTaskId");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_severity_idx" ON "Issue"("severity");

-- CreateIndex
CREATE INDEX "GoLiveReadiness_organizationId_idx" ON "GoLiveReadiness"("organizationId");

-- CreateIndex
CREATE INDEX "GoLiveReadiness_projectId_idx" ON "GoLiveReadiness"("projectId");

-- CreateIndex
CREATE INDEX "GoLiveReadiness_status_idx" ON "GoLiveReadiness"("status");

-- CreateIndex
CREATE INDEX "ChangeRequest_organizationId_idx" ON "ChangeRequest"("organizationId");

-- CreateIndex
CREATE INDEX "ChangeRequest_projectId_idx" ON "ChangeRequest"("projectId");

-- CreateIndex
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");

-- CreateIndex
CREATE INDEX "ChangeRequest_priority_idx" ON "ChangeRequest"("priority");

-- CreateIndex
CREATE INDEX "PostImplementationRisk_organizationId_idx" ON "PostImplementationRisk"("organizationId");

-- CreateIndex
CREATE INDEX "PostImplementationRisk_projectId_idx" ON "PostImplementationRisk"("projectId");

-- CreateIndex
CREATE INDEX "PostImplementationRisk_status_idx" ON "PostImplementationRisk"("status");

-- CreateIndex
CREATE INDEX "PostImplementationRisk_severity_idx" ON "PostImplementationRisk"("severity");

-- AddForeignKey
ALTER TABLE "HypercareTask" ADD CONSTRAINT "HypercareTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HypercareTask" ADD CONSTRAINT "HypercareTask_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_hypercareTaskId_fkey" FOREIGN KEY ("hypercareTaskId") REFERENCES "HypercareTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoLiveReadiness" ADD CONSTRAINT "GoLiveReadiness_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImplementationRisk" ADD CONSTRAINT "PostImplementationRisk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
