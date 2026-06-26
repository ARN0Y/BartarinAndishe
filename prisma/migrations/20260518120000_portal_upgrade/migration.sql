-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "nationalId" TEXT NOT NULL,
    "registrationStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Student" ("id", "firstName", "lastName", "nationalId", "registrationStatus", "createdAt", "updatedAt")
SELECT "id",
  CASE WHEN instr("name", ' ') > 0 THEN substr("name", 1, instr("name", ' ') - 1) ELSE "name" END,
  CASE WHEN instr("name", ' ') > 0 THEN substr("name", instr("name", ' ') + 1) ELSE '' END,
  "nationalId", "registrationStatus", "createdAt", "updatedAt"
FROM "Student";

DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_nationalId_key" ON "Student"("nationalId");

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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Payment" ("id", "studentId", "amountPaid", "paymentDate", "academicYear", "trackingId", "status", "createdAt")
SELECT "id", "studentId", "amountPaid", "paymentDate", "academicYear", "trackingId", "status", "createdAt"
FROM "Payment";

DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_trackingId_key" ON "Payment"("trackingId");
CREATE UNIQUE INDEX "Payment_zarinpalAuthority_key" ON "Payment"("zarinpalAuthority");
CREATE INDEX "Payment_studentId_academicYear_status_idx" ON "Payment"("studentId", "academicYear", "status");

CREATE TABLE "Worksheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
