import type { ReactNode } from "react";
import { LandingFooterPresentational } from "../landing-footer";
import { LandingHeaderPresentational } from "../landing-header";
import { LandingHeroPresentational } from "../landing-hero";

export interface LandingTemplateProps {
  authenticated?: boolean;
  hero?: boolean;
  children?: ReactNode;
}

export function LandingTemplate({
  authenticated = false,
  hero = false,
  children,
}: LandingTemplateProps): ReactNode {
  return (
    <>
      <LandingHeaderPresentational authenticated={authenticated} />
      {hero ? (
        <LandingHeroPresentational authenticated={authenticated} />
      ) : null}
      <main className="mx-auto w-full max-w-5xl px-6 py-12">{children}</main>
      <LandingFooterPresentational />
    </>
  );
}
