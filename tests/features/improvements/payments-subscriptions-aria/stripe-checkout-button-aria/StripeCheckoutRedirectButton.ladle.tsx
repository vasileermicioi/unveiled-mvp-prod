import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { StripeCheckoutRedirectButton } from "@/components/payments/StripeCheckoutRedirectButton";
import { LanguageContext } from "@/components/unveiled/context-primitives";

const Harness = ({
  language,
  onSubmit,
}: {
  language: "DE" | "EN";
  onSubmit: () => void;
}) => (
  <LanguageContext.Provider value={language}>
    <StripeCheckoutRedirectButton
      selectedPaymentMethod="CARD"
      onPaymentMethodChange={() => {}}
      promoCode=""
      onPromoCodeChange={() => {}}
      onSubmit={onSubmit}
      message=""
    />
  </LanguageContext.Provider>
);

const meta = {
  component: Harness,
  parameters: {
    layout: "padded",
    ladle: {
      skipCoverage: true,
    },
  },
  args: { language: "EN" as const },
};

export default meta;

export const SubmitIsLabeledFormSubmit: Story<typeof Harness> = () => (
  <Harness language="EN" onSubmit={() => {}} />
);

export const SubmitLocalizes: Story<typeof Harness> = () => (
  <Harness language="DE" onSubmit={() => {}} />
);
