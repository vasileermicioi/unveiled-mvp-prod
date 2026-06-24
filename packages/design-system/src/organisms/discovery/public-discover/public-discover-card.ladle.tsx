import { PublicDiscoverCardPresentational } from "./public-discover-card";
import { makeMockPublicDiscoverCardProps } from "./public-discover-card.mock";

export const Default = () => (
  <div className="max-w-sm">
    <PublicDiscoverCardPresentational {...makeMockPublicDiscoverCardProps()} />
  </div>
);

export const Saved = () => (
  <div className="max-w-sm">
    <PublicDiscoverCardPresentational
      {...makeMockPublicDiscoverCardProps({
        event: {
          ...makeMockPublicDiscoverCardProps().event,
          saved: true,
        },
      })}
    />
  </div>
);

export const SoldOut = () => (
  <div className="max-w-sm">
    <PublicDiscoverCardPresentational
      {...makeMockPublicDiscoverCardProps({
        event: {
          ...makeMockPublicDiscoverCardProps().event,
          remainingCapacity: 0,
          ctaLabel: "Sold out",
        },
      })}
    />
  </div>
);

export const Expanded = () => (
  <div className="max-w-sm">
    <PublicDiscoverCardPresentational
      {...makeMockPublicDiscoverCardProps({ compact: false })}
    />
  </div>
);

export default {
  title: "Organisms / Discovery / Public Discover Card",
  parameters: { ladle: { skipCoverage: true } },
};
