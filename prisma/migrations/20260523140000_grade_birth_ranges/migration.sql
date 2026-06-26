-- AlterTable
ALTER TABLE "PreRegistration" ADD COLUMN "gradeKey" TEXT;
ALTER TABLE "PreRegistration" ADD COLUMN "gradeLevel" TEXT;

-- CreateTable
CREATE TABLE "GradeBirthRange" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "academicYear" TEXT NOT NULL,
    "gradeKey" TEXT NOT NULL,
    "gradeLabel" TEXT NOT NULL,
    "birthFrom" TEXT NOT NULL,
    "birthTo" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GradeBirthRange_academicYear_gradeKey_key" ON "GradeBirthRange"("academicYear", "gradeKey");
CREATE INDEX "GradeBirthRange_academicYear_idx" ON "GradeBirthRange"("academicYear");
