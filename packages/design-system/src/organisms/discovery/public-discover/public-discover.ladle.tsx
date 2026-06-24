import { PublicDiscoverPresentational } from "./public-discover";
import { makeMockPublicDiscoverProps } from "./public-discover.mock";

export const Default = () => (
  <PublicDiscoverPresentational {...makeMockPublicDiscoverProps()} />
);

export const NoPagination = () => (
  <PublicDiscoverPresentational
    {...makeMockPublicDiscoverProps({ pagination: undefined })}
  />
);

export default {
  title: "Organisms / Discovery / Public Discover",
  parameters: { ladle: { skipCoverage: true } },
};
