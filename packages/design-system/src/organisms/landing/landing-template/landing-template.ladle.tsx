import { LandingTemplate } from "./landing-template";

export const Default = () => (
  <LandingTemplate>
    <p className="text-sm text-brand-dark/70">
      Mock landing content — pass <code>children</code> to populate.
    </p>
  </LandingTemplate>
);

export const Authenticated = () => (
  <LandingTemplate authenticated>
    <p className="text-sm text-brand-dark/70">Authenticated landing content.</p>
  </LandingTemplate>
);

export const WithHero = () => (
  <LandingTemplate hero>
    <p className="text-sm text-brand-dark/70">
      Body content rendered after the hero.
    </p>
  </LandingTemplate>
);

export default {
  title: "Organisms / Landing / Template",
  parameters: { ladle: { skipCoverage: true } },
};
