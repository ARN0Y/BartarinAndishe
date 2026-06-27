-- Student multi-year support
ALTER TABLE "Student" ADD COLUMN "academicYear" TEXT NOT NULL DEFAULT '1405-1406';
ALTER TABLE "Student" ADD COLUMN "totalTuition" INTEGER;

DROP INDEX "Student_nationalId_key";
CREATE UNIQUE INDEX "Student_nationalId_academicYear_key" ON "Student"("nationalId", "academicYear");
CREATE INDEX "Student_academicYear_idx" ON "Student"("academicYear");

-- Pre-registration multi-year support
ALTER TABLE "PreRegistration" ADD COLUMN "academicYear" TEXT NOT NULL DEFAULT '1405-1406';
CREATE INDEX "PreRegistration_academicYear_idx" ON "PreRegistration"("academicYear");

-- Scheduled payment academic-year and check metadata
ALTER TABLE "PaymentSchedule" ADD COLUMN "academicYear" TEXT NOT NULL DEFAULT '1405-1406';
ALTER TABLE "PaymentSchedule" ADD COLUMN "checkNumber" TEXT;
ALTER TABLE "PaymentSchedule" ADD COLUMN "checkDate" TEXT;
ALTER TABLE "PaymentSchedule" ADD COLUMN "bankName" TEXT;
ALTER TABLE "PaymentSchedule" ADD COLUMN "bankBranch" TEXT;
ALTER TABLE "PaymentSchedule" ADD COLUMN "checkOwner" TEXT;
ALTER TABLE "PaymentSchedule" ADD COLUMN "sayadiNumber" TEXT;
CREATE INDEX "PaymentSchedule_academicYear_idx" ON "PaymentSchedule"("academicYear");

-- Manual payment academic-year and check metadata
ALTER TABLE "ManualPayment" ADD COLUMN "academicYear" TEXT NOT NULL DEFAULT '1405-1406';
ALTER TABLE "ManualPayment" ADD COLUMN "checkNumber" TEXT;
ALTER TABLE "ManualPayment" ADD COLUMN "checkDate" TEXT;
ALTER TABLE "ManualPayment" ADD COLUMN "bankName" TEXT;
ALTER TABLE "ManualPayment" ADD COLUMN "bankBranch" TEXT;
ALTER TABLE "ManualPayment" ADD COLUMN "checkOwner" TEXT;
ALTER TABLE "ManualPayment" ADD COLUMN "sayadiNumber" TEXT;
CREATE INDEX "ManualPayment_academicYear_idx" ON "ManualPayment"("academicYear");
