/*
  Warnings:

  - You are about to drop the column `durationLabel` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FREELANCER', 'CLIENT');

-- CreateEnum
CREATE TYPE "ScopeSize" AS ENUM ('LARGE', 'MEDIUM', 'SMALL');

-- CreateEnum
CREATE TYPE "ProjectTerm" AS ENUM ('LONG_TERM', 'SHORT_TERM');

-- CreateEnum
CREATE TYPE "JobDuration" AS ENUM ('MORE_THAN_6_MONTHS', 'THREE_TO_SIX_MONTHS', 'ONE_TO_THREE_MONTHS');

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "boostConnects" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "durationLabel",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "connectsRequired" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "contractToHire" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "duration" "JobDuration",
ADD COLUMN     "hourlyRateMax" INTEGER,
ADD COLUMN     "hourlyRateMin" INTEGER,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "projectTerm" "ProjectTerm",
ADD COLUMN     "scopeSize" "ScopeSize",
ALTER COLUMN "budget" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeRole" "Role" NOT NULL DEFAULT 'FREELANCER',
ADD COLUMN     "onlineForMessages" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedJob_userId_idx" ON "SavedJob"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "Bid_freelancerId_status_idx" ON "Bid"("freelancerId", "status");

-- CreateIndex
CREATE INDEX "Certification_userId_idx" ON "Certification"("userId");

-- CreateIndex
CREATE INDEX "ConnectTransaction_userId_idx" ON "ConnectTransaction"("userId");

-- CreateIndex
CREATE INDEX "Education_userId_idx" ON "Education"("userId");

-- CreateIndex
CREATE INDEX "Employment_userId_idx" ON "Employment"("userId");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_ownerId_idx" ON "Job"("ownerId");

-- CreateIndex
CREATE INDEX "Language_userId_idx" ON "Language"("userId");

-- CreateIndex
CREATE INDEX "License_userId_idx" ON "License"("userId");

-- CreateIndex
CREATE INDEX "LinkedAccount_userId_idx" ON "LinkedAccount"("userId");

-- CreateIndex
CREATE INDEX "OtherExperience_userId_idx" ON "OtherExperience"("userId");

-- CreateIndex
CREATE INDEX "PortfolioItem_userId_idx" ON "PortfolioItem"("userId");

-- CreateIndex
CREATE INDEX "Review_freelancerId_idx" ON "Review"("freelancerId");

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
