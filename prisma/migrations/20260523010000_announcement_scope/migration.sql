-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'public';
ALTER TABLE "Announcement" ADD COLUMN "studentId" INTEGER;

-- CreateIndex
CREATE INDEX "Announcement_scope_isActive_idx" ON "Announcement"("scope", "isActive");
CREATE INDEX "Announcement_studentId_isActive_idx" ON "Announcement"("studentId", "isActive");
