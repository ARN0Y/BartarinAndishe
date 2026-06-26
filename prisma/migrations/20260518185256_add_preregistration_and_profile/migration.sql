-- CreateTable
CREATE TABLE "PreRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "studentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "birthCertNumber" TEXT,
    "birthCertIssuePlace" TEXT,
    "birthDate" TEXT,
    "birthPlace" TEXT,
    "gender" TEXT,
    "idCardRow" TEXT,
    "idCardSeries" TEXT,
    "idCardSerial" TEXT,
    "fatherNationalId" TEXT,
    "fatherBirthDate" TEXT,
    "fatherNationality" TEXT,
    "fatherFirstName" TEXT,
    "fatherLastName" TEXT,
    "fatherPhone" TEXT,
    "fatherIdNumber" TEXT,
    "fatherIdIssuePlace" TEXT,
    "fatherEducation" TEXT,
    "fatherJob" TEXT,
    "motherNationalId" TEXT,
    "motherBirthDate" TEXT,
    "motherNationality" TEXT,
    "motherFirstName" TEXT,
    "motherLastName" TEXT,
    "motherPhone" TEXT,
    "motherIdNumber" TEXT,
    "motherIdIssuePlace" TEXT,
    "motherEducation" TEXT,
    "motherJob" TEXT,
    "housingStatus" TEXT,
    "leftHanded" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "homePhone" TEXT,
    "shadPhone" TEXT,
    "govPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PreRegistration_studentId_key" ON "PreRegistration"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");
