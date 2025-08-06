-- CreateTable
CREATE TABLE "TestImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT NOT NULL,
    "style" TEXT,
    "subject" TEXT,
    "palette" TEXT,
    "complexity" TEXT,
    "testCategory" TEXT NOT NULL,
    "promptUsed" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "statedRoom" TEXT NOT NULL,
    "statedPalette" TEXT NOT NULL,
    "statedSize" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "shownLeftId" INTEGER NOT NULL,
    "shownRightId" INTEGER NOT NULL,
    "choice" TEXT NOT NULL,
    "choiceNumber" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Choice_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Choice_shownLeftId_fkey" FOREIGN KEY ("shownLeftId") REFERENCES "TestImage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Choice_shownRightId_fkey" FOREIGN KEY ("shownRightId") REFERENCES "TestImage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedArtwork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedArtwork_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "preferredStyle" TEXT NOT NULL,
    "preferredComplexity" REAL NOT NULL,
    "preferredSubjects" TEXT NOT NULL,
    "preferredPalette" TEXT NOT NULL,
    "explanationText" TEXT,
    "confidenceScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProfile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
