import { PublicDiscoverHeaderPresentational } from "./public-discover-header";
import { makeMockPublicDiscoverHeaderProps } from "./public-discover-header.mock";

export const Default = () => (
  <PublicDiscoverHeaderPresentational
    {...makeMockPublicDiscoverHeaderProps()}
  />
);

export const LongBody = () => (
  <PublicDiscoverHeaderPresentational
    {...makeMockPublicDiscoverHeaderProps({
      body: "This is a much longer body that wraps across multiple lines to demonstrate the prose layout and max-width container of the discover page header. It should still look readable at typical viewport widths.",
    })}
  />
);

export default {
  title: "Organisms / Discovery / Public Discover Header",
  parameters: { ladle: { skipCoverage: true } },
};
