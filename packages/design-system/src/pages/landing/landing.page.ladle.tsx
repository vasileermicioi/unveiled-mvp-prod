import { LandingLayout } from "../../layouts/landing-layout/landing-layout";
import { makeMockLandingLayoutProps } from "../../layouts/landing-layout/landing-layout.mock";
import { LandingHeroPresentational } from "../../organisms/landing/landing-hero/landing-hero";
import { makeMockLandingHeroProps } from "../../organisms/landing/landing-hero/landing-hero.mock";

export const Default = () => (
  <LandingLayout
    {...makeMockLandingLayoutProps({
      hero: true,
      children: (
        <div className="space-y-6">
          <LandingHeroPresentational {...makeMockLandingHeroProps()} />
          <p className="text-sm text-brand-dark/70">
            Landing content — replace with sections for partners, FAQ, etc.
          </p>
        </div>
      ),
    })}
  />
);

export default {
  title: "Pages / Landing / Landing",
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "desktop" },
    ladle: { skipCoverage: true },
  },
};
