import { AppLayout } from "../../layouts/app-layout/app-layout";
import { makeMockAppLayoutProps } from "../../layouts/app-layout/app-layout.mock";
import { SubscriptionPortalLinkPresentational } from "../../organisms/payments/subscription-portal-link/subscription-portal-link";
import { makeMockSubscriptionPortalLinkProps } from "../../organisms/payments/subscription-portal-link/subscription-portal-link.mock";

export const Default = () => (
  <AppLayout
    {...makeMockAppLayoutProps({
      pageHeader: (
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-dark">
          Subscription
        </h1>
      ),
      pageBody: (
        <SubscriptionPortalLinkPresentational
          {...makeMockSubscriptionPortalLinkProps()}
        />
      ),
    })}
  />
);

export default {
  title: "Pages / Payments / Subscription portal",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
