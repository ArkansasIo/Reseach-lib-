import cron from "node-cron";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { runResearchJob } from "./research-job.js";

let started = false;

export function startScheduler(): void {
  if (started) {
    logger.warn("Scheduler already started; ignoring duplicate start");
    return;
  }
  started = true;

  cron.schedule(env.CRON_RESEARCH, async () => {
    try {
      await runResearchJob();
    } catch (error) {
      logger.error({ error }, "Scheduled research job failed");
    }
  });

  cron.schedule(env.CRON_CLEANUP, async () => {
    logger.info("Cleanup schedule tick; configure retention policy before enabling destructive cleanup");
  });

  logger.info({ research: env.CRON_RESEARCH, cleanup: env.CRON_CLEANUP }, "Research scheduler started");
}
