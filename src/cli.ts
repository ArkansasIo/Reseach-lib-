import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./db/mysql.js";
import { logger } from "./config/logger.js";
import { runResearchJob } from "./jobs/research-job.js";
import { startScheduler } from "./jobs/scheduler.js";

async function migrate(): Promise<void> {
  const schemaPath = path.resolve("sql/001_schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
  logger.info("Database migration completed");
}

const command = process.argv[2];
try {
  switch (command) {
    case "research":
      await runResearchJob();
      await pool.end();
      break;
    case "jobs":
      startScheduler();
      process.once("SIGINT", () => void pool.end().then(() => process.exit(0)));
      process.once("SIGTERM", () => void pool.end().then(() => process.exit(0)));
      break;
    case "migrate":
      await migrate();
      await pool.end();
      break;
    default:
      console.log("Usage: npm run research | npm run jobs | npm run db:migrate");
      await pool.end();
      process.exitCode = 2;
  }
} catch (error) {
  logger.error({ error }, "Command failed");
  await pool.end();
  process.exitCode = 1;
}
