import type { LandingHeaderProps } from "./landing-header";

export function makeMockLandingHeaderProps(
  overrides: Partial<LandingHeaderProps> = {},
): LandingHeaderProps {
  return {
    authenticated: false,
    ...overrides,
  };
}
