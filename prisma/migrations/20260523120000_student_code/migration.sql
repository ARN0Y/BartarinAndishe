-- AlterTable
ALTER TABLE "Student" ADD COLUMN "studentCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_academicYear_key" ON "Student"("studentCode", "academicYear");
