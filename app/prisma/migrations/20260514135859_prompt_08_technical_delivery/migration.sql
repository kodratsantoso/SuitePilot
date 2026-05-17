-- CreateEnum
CREATE TYPE "IntegrationMethod" AS ENUM ('REST', 'SOAP', 'FILE_BASED');

-- CreateEnum
CREATE TYPE "RestletMethod" AS ENUM ('GET', 'POST', 'PUT', 'DELETE');

-- CreateEnum
CREATE TYPE "PayloadType" AS ENUM ('REQUEST', 'RESPONSE');

-- CreateEnum
CREATE TYPE "TechnicalDeliverableType" AS ENUM ('INTEGRATION_MAPPING', 'RESTLET_DESIGN', 'API_CONTRACT', 'PAYLOAD_VALIDATION', 'DATA_MIGRATION_PLAN', 'SECURITY_PLAN');

-- CreateEnum
CREATE TYPE "TechnicalStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "TechnicalWorkstream" (
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

    CONSTRAINT "TechnicalWorkstream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationMapping" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceSystem" TEXT NOT NULL,
    "targetSystem" TEXT NOT NULL,
    "integrationMethod" "IntegrationMethod" NOT NULL DEFAULT 'REST',
    "dataFlowNotes" TEXT,
    "authMethod" TEXT,
    "frequencyNotes" TEXT,
    "assumptions" TEXT,
    "risks" TEXT,
    "status" "TechnicalStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestletDesign" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpointUrl" TEXT,
    "method" "RestletMethod" NOT NULL DEFAULT 'GET',
    "requestSchema" JSONB,
    "responseSchema" JSONB,
    "authenticationType" TEXT,
    "errorHandlingStrategy" TEXT,
    "notes" TEXT,
    "status" "TechnicalStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestletDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiContract" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" "RestletMethod" NOT NULL DEFAULT 'GET',
    "requestSchema" JSONB,
    "responseSchema" JSONB,
    "queryParams" JSONB,
    "headers" JSONB,
    "statusCodes" JSONB,
    "errorHandling" TEXT,
    "authRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" "TechnicalStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayloadValidation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payloadType" "PayloadType" NOT NULL DEFAULT 'REQUEST',
    "schema" JSONB,
    "validationRules" JSONB,
    "samplePayload" TEXT,
    "notes" TEXT,
    "status" "TechnicalStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayloadValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalDeliverable" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workstreamId" TEXT,
    "deliverableType" "TechnicalDeliverableType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TechnicalStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "reviewStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TechnicalWorkstream_organizationId_idx" ON "TechnicalWorkstream"("organizationId");

-- CreateIndex
CREATE INDEX "TechnicalWorkstream_projectId_idx" ON "TechnicalWorkstream"("projectId");

-- CreateIndex
CREATE INDEX "TechnicalWorkstream_status_idx" ON "TechnicalWorkstream"("status");

-- CreateIndex
CREATE INDEX "IntegrationMapping_organizationId_idx" ON "IntegrationMapping"("organizationId");

-- CreateIndex
CREATE INDEX "IntegrationMapping_projectId_idx" ON "IntegrationMapping"("projectId");

-- CreateIndex
CREATE INDEX "IntegrationMapping_integrationMethod_idx" ON "IntegrationMapping"("integrationMethod");

-- CreateIndex
CREATE INDEX "IntegrationMapping_status_idx" ON "IntegrationMapping"("status");

-- CreateIndex
CREATE INDEX "RestletDesign_organizationId_idx" ON "RestletDesign"("organizationId");

-- CreateIndex
CREATE INDEX "RestletDesign_projectId_idx" ON "RestletDesign"("projectId");

-- CreateIndex
CREATE INDEX "RestletDesign_method_idx" ON "RestletDesign"("method");

-- CreateIndex
CREATE INDEX "RestletDesign_status_idx" ON "RestletDesign"("status");

-- CreateIndex
CREATE INDEX "ApiContract_organizationId_idx" ON "ApiContract"("organizationId");

-- CreateIndex
CREATE INDEX "ApiContract_projectId_idx" ON "ApiContract"("projectId");

-- CreateIndex
CREATE INDEX "ApiContract_method_idx" ON "ApiContract"("method");

-- CreateIndex
CREATE INDEX "ApiContract_status_idx" ON "ApiContract"("status");

-- CreateIndex
CREATE INDEX "PayloadValidation_organizationId_idx" ON "PayloadValidation"("organizationId");

-- CreateIndex
CREATE INDEX "PayloadValidation_projectId_idx" ON "PayloadValidation"("projectId");

-- CreateIndex
CREATE INDEX "PayloadValidation_payloadType_idx" ON "PayloadValidation"("payloadType");

-- CreateIndex
CREATE INDEX "PayloadValidation_status_idx" ON "PayloadValidation"("status");

-- CreateIndex
CREATE INDEX "TechnicalDeliverable_organizationId_idx" ON "TechnicalDeliverable"("organizationId");

-- CreateIndex
CREATE INDEX "TechnicalDeliverable_projectId_idx" ON "TechnicalDeliverable"("projectId");

-- CreateIndex
CREATE INDEX "TechnicalDeliverable_workstreamId_idx" ON "TechnicalDeliverable"("workstreamId");

-- CreateIndex
CREATE INDEX "TechnicalDeliverable_deliverableType_idx" ON "TechnicalDeliverable"("deliverableType");

-- CreateIndex
CREATE INDEX "TechnicalDeliverable_status_idx" ON "TechnicalDeliverable"("status");

-- AddForeignKey
ALTER TABLE "TechnicalWorkstream" ADD CONSTRAINT "TechnicalWorkstream_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalWorkstream" ADD CONSTRAINT "TechnicalWorkstream_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationMapping" ADD CONSTRAINT "IntegrationMapping_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestletDesign" ADD CONSTRAINT "RestletDesign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiContract" ADD CONSTRAINT "ApiContract_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayloadValidation" ADD CONSTRAINT "PayloadValidation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalDeliverable" ADD CONSTRAINT "TechnicalDeliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalDeliverable" ADD CONSTRAINT "TechnicalDeliverable_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "TechnicalWorkstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
