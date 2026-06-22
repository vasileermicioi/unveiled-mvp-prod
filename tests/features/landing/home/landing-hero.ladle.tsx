// @ladle-only
import type { Story } from "@ladle/react";

import { LandingHero } from "@unveiled/landing/components/landing/landing-hero";

export const VisitorSeesHeroWithAppCta: Story = () => (
  <LandingHero authenticated={false} />
);

export const VisitorWithReducedMotionSeesStaticHero: Story = () => (
  <div className="motion-reduce">
    <LandingHero authenticated={false} />
  </div>
);

export const AuthenticatedVisitorSeesGoToAppLink: Story = () => (
  <LandingHero authenticated={true} />
);

export default {
  title: "landing / LandingHero",
};
