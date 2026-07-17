-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FIXED', 'HOURLY');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'INTERMEDIATE', 'EXPERT');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "durationLabel" TEXT,
ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'ENTRY',
ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT,
ADD COLUMN     "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "totalSpent" INTEGER NOT NULL DEFAULT 0;
