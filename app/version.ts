import { readFile } from "fs/promises";

export const version = JSON.parse(await readFile("./package.json", "utf8")).version;