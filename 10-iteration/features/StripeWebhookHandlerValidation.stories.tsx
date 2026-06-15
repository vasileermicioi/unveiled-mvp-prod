import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import { StripeEventSchema } from "@/lib/generated/request-validators";

const validInvoicePaidPayload = {
  id: "evt_test_invoice_paid",
  type: "invoice.paid" as const,
  data: { object: { id: "in_test" } },
};

const invalidPayloadMissingType = {
  id: "evt_test_missing_type",
  data: { object: { id: "in_test" } },
};

const SchemaProbe = ({ payload }: { payload: Record<string, unknown> }) => {
  const result = StripeEventSchema.safeParse(payload);
  return (
    <div
      data-accepted={result.success ? "true" : "false"}
      data-error-count={result.success ? 0 : result.error.issues.length}
    />
  );
};

const meta: Meta<typeof SchemaProbe> = {
  title: "Unveiled/StripeWebhookHandlerValidation",
  component: SchemaProbe,
  parameters: { layout: "padded" },
  args: { payload: validInvoicePaidPayload as unknown as Record<string, unknown> },
};

export default meta;
type Story = StoryObj<typeof SchemaProbe>;

export const VerifiedEventPassesSchema: Story = {
  name: "Verified event whose payload matches the contract is accepted by the generated schema",
  play: async ({ canvasElement }) => {
    const probe = canvasElement.querySelector("[data-accepted]");
    await expect(probe?.getAttribute("data-accepted")).toBe("true");
    await expect(probe?.getAttribute("data-error-count")).toBe("0");
  },
};

export const SchemaFailureRejected: Story = {
  name: "Verified event whose payload does not match the contract is rejected by the generated schema",
  args: { payload: invalidPayloadMissingType },
  play: async ({ canvasElement }) => {
    const probe = canvasElement.querySelector("[data-accepted]");
    await expect(probe?.getAttribute("data-accepted")).toBe("false");
    const errorCount = Number(probe?.getAttribute("data-error-count") ?? 0);
    await expect(errorCount).toBeGreaterThan(0);
  },
};
