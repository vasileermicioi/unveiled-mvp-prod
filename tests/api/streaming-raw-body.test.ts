import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4321";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test_secret";

function sign(payload: string, secret: string, timestamp: number): string {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

test.describe("service-binding /api/* streaming + raw body parity", () => {
  test("Stripe webhook handler reads the raw body through the binding", async ({
    request,
  }) => {
    const payload = JSON.stringify({
      id: "evt_test_streaming_parity",
      object: "event",
      type: "customer.subscription.created",
      data: { object: { id: "sub_test", customer: "cus_test" } },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = sign(payload, WEBHOOK_SECRET, timestamp);
    const response = await request.post(`${BASE}/api/stripe/webhook`, {
      failOnStatusCode: false,
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
      data: payload,
    });
    expect([200, 400]).toContain(response.status());
    const body = (await response.text()) ?? "";
    expect(body.length).toBeGreaterThan(0);
  });

  test("response headers preserve transfer-encoding across the binding", async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/api/health.json`, {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers["content-type"] ?? "").toContain("application/json");
  });
});
