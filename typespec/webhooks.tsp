import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;

@jsonSchema
namespace Unveiled.Api.Webhooks;

@doc("Provider event record persisted for idempotency.")
model ProviderEvent {
  @doc("Provider identifier (e.g. `stripe`).")
  provider: string;

  @doc("Provider event id (e.g. `evt_...`).")
  eventId: string;

  @doc("Event type reported by the provider.")
  type: string;

  @doc("Raw event payload as received from the provider.")
  payload: unknown;

  @doc("Receipt timestamp.")
  receivedAt: Timestamp;

  @doc("True once the event has been processed.")
  processed: boolean;
}

@doc("Stripe subscription record (subset of Stripe API response).")
model StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: int64;
  current_period_end: int64;
  cancel_at_period_end: boolean;
  canceled_at?: int64;
  items: {
    data: Array<{
      id: string;
      price: { id: string };
    }>;
  };
}

@doc("Stripe invoice record (subset of Stripe API response).")
model StripeInvoice {
  id: string;
  customer: string;
  subscription: string;
  amount_paid: int64;
  status: string;
  metadata: Record<string>;
}

@doc("Stripe payment method (subset of Stripe API response).")
model StripePaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: int32;
    exp_year: int32;
  };
  sepa_debit?: {
    last4: string;
    bank_code?: string;
  };
}

@doc("Stripe customer (subset of Stripe API response).")
model StripeCustomer {
  id: string;
  email?: Email;
  name?: string;
  address?: {
    country?: CountryCode;
    postal_code?: string;
    city?: string;
    line1?: string;
    line2?: string;
  };
  default_payment_method?: string;
  invoice_settings?: {
    default_payment_method?: string;
  };
}

@doc("Discriminated union of supported Stripe event types.")
union StripeEvent {
  invoice: {
    type: "invoice.paid" | "invoice.payment_succeeded" | "invoice.payment_failed" | "invoice.payment_action_required";
    data: { object: StripeInvoice };
  },
  subscription: {
    type: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted";
    data: { object: StripeSubscription };
  },
  paymentMethod: {
    type: "payment_method.attached" | "payment_method.detached";
    data: { object: StripePaymentMethod };
  },
  customer: {
    type: "customer.updated";
    data: { object: StripeCustomer };
  },
}

@doc("Webhook error envelope.")
@error
model WebhookError {
  message: string;
}

@route("/stripe")
namespace StripeRoutes {
  @route("/webhook")
  @post
  op stripeWebhook(
    @header("stripe-signature") signature: string,
    @header contentType: string,
    @body body: StripeEvent,
  ): { received: boolean } | WebhookError;
}
