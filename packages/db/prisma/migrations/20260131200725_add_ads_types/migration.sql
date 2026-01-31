/*
  Warnings:

  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AdProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdVideoPhaseStatus" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'PRONTO', 'ELENCO', 'PRE_PROD', 'EM_PRODUCAO', 'ENTREGUE', 'EM_REVISAO', 'VALIDANDO', 'APROVADO', 'NOMENCLATURA', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "AdVideoTema" AS ENUM ('GERAL', 'SONO', 'ANSIEDADE', 'DEPRESSAO', 'PESO', 'DISF', 'DORES', 'FOCO', 'PERFORM', 'PATOLOGIAS', 'TABACO');

-- CreateEnum
CREATE TYPE "AdVideoEstilo" AS ENUM ('UGC', 'EDUC', 'COMED', 'DEPOI', 'POV', 'STORY', 'MITOS', 'QA', 'ANTES', 'REVIEW', 'REACT', 'TREND', 'INST');

-- CreateEnum
CREATE TYPE "AdVideoFormato" AS ENUM ('VID', 'MOT', 'IMG', 'CRSEL');

-- CreateEnum
CREATE TYPE "AdDeliverableTempo" AS ENUM ('T15S', 'T30S', 'T45S', 'T60S', 'T90S', 'T120S', 'T180S');

-- CreateEnum
CREATE TYPE "AdDeliverableTamanho" AS ENUM ('S9X16', 'S1X1', 'S4X5', 'S16X9', 'S2X3');

-- CreateEnum
CREATE TYPE "AreaPosition" AS ENUM ('HEAD', 'COORDINATOR', 'STAFF');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "CreatorType" AS ENUM ('UGC_CREATOR', 'EMBAIXADOR', 'ATLETA', 'INFLUENCIADOR', 'ATOR_MODELO');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'WYSIWYG', 'FILE', 'DATE', 'DATETIME', 'SELECT', 'MULTI_SELECT', 'NUMBER', 'CHECKBOX', 'URL', 'IMAGE', 'REPEATER', 'AD_REFERENCE');

-- CreateEnum
CREATE TYPE "TagGroup" AS ENUM ('FILE', 'REQUEST');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Patologia" AS ENUM ('INSONIA', 'ANSIEDADE', 'DOR', 'ESTRESSE', 'INFLAMACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "RequestAction" AS ENUM ('CREATED', 'UPDATED', 'SUBMITTED', 'REVIEW_STARTED', 'APPROVED', 'REJECTED', 'CORRECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "ad_creative_media" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "adPrefix" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "linkedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_creative_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "adTypeId" TEXT NOT NULL,
    "originId" TEXT NOT NULL,
    "briefing" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "priority" "Priority",
    "currentPhase" INTEGER NOT NULL DEFAULT 1,
    "status" "AdProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_video" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nomeDescritivo" VARCHAR(25) NOT NULL,
    "tema" "AdVideoTema" NOT NULL,
    "estilo" "AdVideoEstilo" NOT NULL,
    "formato" "AdVideoFormato" NOT NULL,
    "roteiro" TEXT,
    "criadorId" TEXT,
    "storyboardUrl" TEXT,
    "localGravacao" TEXT,
    "dataGravacao" TIMESTAMP(3),
    "currentPhase" INTEGER NOT NULL DEFAULT 1,
    "phaseStatus" "AdVideoPhaseStatus" NOT NULL DEFAULT 'PENDENTE',
    "validacaoRoteiroCompliance" BOOLEAN NOT NULL DEFAULT false,
    "validacaoRoteiroMedico" BOOLEAN NOT NULL DEFAULT false,
    "aprovacaoElenco" BOOLEAN NOT NULL DEFAULT false,
    "aprovacaoPreProducao" BOOLEAN NOT NULL DEFAULT false,
    "revisaoConteudo" BOOLEAN NOT NULL DEFAULT false,
    "revisaoDesign" BOOLEAN NOT NULL DEFAULT false,
    "validacaoFinalCompliance" BOOLEAN NOT NULL DEFAULT false,
    "validacaoFinalMedico" BOOLEAN NOT NULL DEFAULT false,
    "aprovacaoFinal" BOOLEAN NOT NULL DEFAULT false,
    "linkAnuncio" TEXT,
    "rejectionReason" TEXT,
    "rejectedToPhase" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_deliverable" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "hookNumber" INTEGER NOT NULL,
    "adNumber" INTEGER,
    "fileId" TEXT NOT NULL,
    "tempo" "AdDeliverableTempo" NOT NULL,
    "tamanho" "AdDeliverableTamanho" NOT NULL,
    "mostraProduto" BOOLEAN NOT NULL DEFAULT false,
    "isPost" BOOLEAN NOT NULL DEFAULT false,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "descHook" TEXT,
    "nomenclaturaGerada" TEXT,
    "nomenclaturaEditada" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_counter" (
    "id" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 730,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "position" "AreaPosition" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "origin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "origin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "type" "CreatorType" NOT NULL,
    "responsibleId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "instagram" TEXT,
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "notes" TEXT,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_participation" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "participationDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "valuePaid" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_type_field" (
    "id" TEXT NOT NULL,
    "contentTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "placeholder" TEXT,
    "helpText" TEXT,
    "defaultValue" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedStepId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_type_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_field_value" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_field_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_value_versions" (
    "id" TEXT NOT NULL,
    "fieldValueId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB NOT NULL,
    "changedById" TEXT NOT NULL,
    "stepId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_value_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "uploadedById" TEXT NOT NULL,
    "creatorId" TEXT,
    "originId" TEXT,
    "folderId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'gray',
    "group" "TagGroup" NOT NULL DEFAULT 'FILE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_tag_on_file" (
    "fileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "file_tag_on_file_pkey" PRIMARY KEY ("fileId","tagId")
);

-- CreateTable
CREATE TABLE "request_file" (
    "requestId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_file_pkey" PRIMARY KEY ("requestId","fileId")
);

-- CreateTable
CREATE TABLE "request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentTypeId" TEXT NOT NULL,
    "originId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "patologia" "Patologia",
    "rejectionReason" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "currentStepId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_history" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" "RequestAction" NOT NULL,
    "changedById" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_step" (
    "id" TEXT NOT NULL,
    "contentTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "requiredFieldsToEnter" TEXT[],
    "requiredFieldsToExit" TEXT[],
    "approverAreaId" TEXT,
    "approverPositions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFinalStep" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_type_area_permission" (
    "id" TEXT NOT NULL,
    "contentTypeId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_type_area_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ad_creative_media_adId_key" ON "ad_creative_media"("adId");

-- CreateIndex
CREATE INDEX "ad_creative_media_adPrefix_idx" ON "ad_creative_media"("adPrefix");

-- CreateIndex
CREATE INDEX "ad_creative_media_fileId_idx" ON "ad_creative_media"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "ad_type_name_key" ON "ad_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ad_type_slug_key" ON "ad_type"("slug");

-- CreateIndex
CREATE INDEX "ad_project_adTypeId_idx" ON "ad_project"("adTypeId");

-- CreateIndex
CREATE INDEX "ad_project_originId_idx" ON "ad_project"("originId");

-- CreateIndex
CREATE INDEX "ad_project_createdById_idx" ON "ad_project"("createdById");

-- CreateIndex
CREATE INDEX "ad_project_status_idx" ON "ad_project"("status");

-- CreateIndex
CREATE INDEX "ad_project_currentPhase_idx" ON "ad_project"("currentPhase");

-- CreateIndex
CREATE INDEX "ad_video_projectId_idx" ON "ad_video"("projectId");

-- CreateIndex
CREATE INDEX "ad_video_criadorId_idx" ON "ad_video"("criadorId");

-- CreateIndex
CREATE INDEX "ad_video_currentPhase_idx" ON "ad_video"("currentPhase");

-- CreateIndex
CREATE INDEX "ad_video_phaseStatus_idx" ON "ad_video"("phaseStatus");

-- CreateIndex
CREATE INDEX "ad_deliverable_videoId_idx" ON "ad_deliverable"("videoId");

-- CreateIndex
CREATE INDEX "ad_deliverable_fileId_idx" ON "ad_deliverable"("fileId");

-- CreateIndex
CREATE INDEX "ad_deliverable_adNumber_idx" ON "ad_deliverable"("adNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ad_deliverable_videoId_hookNumber_key" ON "ad_deliverable"("videoId", "hookNumber");

-- CreateIndex
CREATE UNIQUE INDEX "area_name_key" ON "area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "area_slug_key" ON "area"("slug");

-- CreateIndex
CREATE INDEX "area_member_userId_idx" ON "area_member"("userId");

-- CreateIndex
CREATE INDEX "area_member_areaId_idx" ON "area_member"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "area_member_userId_areaId_key" ON "area_member"("userId", "areaId");

-- CreateIndex
CREATE INDEX "comment_requestId_idx" ON "comment"("requestId");

-- CreateIndex
CREATE INDEX "comment_userId_idx" ON "comment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "content_type_name_key" ON "content_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "content_type_slug_key" ON "content_type"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "origin_name_key" ON "origin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "origin_slug_key" ON "origin"("slug");

-- CreateIndex
CREATE INDEX "creator_responsibleId_idx" ON "creator"("responsibleId");

-- CreateIndex
CREATE INDEX "creator_type_idx" ON "creator"("type");

-- CreateIndex
CREATE INDEX "creator_isActive_idx" ON "creator"("isActive");

-- CreateIndex
CREATE INDEX "creator_participation_creatorId_idx" ON "creator_participation"("creatorId");

-- CreateIndex
CREATE INDEX "creator_participation_requestId_idx" ON "creator_participation"("requestId");

-- CreateIndex
CREATE INDEX "content_type_field_contentTypeId_idx" ON "content_type_field"("contentTypeId");

-- CreateIndex
CREATE INDEX "content_type_field_assignedStepId_idx" ON "content_type_field"("assignedStepId");

-- CreateIndex
CREATE UNIQUE INDEX "content_type_field_contentTypeId_name_key" ON "content_type_field"("contentTypeId", "name");

-- CreateIndex
CREATE INDEX "request_field_value_requestId_idx" ON "request_field_value"("requestId");

-- CreateIndex
CREATE INDEX "request_field_value_fieldId_idx" ON "request_field_value"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "request_field_value_requestId_fieldId_key" ON "request_field_value"("requestId", "fieldId");

-- CreateIndex
CREATE INDEX "field_value_versions_fieldValueId_idx" ON "field_value_versions"("fieldValueId");

-- CreateIndex
CREATE INDEX "field_value_versions_changedById_idx" ON "field_value_versions"("changedById");

-- CreateIndex
CREATE INDEX "file_folder_parentId_idx" ON "file_folder"("parentId");

-- CreateIndex
CREATE INDEX "file_folder_createdAt_idx" ON "file_folder"("createdAt");

-- CreateIndex
CREATE INDEX "file_uploadedById_idx" ON "file"("uploadedById");

-- CreateIndex
CREATE INDEX "file_creatorId_idx" ON "file"("creatorId");

-- CreateIndex
CREATE INDEX "file_originId_idx" ON "file"("originId");

-- CreateIndex
CREATE INDEX "file_folderId_idx" ON "file"("folderId");

-- CreateIndex
CREATE INDEX "file_mimeType_idx" ON "file"("mimeType");

-- CreateIndex
CREATE INDEX "file_isArchived_idx" ON "file"("isArchived");

-- CreateIndex
CREATE INDEX "file_createdAt_idx" ON "file"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "file_tag_name_key" ON "file_tag"("name");

-- CreateIndex
CREATE INDEX "file_tag_group_idx" ON "file_tag"("group");

-- CreateIndex
CREATE INDEX "file_tag_on_file_fileId_idx" ON "file_tag_on_file"("fileId");

-- CreateIndex
CREATE INDEX "file_tag_on_file_tagId_idx" ON "file_tag_on_file"("tagId");

-- CreateIndex
CREATE INDEX "request_file_requestId_idx" ON "request_file"("requestId");

-- CreateIndex
CREATE INDEX "request_file_fileId_idx" ON "request_file"("fileId");

-- CreateIndex
CREATE INDEX "request_contentTypeId_idx" ON "request"("contentTypeId");

-- CreateIndex
CREATE INDEX "request_originId_idx" ON "request"("originId");

-- CreateIndex
CREATE INDEX "request_createdById_idx" ON "request"("createdById");

-- CreateIndex
CREATE INDEX "request_reviewedById_idx" ON "request"("reviewedById");

-- CreateIndex
CREATE INDEX "request_currentStepId_idx" ON "request"("currentStepId");

-- CreateIndex
CREATE INDEX "request_status_idx" ON "request"("status");

-- CreateIndex
CREATE INDEX "request_history_requestId_idx" ON "request_history"("requestId");

-- CreateIndex
CREATE INDEX "request_history_changedById_idx" ON "request_history"("changedById");

-- CreateIndex
CREATE INDEX "workflow_step_contentTypeId_idx" ON "workflow_step"("contentTypeId");

-- CreateIndex
CREATE INDEX "workflow_step_order_idx" ON "workflow_step"("order");

-- CreateIndex
CREATE INDEX "workflow_step_approverAreaId_idx" ON "workflow_step"("approverAreaId");

-- CreateIndex
CREATE INDEX "content_type_area_permission_contentTypeId_idx" ON "content_type_area_permission"("contentTypeId");

-- CreateIndex
CREATE INDEX "content_type_area_permission_areaId_idx" ON "content_type_area_permission"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "content_type_area_permission_contentTypeId_areaId_key" ON "content_type_area_permission"("contentTypeId", "areaId");

-- AddForeignKey
ALTER TABLE "ad_creative_media" ADD CONSTRAINT "ad_creative_media_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_creative_media" ADD CONSTRAINT "ad_creative_media_linkedById_fkey" FOREIGN KEY ("linkedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_project" ADD CONSTRAINT "ad_project_adTypeId_fkey" FOREIGN KEY ("adTypeId") REFERENCES "ad_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_project" ADD CONSTRAINT "ad_project_originId_fkey" FOREIGN KEY ("originId") REFERENCES "origin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_project" ADD CONSTRAINT "ad_project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_video" ADD CONSTRAINT "ad_video_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ad_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_video" ADD CONSTRAINT "ad_video_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_deliverable" ADD CONSTRAINT "ad_deliverable_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "ad_video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_deliverable" ADD CONSTRAINT "ad_deliverable_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_member" ADD CONSTRAINT "area_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_member" ADD CONSTRAINT "area_member_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator" ADD CONSTRAINT "creator_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_participation" ADD CONSTRAINT "creator_participation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_participation" ADD CONSTRAINT "creator_participation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_type_field" ADD CONSTRAINT "content_type_field_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "content_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_type_field" ADD CONSTRAINT "content_type_field_assignedStepId_fkey" FOREIGN KEY ("assignedStepId") REFERENCES "workflow_step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_field_value" ADD CONSTRAINT "request_field_value_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_field_value" ADD CONSTRAINT "request_field_value_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "content_type_field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_value_versions" ADD CONSTRAINT "field_value_versions_fieldValueId_fkey" FOREIGN KEY ("fieldValueId") REFERENCES "request_field_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_value_versions" ADD CONSTRAINT "field_value_versions_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_folder" ADD CONSTRAINT "file_folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "file_folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_originId_fkey" FOREIGN KEY ("originId") REFERENCES "origin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "file_folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_tag_on_file" ADD CONSTRAINT "file_tag_on_file_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_tag_on_file" ADD CONSTRAINT "file_tag_on_file_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "file_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_file" ADD CONSTRAINT "request_file_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_file" ADD CONSTRAINT "request_file_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "content_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_originId_fkey" FOREIGN KEY ("originId") REFERENCES "origin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES "workflow_step"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_history" ADD CONSTRAINT "request_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step" ADD CONSTRAINT "workflow_step_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "content_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_step" ADD CONSTRAINT "workflow_step_approverAreaId_fkey" FOREIGN KEY ("approverAreaId") REFERENCES "area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_type_area_permission" ADD CONSTRAINT "content_type_area_permission_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "content_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_type_area_permission" ADD CONSTRAINT "content_type_area_permission_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
