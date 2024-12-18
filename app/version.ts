import { readFileSync, statSync } from "fs";

export const version = readFileSync("./VERSION", "utf8");
export const commit  = readFileSync("./COMMIT", "utf8");
export const updated = statSync("./COMMIT").mtime;