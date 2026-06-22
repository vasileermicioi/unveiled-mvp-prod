import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { StripeCheckoutRedirectButton } from "@unveiled/app/components/payments/StripeCheckoutRedirectButton";
import { LanguageContext } from "@unveiled/app/components/unveiled/context-primitives";

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
