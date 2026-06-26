-- CreateTable
CREATE TABLE "TuitionContract" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "signerRole" TEXT NOT NULL,
    "workshopConsent" BOOLEAN NOT NULL DEFAULT false,
    "contractAccepted" BOOLEAN NOT NULL DEFAULT false,
    "contractDate" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TuitionContract_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TuitionContract_studentId_key" ON "TuitionContract"("studentId");
