import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const database = new DatabaseSync(resolve("prisma/dev.db"));
const migration = readFileSync(resolve("prisma/migrations/20260725181000_community_foundation/migration.sql"), "utf8");
database.exec(migration);
database.close();
console.log("Community database migration applied.");
