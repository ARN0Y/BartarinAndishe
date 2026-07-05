-- CreateTable
CREATE TABLE "Excursion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "academicYear" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "costRial" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExcursionConsent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "excursionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "signerRole" TEXT,
    "parentSignatureUrl" TEXT,
    "consentAccepted" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" DATETIME,
    "phone" TEXT,
    "otpHash" TEXT,
    "otpExpiresAt" DATETIME,
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "phoneVerifiedAt" DATETIME,
    "amountRial" INTEGER,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Unpaid',
    "paymentTrackingId" TEXT,
    "zarinpalAuthority" TEXT,
    "zarinpalRefId" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExcursionConsent_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExcursionConsent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Excursion_academicYear_isActive_idx" ON "Excursion"("academicYear", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ExcursionConsent_paymentTrackingId_key" ON "ExcursionConsent"("paymentTrackingId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcursionConsent_zarinpalAuthority_key" ON "ExcursionConsent"("zarinpalAuthority");

-- CreateIndex
CREATE INDEX "ExcursionConsent_excursionId_idx" ON "ExcursionConsent"("excursionId");

-- CreateIndex
CREATE INDEX "ExcursionConsent_studentId_idx" ON "ExcursionConsent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcursionConsent_excursionId_studentId_key" ON "ExcursionConsent"("excursionId", "studentId");
