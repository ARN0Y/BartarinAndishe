-- AlterTable
ALTER TABLE "Worksheet" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT false;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InteractiveCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "accessCode" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InteractiveCode" ("id", "slug", "title", "accessCode", "isVisible", "updatedAt")
SELECT "id", "slug", "title", "accessCode", false, "updatedAt" FROM "InteractiveCode";
DROP TABLE "InteractiveCode";
ALTER TABLE "new_InteractiveCode" RENAME TO "InteractiveCode";
CREATE UNIQUE INDEX "InteractiveCode_slug_key" ON "InteractiveCode"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
