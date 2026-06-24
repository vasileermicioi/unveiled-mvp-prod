import { LandingHeroPresentational } from "./landing-hero";
import { makeMockLandingHeroProps } from "./landing-hero.mock";

export const VisitorSeesHeroWithAppCta = () => (
  <LandingHeroPresentational {...makeMockLandingHeroProps()} />
);

export const VisitorWithReducedMotionSeesStaticHero = () => (
  <LandingHeroPresentational {...makeMockLandingHeroProps()} />
);

export const AuthenticatedVisitorSeesGoToAppLink = () => (
  <LandingHeroPresentational
    {...makeMockLandingHeroProps({ authenticated: true })}
  />
);

export default {
  title: "Organisms / Landing / Hero",
};
