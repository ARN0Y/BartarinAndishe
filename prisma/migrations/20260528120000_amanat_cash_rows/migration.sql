-- CreateTable
CREATE TABLE "ContractAmanatCashRow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "paymentDate" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContractAmanatCashRow_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ContractPaymentLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ContractAmanatCashRow_lineId_sortOrder_idx" ON "ContractAmanatCashRow"("lineId", "sortOrder");

-- DropTable
DROP TABLE "ContractCashPaymentDate";
