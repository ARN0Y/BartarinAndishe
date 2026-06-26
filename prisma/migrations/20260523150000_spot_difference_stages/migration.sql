-- CreateTable SpotDifferenceStage
CREATE TABLE "SpotDifferenceStage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL DEFAULT '',
    "imageLeft" TEXT NOT NULL,
    "imageRight" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpotDifferenceStage_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "SpotDifferenceGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "SpotDifferenceStage_gameId_idx" ON "SpotDifferenceStage"("gameId");

-- Migrate existing games into stage 1
INSERT INTO "SpotDifferenceStage" ("gameId", "sortOrder", "title", "imageLeft", "imageRight", "updatedAt")
SELECT "id", 0, 'مرحله ۱', "imageLeft", "imageRight", CURRENT_TIMESTAMP
FROM "SpotDifferenceGame";

-- Rebuild SpotDifferenceSpot with stageId
CREATE TABLE "SpotDifferenceSpot_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stageId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "centerX" REAL NOT NULL,
    "centerY" REAL NOT NULL,
    "radius" REAL NOT NULL DEFAULT 0.07,
    CONSTRAINT "SpotDifferenceSpot_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "SpotDifferenceStage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "SpotDifferenceSpot_new" ("id", "stageId", "sortOrder", "centerX", "centerY", "radius")
SELECT s."id", st."id", s."sortOrder", s."centerX", s."centerY", s."radius"
FROM "SpotDifferenceSpot" s
JOIN "SpotDifferenceStage" st ON st."gameId" = s."gameId";

DROP TABLE "SpotDifferenceSpot";
ALTER TABLE "SpotDifferenceSpot_new" RENAME TO "SpotDifferenceSpot";
CREATE INDEX "SpotDifferenceSpot_stageId_idx" ON "SpotDifferenceSpot"("stageId");

-- Remove image columns from game
CREATE TABLE "SpotDifferenceGame_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "SpotDifferenceGame_new" ("id", "slug", "title", "description", "isVisible", "createdAt", "updatedAt")
SELECT "id", "slug", "title", "description", "isVisible", "createdAt", "updatedAt"
FROM "SpotDifferenceGame";

DROP TABLE "SpotDifferenceGame";
ALTER TABLE "SpotDifferenceGame_new" RENAME TO "SpotDifferenceGame";
CREATE UNIQUE INDEX "SpotDifferenceGame_slug_key" ON "SpotDifferenceGame"("slug");
