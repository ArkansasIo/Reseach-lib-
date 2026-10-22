import { startScheduler } from "./jobs/scheduler.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/mysql.js";

startScheduler();

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutting down");
  await pool.end();
  process.exit(0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
