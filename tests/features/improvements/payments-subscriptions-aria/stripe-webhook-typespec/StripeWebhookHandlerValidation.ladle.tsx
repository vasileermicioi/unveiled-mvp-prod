import type { Story } from "@ladle/react";

import "@/styles/global.css";
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
      className="unveiled-border space-y-2 bg-white p-4 font-mono text-xs"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
        StripeEventSchema.safeParse
      </p>
      <p>
        <span className="font-black uppercase">accepted:</span>{" "}
        {result.success ? "true" : "false"}
      </p>
      <p>
        <span className="font-black uppercase">errors:</span>{" "}
        {result.success ? 0 : result.error.issues.length}
      </p>
      {result.success ? null : (
        <pre className="mt-2 overflow-x-auto border-2 border-brand-dark bg-brand-cream p-2 text-[10px]">
          {result.error.issues
            .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
            .join("\n")}
        </pre>
      )}
    </div>
  );
};

const meta = {
  component: SchemaProbe,
  parameters: { layout: "padded", ladle: { skipCoverage: true } },
  args: {
    payload: validInvoicePaidPayload as unknown as Record<string, unknown>,
  },
};

export default meta;

export const VerifiedEventPassesSchema: Story<typeof SchemaProbe> = () => (
  <SchemaProbe
    payload={validInvoicePaidPayload as unknown as Record<string, unknown>}
  />
);

export const SchemaFailureRejected: Story<typeof SchemaProbe> = () => (
  <SchemaProbe payload={invalidPayloadMissingType} />
);
