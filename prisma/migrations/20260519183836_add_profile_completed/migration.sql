-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "photoUrl" TEXT,
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
    "postalCode" TEXT,
    "shadPhone" TEXT,
    "govPhone" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentProfile" ("address", "birthCertIssuePlace", "birthCertNumber", "birthDate", "birthPlace", "createdAt", "fatherBirthDate", "fatherEducation", "fatherFirstName", "fatherIdIssuePlace", "fatherIdNumber", "fatherJob", "fatherLastName", "fatherNationalId", "fatherNationality", "fatherPhone", "gender", "govPhone", "homePhone", "housingStatus", "id", "idCardRow", "idCardSerial", "idCardSeries", "leftHanded", "motherBirthDate", "motherEducation", "motherFirstName", "motherIdIssuePlace", "motherIdNumber", "motherJob", "motherLastName", "motherNationalId", "motherNationality", "motherPhone", "photoUrl", "postalCode", "shadPhone", "studentId", "updatedAt") SELECT "address", "birthCertIssuePlace", "birthCertNumber", "birthDate", "birthPlace", "createdAt", "fatherBirthDate", "fatherEducation", "fatherFirstName", "fatherIdIssuePlace", "fatherIdNumber", "fatherJob", "fatherLastName", "fatherNationalId", "fatherNationality", "fatherPhone", "gender", "govPhone", "homePhone", "housingStatus", "id", "idCardRow", "idCardSerial", "idCardSeries", "leftHanded", "motherBirthDate", "motherEducation", "motherFirstName", "motherIdIssuePlace", "motherIdNumber", "motherJob", "motherLastName", "motherNationalId", "motherNationality", "motherPhone", "photoUrl", "postalCode", "shadPhone", "studentId", "updatedAt" FROM "StudentProfile";
DROP TABLE "StudentProfile";
ALTER TABLE "new_StudentProfile" RENAME TO "StudentProfile";
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
