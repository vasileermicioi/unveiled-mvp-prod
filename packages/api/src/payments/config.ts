import { z } from "zod";

const paymentMethodSchema = z.enum(["card", "sepa_debit", "paypal"]);

const paymentsEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_PRICE_BASIC_BERLIN: z.string().min(1),
  STRIPE_BASIC_BERLIN_MONTHLY_CREDITS: z.coerce.number().int().positive(),
  STRIPE_ENABLED_PAYMENT_METHODS: z
    .string()
    .default("card,sepa_debit,paypal")
    .transform((value) =>
      value
        .split(",")
        .map((method) => method.trim())
        .filter(Boolean),
    )
    .pipe(z.array(paymentMethodSchema).min(1)),
  PAYMENTS_SUPPORT_EMAIL: z.string().email(),
  CHECKOUT_SUCCESS_URL: z.string().url(),
  CHECKOUT_CANCEL_URL: z.string().url(),
});

export type PaymentsConfig = z.infer<typeof paymentsEnvSchema>;
export type StripePaymentMethodName =
  PaymentsConfig["STRIPE_ENABLED_PAYMENT_METHODS"][number];

export const BASIC_BERLIN_PLAN = {
  code: "BASIC_BERLIN",
  label: "Basic Berlin",
  priceLabel: "29€/mo",
} as const;

export function getPaymentsConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = paymentsEnvSchema.safeParse(env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path.join(".") || issue.message)
      .join(", ");
    throw new Error(`Payments configuration is invalid: ${missing}`);
  }

  return parsed.data;
}

export function getPublicPaymentsConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    publishableKey: env.PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    expressCheckoutEnabled:
      env.PUBLIC_STRIPE_EXPRESS_CHECKOUT_ENABLED !== "false",
    paypalEnabled: env.PUBLIC_STRIPE_PAYPAL_ENABLED !== "false",
    sepaEnabled: env.PUBLIC_STRIPE_SEPA_ENABLED !== "false",
  };
}
