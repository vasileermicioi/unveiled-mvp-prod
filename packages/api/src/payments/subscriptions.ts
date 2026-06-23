import { type Db, db } from "@unveiled/api/db/client";
import {
  billingAddresses,
  creditLedgerEntries,
  paymentMethods,
  providerEvents,
  subscriptions,
  userProfiles,
} from "@unveiled/api/db/schema";
import {
  BASIC_BERLIN_PLAN,
  getPaymentsConfig,
  type StripePaymentMethodName,
} from "@unveiled/api/payments/config";
import { getStripe } from "@unveiled/api/payments/stripe-client";
import { and, eq, sql } from "drizzle-orm";
import type Stripe from "stripe";

export type LocalSubscriptionStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "INCOMPLETE"
  | "ACTION_REQUIRED"
  | "PAST_DUE"
  | "UNPAID"
  | "CANCELLED_PENDING"
  | "ADMIN_FROZEN";

export type CheckoutInitializationInput = {
  userId: string;
  email: string;
  name?: string | null;
  promoCode?: string | null;
};

export type CheckoutInitializationResult = {
  provider: "STRIPE";
  planCode: typeof BASIC_BERLIN_PLAN.code;
  planLabel: typeof BASIC_BERLIN_PLAN.label;
  priceLabel: typeof BASIC_BERLIN_PLAN.priceLabel;
  publishableKey: string;
  customerId: string;
  subscriptionId: string;
  clientSecret?: string;
  enabledPaymentMethods: StripePaymentMethodName[];
  supportEmail: string;
};

function newId() {
  return crypto.randomUUID();
}

function dateFromUnix(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

export function deriveSubscriptionStatus(
  providerStatus: string | null | undefined,
  adminFrozen = false,
): LocalSubscriptionStatus {
  if (adminFrozen) return "ADMIN_FROZEN";

  switch (providerStatus) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "unpaid":
      return "UNPAID";
    case "canceled":
      return "INACTIVE";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INACTIVE";
    case "paused":
      return "INACTIVE";
    default:
      return "ACTION_REQUIRED";
  }
}

export function isBookingAvailableForStatus(status: string | null | undefined) {
  return status === "ACTIVE";
}

export function calculateNoRolloverRefill(
  currentCredits: number,
  monthlyAllowance: number,
) {
  return Math.max(0, monthlyAllowance - currentCredits);
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  const raw = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    parent?: {
      subscription_details?: {
        subscription?: string | Stripe.Subscription | null;
      };
    };
  };
  const subscription =
    raw.subscription ?? raw.parent?.subscription_details?.subscription;
  if (!subscription) return null;
  return typeof subscription === "string" ? subscription : subscription.id;
}

function subscriptionCurrentPeriod(subscription: Stripe.Subscription) {
  const raw = subscription as Stripe.Subscription & {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };

  return {
    start: dateFromUnix(raw.current_period_start),
    end: dateFromUnix(raw.current_period_end),
  };
}

function subscriptionDefaultPaymentMethodId(subscription: Stripe.Subscription) {
  const method = subscription.default_payment_method;
  if (!method) return null;
  return typeof method === "string" ? method : method.id;
}

function subscriptionCustomerId(subscription: Stripe.Subscription) {
  const customer = subscription.customer;
  return typeof customer === "string" ? customer : customer.id;
}

function invoiceCustomerId(invoice: Stripe.Invoice) {
  const customer = invoice.customer;
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

function invoiceContainsPrice(invoice: Stripe.Invoice, priceId: string) {
  return invoice.lines.data.some(
    (line) => line.pricing?.price_details?.price === priceId,
  );
}

async function findUserIdForProviderRefs(
  input: { customerId?: string | null; subscriptionId?: string | null },
  database: Db,
) {
  if (input.subscriptionId) {
    const existing = await database.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.provider, "STRIPE"),
        eq(subscriptions.providerSubscriptionId, input.subscriptionId),
      ),
    });
    if (existing) return existing.userId;
  }

  if (input.customerId) {
    const profile = await database.query.userProfiles.findFirst({
      where: eq(userProfiles.stripeCustomerId, input.customerId),
    });
    if (profile) return profile.userId;
  }

  return null;
}

async function syncCustomerBillingAddress(
  input: { userId: string; customer: Stripe.Customer },
  database: Db,
) {
  const address = input.customer.address;
  if (!address && !input.customer.name) return;

  await database
    .insert(billingAddresses)
    .values({
      id: newId(),
      userId: input.userId,
      provider: "STRIPE",
      providerCustomerId: input.customer.id,
      name: input.customer.name ?? null,
      country: address?.country ?? null,
      postalCode: address?.postal_code ?? null,
      city: address?.city ?? null,
      line1: address?.line1 ?? null,
      line2: address?.line2 ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [billingAddresses.provider, billingAddresses.providerCustomerId],
      set: {
        name: input.customer.name ?? null,
        country: address?.country ?? null,
        postalCode: address?.postal_code ?? null,
        city: address?.city ?? null,
        line1: address?.line1 ?? null,
        line2: address?.line2 ?? null,
        updatedAt: new Date(),
      },
    });
}

export async function syncPaymentMethodDisplay(
  input: {
    userId: string;
    subscriptionId?: string | null;
    paymentMethod: Stripe.PaymentMethod;
  },
  database: Db = db,
) {
  const card = input.paymentMethod.card;
  const sepa = input.paymentMethod.sepa_debit;
  const type =
    input.paymentMethod.type === "sepa_debit"
      ? "SEPA"
      : input.paymentMethod.type === "paypal"
        ? "PAYPAL"
        : "CARD";
  const last4 = card?.last4 ?? sepa?.last4 ?? null;
  const brand = card?.brand ?? null;
  const displayLabel =
    type === "PAYPAL"
      ? "PayPal"
      : type === "SEPA"
        ? `SEPA${last4 ? ` ending ${last4}` : ""}`
        : `${brand ?? "Card"}${last4 ? ` ending ${last4}` : ""}`;

  const localSubscription = input.subscriptionId
    ? await database.query.subscriptions.findFirst({
        where: eq(subscriptions.providerSubscriptionId, input.subscriptionId),
      })
    : null;

  await database
    .insert(paymentMethods)
    .values({
      id: newId(),
      userId: input.userId,
      subscriptionId: localSubscription?.id ?? null,
      provider: "STRIPE",
      providerPaymentMethodId: input.paymentMethod.id,
      type,
      brand,
      last4,
      expMonth: card?.exp_month ?? null,
      expYear: card?.exp_year ?? null,
      bankName: sepa?.bank_code ?? null,
      walletType: card?.wallet?.type ?? null,
      displayLabel,
      isDefault: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [paymentMethods.provider, paymentMethods.providerPaymentMethodId],
      set: {
        subscriptionId: localSubscription?.id ?? null,
        type,
        brand,
        last4,
        expMonth: card?.exp_month ?? null,
        expYear: card?.exp_year ?? null,
        bankName: sepa?.bank_code ?? null,
        walletType: card?.wallet?.type ?? null,
        displayLabel,
        isDefault: true,
        updatedAt: new Date(),
      },
    });
}

export async function syncSubscription(
  stripeSubscription: Stripe.Subscription,
  database: Db = db,
) {
  const customerId = subscriptionCustomerId(stripeSubscription);
  const userId =
    stripeSubscription.metadata.userId ??
    (await findUserIdForProviderRefs(
      { customerId, subscriptionId: stripeSubscription.id },
      database,
    ));
  if (!userId) return null;

  const period = subscriptionCurrentPeriod(stripeSubscription);
  const status = deriveSubscriptionStatus(stripeSubscription.status);
  const priceId =
    stripeSubscription.items.data[0]?.price.id ??
    getPaymentsConfig().STRIPE_PRICE_BASIC_BERLIN;
  const defaultPaymentMethodId =
    subscriptionDefaultPaymentMethodId(stripeSubscription);

  const [localSubscription] = await database
    .insert(subscriptions)
    .values({
      id: newId(),
      userId,
      provider: "STRIPE",
      providerCustomerId: customerId,
      providerSubscriptionId: stripeSubscription.id,
      providerPriceId: priceId,
      planCode: stripeSubscription.metadata.planCode ?? BASIC_BERLIN_PLAN.code,
      status,
      providerStatus: stripeSubscription.status,
      billingEmail: stripeSubscription.metadata.billingEmail ?? null,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAt: dateFromUnix(stripeSubscription.cancel_at),
      canceledAt: dateFromUnix(stripeSubscription.canceled_at),
      defaultPaymentMethodId,
      metadata: stripeSubscription.metadata,
      lastProviderSyncAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [subscriptions.provider, subscriptions.providerSubscriptionId],
      set: {
        userId,
        providerCustomerId: customerId,
        providerPriceId: priceId,
        planCode:
          stripeSubscription.metadata.planCode ?? BASIC_BERLIN_PLAN.code,
        status,
        providerStatus: stripeSubscription.status,
        billingEmail: stripeSubscription.metadata.billingEmail ?? null,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        cancelAt: dateFromUnix(stripeSubscription.cancel_at),
        canceledAt: dateFromUnix(stripeSubscription.canceled_at),
        defaultPaymentMethodId,
        metadata: stripeSubscription.metadata,
        lastProviderSyncAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();

  await database
    .update(userProfiles)
    .set({
      subscriptionStatus: status,
      subscriptionPlan: BASIC_BERLIN_PLAN.code,
      subscriptionPeriodEnd: period.end,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));

  if (defaultPaymentMethodId) {
    const method = await getStripe().paymentMethods.retrieve(
      defaultPaymentMethodId,
    );
    await syncPaymentMethodDisplay(
      {
        userId,
        subscriptionId: stripeSubscription.id,
        paymentMethod: method,
      },
      database,
    );
  }

  return localSubscription;
}

export async function initializeBasicBerlinCheckout(
  input: CheckoutInitializationInput,
): Promise<CheckoutInitializationResult> {
  const config = getPaymentsConfig();
  const stripe = getStripe();
  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, input.userId),
  });
  const customerId = existingProfile?.stripeCustomerId;
  const customer = customerId
    ? await stripe.customers.update(customerId, {
        email: input.email,
        name: input.name ?? undefined,
        metadata: { userId: input.userId },
      })
    : await stripe.customers.create({
        email: input.email,
        name: input.name ?? undefined,
        metadata: { userId: input.userId },
      });

  await db
    .update(userProfiles)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(userProfiles.userId, input.userId));

  await syncCustomerBillingAddress({ userId: input.userId, customer }, db);

  const discounts = input.promoCode?.trim()
    ? await stripe.promotionCodes
        .list({ code: input.promoCode.trim(), active: true, limit: 1 })
        .then((result) =>
          result.data[0] ? [{ promotion_code: result.data[0].id }] : [],
        )
    : [];

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: config.STRIPE_PRICE_BASIC_BERLIN }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      payment_method_types: config.STRIPE_ENABLED_PAYMENT_METHODS,
      save_default_payment_method: "on_subscription",
    },
    metadata: {
      userId: input.userId,
      planCode: BASIC_BERLIN_PLAN.code,
      billingEmail: input.email,
    },
    discounts,
    expand: ["latest_invoice.payment_intent"],
  } as Stripe.SubscriptionCreateParams);

  await syncSubscription(subscription);

  const latestInvoice = subscription.latest_invoice as
    | (Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | null })
    | null;
  const paymentIntent = latestInvoice?.payment_intent;

  return {
    provider: "STRIPE",
    planCode: BASIC_BERLIN_PLAN.code,
    planLabel: BASIC_BERLIN_PLAN.label,
    priceLabel: BASIC_BERLIN_PLAN.priceLabel,
    publishableKey: config.PUBLIC_STRIPE_PUBLISHABLE_KEY,
    customerId: customer.id,
    subscriptionId: subscription.id,
    clientSecret:
      typeof paymentIntent === "object"
        ? (paymentIntent?.client_secret ?? undefined)
        : undefined,
    enabledPaymentMethods: config.STRIPE_ENABLED_PAYMENT_METHODS,
    supportEmail: config.PAYMENTS_SUPPORT_EMAIL,
  };
}

export async function applyInvoicePaidRefill(
  input: { invoice: Stripe.Invoice; eventId?: string },
  database: Db = db,
) {
  const config = getPaymentsConfig();
  if (!invoiceContainsPrice(input.invoice, config.STRIPE_PRICE_BASIC_BERLIN)) {
    return { state: "ignored" as const, reason: "invoice_price_mismatch" };
  }

  const providerSubscriptionId = invoiceSubscriptionId(input.invoice);
  const providerCustomerId = invoiceCustomerId(input.invoice);
  const userId = await findUserIdForProviderRefs(
    { customerId: providerCustomerId, subscriptionId: providerSubscriptionId },
    database,
  );
  if (!userId || !providerSubscriptionId) {
    return { state: "ignored" as const, reason: "member_not_found" };
  }

  const refillIdempotencyKey = `stripe:invoice:${input.invoice.id}:credit_refill`;

  return database.transaction(async (tx) => {
    await tx.execute(
      sql`select user_id from ${userProfiles} where user_id = ${userId} for update`,
    );

    const profile = await tx.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });
    if (!profile) {
      return { state: "ignored" as const, reason: "profile_not_found" };
    }

    const existing = await tx.query.creditLedgerEntries.findFirst({
      where: eq(creditLedgerEntries.refillIdempotencyKey, refillIdempotencyKey),
    });
    if (existing) {
      return { state: "duplicate" as const, ledgerEntryId: existing.id };
    }

    const amount = calculateNoRolloverRefill(
      profile.credits,
      config.STRIPE_BASIC_BERLIN_MONTHLY_CREDITS,
    );
    const balanceAfter = profile.credits + amount;

    await tx
      .update(userProfiles)
      .set({
        credits: balanceAfter,
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: BASIC_BERLIN_PLAN.code,
        subscriptionPeriodEnd: dateFromUnix(
          input.invoice.lines.data[0]?.period?.end,
        ),
        stripeCustomerId: providerCustomerId,
        stripeSubscriptionId: providerSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    await tx.insert(creditLedgerEntries).values({
      id: newId(),
      userId,
      amount,
      balanceAfter,
      type: "SUBSCRIPTION_REFILL",
      description: `${BASIC_BERLIN_PLAN.label} monthly credit refill`,
      idempotencyKey: refillIdempotencyKey,
      provider: "STRIPE",
      providerInvoiceId: input.invoice.id,
      providerSubscriptionId,
      providerEventId: input.eventId ?? null,
      refillIdempotencyKey,
    });

    await tx
      .update(subscriptions)
      .set({
        status: "ACTIVE",
        providerStatus: "active",
        lastInvoiceId: input.invoice.id,
        currentPeriodEnd: dateFromUnix(
          input.invoice.lines.data[0]?.period?.end,
        ),
        lastProviderSyncAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.providerSubscriptionId, providerSubscriptionId));

    return { state: "refilled" as const, amount, balanceAfter };
  });
}

export async function markSubscriptionFrozenFromProvider(
  input: {
    customerId?: string | null;
    subscriptionId?: string | null;
    providerStatus: string;
  },
  database: Db = db,
) {
  const userId = await findUserIdForProviderRefs(input, database);
  if (!userId) return { state: "ignored" as const };
  const status = deriveSubscriptionStatus(input.providerStatus);

  await database
    .update(userProfiles)
    .set({ subscriptionStatus: status, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId));

  if (input.subscriptionId) {
    await database
      .update(subscriptions)
      .set({
        status,
        providerStatus: input.providerStatus,
        lastProviderSyncAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.providerSubscriptionId, input.subscriptionId));
  }

  return { state: "frozen" as const, userId, status };
}

export async function recordProviderEvent(event: Stripe.Event, database: Db) {
  const [inserted] = await database
    .insert(providerEvents)
    .values({
      id: newId(),
      provider: "STRIPE",
      providerEventId: event.id,
      eventType: event.type,
      providerCreatedAt: dateFromUnix(event.created),
      processingStatus: "received",
      payload: event as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  return inserted ?? null;
}

export async function processStripeEvent(
  event: Stripe.Event,
  database: Db = db,
) {
  const receipt = await recordProviderEvent(event, database);
  if (!receipt) return { state: "duplicate" as const };

  try {
    switch (event.type) {
      case "invoice.paid": {
        const result = await applyInvoicePaidRefill(
          { invoice: event.data.object as Stripe.Invoice, eventId: event.id },
          database,
        );
        await database
          .update(providerEvents)
          .set({ processingStatus: "processed", processedAt: new Date() })
          .where(eq(providerEvents.id, receipt.id));
        return result;
      }
      case "invoice.payment_failed":
      case "invoice.payment_action_required": {
        const invoice = event.data.object as Stripe.Invoice;
        const result = await markSubscriptionFrozenFromProvider(
          {
            customerId: invoiceCustomerId(invoice),
            subscriptionId: invoiceSubscriptionId(invoice),
            providerStatus:
              event.type === "invoice.payment_action_required"
                ? "incomplete"
                : "past_due",
          },
          database,
        );
        await database
          .update(providerEvents)
          .set({ processingStatus: "processed", processedAt: new Date() })
          .where(eq(providerEvents.id, receipt.id));
        return result;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await syncSubscription(
          event.data.object as Stripe.Subscription,
          database,
        );
        await database
          .update(providerEvents)
          .set({ processingStatus: "processed", processedAt: new Date() })
          .where(eq(providerEvents.id, receipt.id));
        return { state: "synced" as const };
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await markSubscriptionFrozenFromProvider(
          {
            customerId: subscriptionCustomerId(subscription),
            subscriptionId: subscription.id,
            providerStatus: "canceled",
          },
          database,
        );
        await database
          .update(providerEvents)
          .set({ processingStatus: "processed", processedAt: new Date() })
          .where(eq(providerEvents.id, receipt.id));
        return result;
      }
      default:
        await database
          .update(providerEvents)
          .set({
            processingStatus: "ignored",
            processedAt: new Date(),
          })
          .where(eq(providerEvents.id, receipt.id));
        return { state: "ignored" as const };
    }
  } catch (error) {
    await database
      .update(providerEvents)
      .set({
        processingStatus: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        updatedAt: new Date(),
      })
      .where(eq(providerEvents.id, receipt.id));
    throw error;
  }
}
