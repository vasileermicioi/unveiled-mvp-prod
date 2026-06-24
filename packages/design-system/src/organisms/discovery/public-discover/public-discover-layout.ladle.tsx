import { PublicDiscoverLayoutPresentational } from "./public-discover-layout";
import { makeMockPublicDiscoverLayoutProps } from "./public-discover-layout.mock";

export const Default = () => (
  <PublicDiscoverLayoutPresentational
    {...makeMockPublicDiscoverLayoutProps()}
  />
);

export const EmptyStats = () => (
  <PublicDiscoverLayoutPresentational
    {...makeMockPublicDiscoverLayoutProps({ stats: [] })}
  />
);

export const EmptyPartners = () => (
  <PublicDiscoverLayoutPresentational
    {...makeMockPublicDiscoverLayoutProps({ partners: [] })}
  />
);

export default {
  title: "Organisms / Discovery / Public Discover Layout",
  parameters: { ladle: { skipCoverage: true } },
};
