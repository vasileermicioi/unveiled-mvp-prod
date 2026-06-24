import type { LandingHeroProps } from "./landing-hero";

export function makeMockLandingHeroProps(
  overrides: Partial<LandingHeroProps> = {},
): LandingHeroProps {
  return {
    authenticated: false,
    ...overrides,
  };
}
