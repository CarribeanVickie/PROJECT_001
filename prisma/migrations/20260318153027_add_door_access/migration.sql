-- CreateTable
CREATE TABLE "DoorLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "zone" TEXT NOT NULL DEFAULT 'main',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DoorLocation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoorAccessCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardType" TEXT NOT NULL DEFAULT 'rfid',
    "status" TEXT NOT NULL DEFAULT 'active',
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DoorAccessCard_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoorAccessCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CardLocationAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cardId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    CONSTRAINT "CardLocationAccess_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "DoorAccessCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CardLocationAccess_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DoorLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "accessTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'allowed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccessLog_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "DoorAccessCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccessLog_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DoorLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DoorAccessCard_userId_key" ON "DoorAccessCard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoorAccessCard_cardNumber_key" ON "DoorAccessCard"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CardLocationAccess_cardId_locationId_key" ON "CardLocationAccess"("cardId", "locationId");
