import { SubscriptionPortalLinkPresentational } from "./subscription-portal-link";
import { makeMockSubscriptionPortalLinkProps } from "./subscription-portal-link.mock";

export const Default = () => (
  <SubscriptionPortalLinkPresentational
    {...makeMockSubscriptionPortalLinkProps()}
  />
);

export const MissingUrl = () => (
  <SubscriptionPortalLinkPresentational
    {...makeMockSubscriptionPortalLinkProps({ url: null })}
  />
);

export const Inactive = () => (
  <SubscriptionPortalLinkPresentational
    {...makeMockSubscriptionPortalLinkProps({ active: false })}
  />
);

export default {
  title: "Organisms / Payments / Subscription Portal Link",
  parameters: { ladle: { skipCoverage: true } },
};
