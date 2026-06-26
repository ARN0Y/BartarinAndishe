-- CreateTable
CREATE TABLE "SpotDifferenceGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageLeft" TEXT NOT NULL,
    "imageRight" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "SpotDifferenceSpot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "centerX" REAL NOT NULL,
    "centerY" REAL NOT NULL,
    "radius" REAL NOT NULL DEFAULT 0.07,
    CONSTRAINT "SpotDifferenceSpot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "SpotDifferenceGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SpotDifferenceGame_slug_key" ON "SpotDifferenceGame"("slug");
CREATE INDEX "SpotDifferenceSpot_gameId_idx" ON "SpotDifferenceSpot"("gameId");
