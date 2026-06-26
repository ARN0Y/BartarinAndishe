-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academicYear" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "zarinpalAuthority" TEXT,
    "zarinpalRefId" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("academicYear", "amountPaid", "createdAt", "description", "id", "paymentDate", "status", "studentId", "trackingId", "updatedAt", "zarinpalAuthority", "zarinpalRefId") SELECT "academicYear", "amountPaid", "createdAt", "description", "id", "paymentDate", "status", "studentId", "trackingId", "updatedAt", "zarinpalAuthority", "zarinpalRefId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_trackingId_key" ON "Payment"("trackingId");
CREATE UNIQUE INDEX "Payment_zarinpalAuthority_key" ON "Payment"("zarinpalAuthority");
CREATE INDEX "Payment_studentId_academicYear_status_idx" ON "Payment"("studentId", "academicYear", "status");
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "registrationStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Student" ("createdAt", "firstName", "id", "lastName", "nationalId", "registrationStatus", "updatedAt") SELECT "createdAt", "firstName", "id", "lastName", "nationalId", "registrationStatus", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_nationalId_key" ON "Student"("nationalId");
CREATE TABLE "new_Worksheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Worksheet" ("createdAt", "description", "fileName", "fileUrl", "id", "mimeType", "title", "updatedAt") SELECT "createdAt", "description", "fileName", "fileUrl", "id", "mimeType", "title", "updatedAt" FROM "Worksheet";
DROP TABLE "Worksheet";
ALTER TABLE "new_Worksheet" RENAME TO "Worksheet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Comment_approved_createdAt_idx" ON "Comment"("approved", "createdAt");
