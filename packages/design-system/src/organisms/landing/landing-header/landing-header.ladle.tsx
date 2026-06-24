import { LandingHeaderPresentational } from "./landing-header";
import { makeMockLandingHeaderProps } from "./landing-header.mock";

export const Default = () => (
  <LandingHeaderPresentational {...makeMockLandingHeaderProps()} />
);

export const Authenticated = () => (
  <LandingHeaderPresentational
    {...makeMockLandingHeaderProps({ authenticated: true })}
  />
);

export default {
  title: "Organisms / Landing / Header",
  parameters: { ladle: { skipCoverage: true } },
};
