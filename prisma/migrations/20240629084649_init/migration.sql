-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "session" TEXT
);

-- CreateTable
CREATE TABLE "Account" (
    "guildID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 1000,
    CONSTRAINT "Account_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitty" INTEGER NOT NULL DEFAULT 0,
    "hide" BOOLEAN NOT NULL DEFAULT false,
    "restricted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AdminUsers" (
    "guildID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    CONSTRAINT "AdminUsers_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminRoles" (
    "guildID" TEXT NOT NULL,
    "roleID" TEXT NOT NULL,
    CONSTRAINT "AdminRoles_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "authorID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "channelID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prediction_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PredictionOption" (
    "index" INTEGER NOT NULL,
    "predictionID" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL,
    CONSTRAINT "PredictionOption_predictionID_fkey" FOREIGN KEY ("predictionID") REFERENCES "Prediction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wager" (
    "predictionID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "choice" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "payout" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Wager_predictionID_fkey" FOREIGN KEY ("predictionID") REFERENCES "Prediction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Wager_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Wager_choice_predictionID_fkey" FOREIGN KEY ("choice", "predictionID") REFERENCES "PredictionOption" ("index", "predictionID") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_guildID_userID_key" ON "Account"("guildID", "userID");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUsers_guildID_userID_key" ON "AdminUsers"("guildID", "userID");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRoles_guildID_roleID_key" ON "AdminRoles"("guildID", "roleID");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionOption_index_predictionID_key" ON "PredictionOption"("index", "predictionID");

-- CreateIndex
CREATE UNIQUE INDEX "Wager_predictionID_userID_key" ON "Wager"("predictionID", "userID");
