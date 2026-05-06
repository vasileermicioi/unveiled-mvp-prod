import { z } from "zod";

const jobsEnvSchema = z.object({
  RESEND_API_KEY: z.string().optional().default(""),
  DAILY_CODES_FROM_EMAIL: z.email().optional().default("codes@unveiled.berlin"),
});

export type JobsConfig = z.infer<typeof jobsEnvSchema>;

export function getJobsConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = jobsEnvSchema.safeParse(env);
  if (!parsed.success) {
    const invalid = parsed.error.issues
      .map((issue) => issue.path.join(".") || issue.message)
      .join(", ");
    throw new Error(`Jobs configuration is invalid: ${invalid}`);
  }

  return parsed.data;
}
