// @ladle-only
import { HeroTab, HeroTabs } from "./HeroTabs";
import { storyBackdrop } from "./story-backdrop";

export const Default = () =>
  storyBackdrop(
    <HeroTabs aria-label="Demo tabs">
      <HeroTab key="upcoming" title="Upcoming">
        Upcoming events content
      </HeroTab>
      <HeroTab key="past" title="Past">
        Past events content
      </HeroTab>
      <HeroTab key="draft" title="Drafts">
        Draft events content
      </HeroTab>
    </HeroTabs>,
  );

export default {
  title: "HeroUI / Tabs",
  parameters: { ladle: { skipCoverage: true } },
};
