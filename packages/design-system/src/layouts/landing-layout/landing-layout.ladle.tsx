import { LandingLayout } from "./landing-layout";
import { makeMockLandingLayoutProps } from "./landing-layout.mock";

export const Default = () => (
  <LandingLayout {...makeMockLandingLayoutProps()} />
);

export const WithHero = () => (
  <LandingLayout {...makeMockLandingLayoutProps({ hero: true })} />
);

export const Authenticated = () => (
  <LandingLayout
    {...makeMockLandingLayoutProps({
      authenticated: true,
      hero: true,
      children: (
        <p className="text-sm text-brand-dark/70">Welcome back, member.</p>
      ),
    })}
  />
);

export default {
  title: "Layouts / Landing Layout",
  parameters: { layout: "fullscreen", ladle: { skipCoverage: true } },
};
