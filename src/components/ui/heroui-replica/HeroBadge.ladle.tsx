// @ladle-only
import { HeroBadge } from "./HeroBadge";
import { storyBackdrop } from "./story-backdrop";

export const Tones = () =>
  storyBackdrop(
    <div className="flex flex-wrap gap-3">
      <HeroBadge tone="dark">Dark</HeroBadge>
      <HeroBadge tone="yellow">Yellow</HeroBadge>
      <HeroBadge tone="white">White</HeroBadge>
      <HeroBadge tone="grey">Grey</HeroBadge>
      <HeroBadge tone="success">Success</HeroBadge>
      <HeroBadge tone="error">Error</HeroBadge>
    </div>,
  );

export default {
  title: "HeroUI / Badge",
  parameters: { ladle: { skipCoverage: true } },
};
