import { readFileSync } from "fs";

export const version = readFileSync("./VERSION", "utf8");
export const commit = readFileSync("./COMMIT", "utf8");