import { getJobsConfig } from "~/lib/jobs/config";
import { runDailyPartnerCodeJob } from "~/lib/jobs/daily-partner-codes";
import { createLogger, setService } from "~/lib/logger";

setService("unveiled-worker");

const workerLogger = createLogger({
  service: "unveiled-worker",
  level: "info",
  sampleRate: 1,
  context: {},
});

type ScheduledController = {
  cron: string;
  scheduledTime: number;
};

type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

export default {
  scheduled(
    controller: ScheduledController,
    env: Record<string, string>,
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(runScheduledPartnerCodeJob(controller, env));
  },
};

async function runScheduledPartnerCodeJob(
  controller: ScheduledController,
  env: Record<string, string>,
) {
  if (!env.DATABASE_URL) {
    workerLogger.warn("job_skipped", {
      jobName: "daily-partner-codes",
      status: "skipped",
      reason: "missing_database_url",
      scheduledTime: new Date(controller.scheduledTime).toISOString(),
    });
    return;
  }

  const result = await runDailyPartnerCodeJob({
    now: new Date(controller.scheduledTime),
    config: getJobsConfig(env),
    logger: workerLogger,
  });

  workerLogger.info("job_summary", {
    jobName: result.jobName,
    status: result.status,
    sent: result.sent,
    failed: result.failed,
    skipped: result.skipped,
    duplicates: result.duplicates,
    window: result.window,
    cron: controller.cron,
    scheduledTime: new Date(controller.scheduledTime).toISOString(),
  });
}
