"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
let prisma;
// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
    exports.prisma = prisma = getClient();
}
else {
    if (!global.__db__) {
        global.__db__ = getClient();
    }
    exports.prisma = prisma = global.__db__;
}
function getClient() {
    const { DATABASE_URL } = process.env;
    (0, tiny_invariant_1.default)(typeof DATABASE_URL === "string", "DATABASE_URL env var not set");
    const databaseUrl = new URL(DATABASE_URL);
    console.log(`🔌 setting up prisma client to ${databaseUrl.host}`);
    // NOTE: during development if you change anything in this function, remember
    // that this only runs once per server restart and won't automatically be
    // re-run per request like everything else is. So if you need to change
    // something in this file, you'll need to manually restart the server.
    const client = new client_1.PrismaClient({
        datasources: {
            db: {
                url: databaseUrl.toString(),
            },
        },
    });
    // connect eagerly
    // client.$connect();
    return client;
}
