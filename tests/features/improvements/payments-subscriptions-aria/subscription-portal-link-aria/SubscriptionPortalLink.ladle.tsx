import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { SubscriptionPortalLink } from "@unveiled/app/components/payments/SubscriptionPortalLink";
import { LanguageContext } from "@unveiled/app/components/unveiled/context-primitives";

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

const meta = {
  component: Harness,
  parameters: { layout: "padded", ladle: { skipCoverage: true } },
  args: {
    language: "EN" as const,
    url: "https://billing.stripe.com/p/login/test_customer_portal",
  },
};

export default meta;

export const PortalLinkIsLabeledExternal: Story<typeof Harness> = () => (
  <Harness
    language="EN"
    url="https://billing.stripe.com/p/login/test_customer_portal"
  />
);

export const PortalLinkMissingFallback: Story<typeof Harness> = () => (
  <Harness
    language="EN"
    url="https://billing.stripe.com/p/login/test_customer_portal"
  />
);

export const PortalLinkLocalizes: Story<typeof Harness> = () => (
  <Harness
    language="DE"
    url="https://billing.stripe.com/p/login/test_customer_portal"
  />
);
