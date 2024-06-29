-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kitty" INTEGER NOT NULL DEFAULT 0,
    "hide" BOOLEAN NOT NULL DEFAULT false,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "start_balance" INTEGER NOT NULL DEFAULT 100
);
INSERT INTO "new_Guild" ("hide", "id", "kitty", "restricted") SELECT "hide", "id", "kitty", "restricted" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
