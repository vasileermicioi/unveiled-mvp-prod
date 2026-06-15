import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { SubscriptionPortalLink } from "@/components/payments/SubscriptionPortalLink";
import { LanguageContext } from "@/components/unveiled/context";

const Harness = ({
  language,
  url,
}: {
  language: "DE" | "EN";
  url: string | null;
}) => (
  <LanguageContext.Provider value={language}>
    <SubscriptionPortalLink active={true} url={url} />
  </LanguageContext.Provider>
);

const meta: Meta<typeof Harness> = {
  title: "Unveiled/SubscriptionPortalLink",
  component: Harness,
  parameters: { layout: "padded" },
  args: {
    language: "EN",
    url: "https://billing.stripe.com/p/login/test_customer_portal",
  },
};

export default meta;
type Story = StoryObj<typeof Harness>;

export const PortalLinkIsLabeledExternal: Story = {
  name: "Active member sees a labeled portal link in the manage-subscription region (EN)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: /Manage subscription/i });
    await expect(region).toBeInTheDocument();
    const link = within(region).getByRole("link", {
      name: /Open Stripe customer portal \(external\)/i,
    });
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute("target", "_blank");
  },
};

export const PortalLinkMissingFallback: Story = {
  name: "Missing portal URL still exposes the region with a localized fallback",
  args: { url: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: /Manage subscription/i });
    await expect(region).toBeInTheDocument();
    await expect(
      canvas.getByText(/The Stripe customer portal is currently unavailable\./i),
    ).toBeInTheDocument();
  },
};

export const PortalLinkLocalizes: Story = {
  name: "Portal link accessible name localizes to German",
  args: { language: "DE" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", {
      name: /Mitgliedschaft verwalten/i,
    });
    await expect(region).toBeInTheDocument();
    const link = within(region).getByRole("link", {
      name: /Stripe-Kundenportal öffnen \(extern\)/i,
    });
    await expect(link).toBeInTheDocument();
  },
};
