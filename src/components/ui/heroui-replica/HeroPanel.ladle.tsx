// @ladle-only
import { HeroPanel } from "./HeroPanel";
import { storyBackdrop } from "./story-backdrop";

export const Tones = () =>
  storyBackdrop(
    <div className="grid gap-4">
      <HeroPanel tone="white">White panel</HeroPanel>
      <HeroPanel tone="yellow">Yellow panel</HeroPanel>
      <HeroPanel tone="cream">Cream panel</HeroPanel>
      <HeroPanel tone="grey">Grey panel</HeroPanel>
      <HeroPanel tone="dark">Dark panel</HeroPanel>
    </div>,
  );

export const Shadowless = () =>
  storyBackdrop(
    <HeroPanel shadow={false} tone="cream">
      No shadow panel
    </HeroPanel>,
  );

export default {
  title: "HeroUI / Panel",
  parameters: { ladle: { skipCoverage: true } },
};
