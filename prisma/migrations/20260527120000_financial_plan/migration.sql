-- AlterTable
ALTER TABLE "TuitionContract" ADD COLUMN "smsConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StudentFinancialPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "readyForParent" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentFinancialPlan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractPaymentLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lineType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentDate" TEXT NOT NULL,
    "description" TEXT,
    "checkNumber" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "checkOwner" TEXT,
    "sayadiNumber" TEXT,
    "checkKind" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractPaymentLine_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudentFinancialPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContractCashPaymentDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "paymentDate" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractCashPaymentDate_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudentFinancialPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentFinancialPlan_studentId_key" ON "StudentFinancialPlan"("studentId");

-- CreateIndex
CREATE INDEX "ContractPaymentLine_planId_sortOrder_idx" ON "ContractPaymentLine"("planId", "sortOrder");

-- CreateIndex
CREATE INDEX "ContractCashPaymentDate_planId_sortOrder_idx" ON "ContractCashPaymentDate"("planId", "sortOrder");
