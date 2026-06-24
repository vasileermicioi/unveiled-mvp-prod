import type { ReactNode } from "react";
import type { LandingLayoutProps } from "./landing-layout.types";

export function makeMockLandingLayoutProps(
  overrides: Partial<LandingLayoutProps> = {},
): LandingLayoutProps {
  const defaultChildren: ReactNode = (
    <p className="text-sm text-brand-dark/70">
      Mock landing content — pass <code>children</code> to populate.
    </p>
  );
  return {
    authenticated: false,
    hero: false,
    children: defaultChildren,
    ...overrides,
  };
}
