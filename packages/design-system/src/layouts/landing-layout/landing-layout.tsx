import type { ReactNode } from "react";
import { LandingFooterPresentational } from "../../organisms/landing/landing-footer";
import { LandingHeaderPresentational } from "../../organisms/landing/landing-header";
import { LandingHeroPresentational } from "../../organisms/landing/landing-hero";
import type { LandingLayoutProps } from "./landing-layout.types";

export type { LandingLayoutProps } from "./landing-layout.types";

export function LandingLayout({
  authenticated = false,
  hero = false,
  children,
}: LandingLayoutProps): ReactNode {
  return (
    <>
      <LandingHeaderPresentational authenticated={authenticated} />
      {hero ? (
        <LandingHeroPresentational authenticated={authenticated} />
      ) : null}
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        {children ?? (
          <p className="text-sm text-brand-dark/70">
            Mock landing content — pass <code>children</code> to populate.
          </p>
        )}
      </main>
      <LandingFooterPresentational />
    </>
  );
}
