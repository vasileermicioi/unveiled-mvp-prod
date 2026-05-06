import { runDailyPartnerCodeJob } from "@/lib/jobs/daily-partner-codes";

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
    ctx.waitUntil(
      runDailyPartnerCodeJob({
        now: new Date(controller.scheduledTime),
        config: {
          RESEND_API_KEY: env.RESEND_API_KEY ?? "",
          DAILY_CODES_FROM_EMAIL:
            env.DAILY_CODES_FROM_EMAIL || "codes@unveiled.berlin",
        },
        logger: console,
      }),
    );
  },
};
