-- CreateTable
CREATE TABLE "AnnouncementRecipient" (
    "announcementId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    PRIMARY KEY ("announcementId", "studentId"),
    CONSTRAINT "AnnouncementRecipient_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnnouncementRecipient_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing private announcements
INSERT INTO "AnnouncementRecipient" ("announcementId", "studentId")
SELECT "id", "studentId" FROM "Announcement" WHERE "studentId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "AnnouncementRecipient_studentId_idx" ON "AnnouncementRecipient"("studentId");

-- DropIndex
DROP INDEX "Announcement_studentId_isActive_idx";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scope" TEXT NOT NULL DEFAULT 'public',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Announcement" ("id", "text", "isActive", "scope", "createdAt", "updatedAt")
SELECT "id", "text", "isActive", "scope", "createdAt", "updatedAt" FROM "Announcement";
DROP TABLE "Announcement";
ALTER TABLE "new_Announcement" RENAME TO "Announcement";
CREATE INDEX "Announcement_scope_isActive_idx" ON "Announcement"("scope", "isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
