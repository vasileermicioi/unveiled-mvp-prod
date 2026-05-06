import { runDailyPartnerCodeJob } from "@/lib/jobs/daily-partner-codes";

const result = await runDailyPartnerCodeJob({ logger: console });

console.log(JSON.stringify(result, null, 2));
