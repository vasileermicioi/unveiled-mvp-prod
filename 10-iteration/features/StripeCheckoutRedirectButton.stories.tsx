import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { StripeCheckoutRedirectButton } from "@/components/payments/StripeCheckoutRedirectButton";
import { LanguageContext } from "@/components/unveiled/context";

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

const meta: Meta<typeof Harness> = {
  title: "Unveiled/StripeCheckoutRedirectButton",
  component: Harness,
  parameters: { layout: "padded" },
  args: { language: "EN" },
};

export default meta;
type Story = StoryObj<typeof Harness>;

export const SubmitIsLabeledFormSubmit: Story = {
  name: "Stripe checkout form is a named landmark with a labeled submit button (EN)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", {
      name: /Start Stripe checkout/i,
    });
    await expect(form).toBeInTheDocument();
    const submit = within(form).getByRole("button", {
      name: /Continue to Stripe checkout/i,
    });
    await expect(submit).toBeInTheDocument();
    await expect(submit).toHaveAttribute("type", "submit");
    const radios = within(form).getAllByRole("radio");
    await expect(radios.length).toBe(4);
  },
};

export const SubmitLocalizes: Story = {
  name: "Stripe checkout form landmark and submit copy localize to German",
  args: { language: "DE" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", {
      name: /Stripe-Checkout starten/i,
    });
    await expect(form).toBeInTheDocument();
    const submit = within(form).getByRole("button", {
      name: /Weiter zum Stripe-Checkout/i,
    });
    await expect(submit).toBeInTheDocument();
  },
};
